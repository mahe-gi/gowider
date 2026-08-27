import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), ".media_cache");

function validateStorageKey(rawKey: string, userId: string): { safePath: string; isValid: boolean } {
  // Reject path traversal
  if (rawKey.includes("..") || path.isAbsolute(rawKey)) {
    return { safePath: "", isValid: false };
  }

  // Enforce ownership prefix: must belong to the user's sources or outputs
  const isUserSource = rawKey.startsWith(`sources/${userId}/`);
  const isOutput = rawKey.startsWith("outputs/");

  if (!isUserSource && !isOutput) {
    return { safePath: "", isValid: false };
  }

  const safePath = path.resolve(LOCAL_STORAGE_DIR, rawKey);

  // Ensure resolved path is strictly within LOCAL_STORAGE_DIR
  if (!safePath.startsWith(LOCAL_STORAGE_DIR)) {
    return { safePath: "", isValid: false };
  }

  return { safePath, isValid: true };
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    if (env.STORAGE_DRIVER !== "local" || process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Direct local storage is disabled." }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { key: keyParts } = await params;
    const rawKey = keyParts.join("/");

    const { safePath, isValid } = validateStorageKey(rawKey, session.user.id);
    if (!isValid) {
      return NextResponse.json({ error: "Forbidden storage path." }, { status: 403 });
    }

    // Verify Content-Length
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 100 MB maximum limit." }, { status: 400 });
    }

    const dir = path.dirname(safePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!req.body) {
      return NextResponse.json({ error: "Missing request body." }, { status: 400 });
    }

    // Stream directly to disk to prevent buffering 100MB into memory
    const writeStream = fs.createWriteStream(safePath);
    const nodeReadable = Readable.fromWeb(req.body as any);
    await pipeline(nodeReadable, writeStream);

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error("Local direct-storage PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to write file." }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { key: keyParts } = await params;
    const rawKey = keyParts.join("/");

    const { safePath, isValid } = validateStorageKey(rawKey, session.user.id);
    if (!isValid || !fs.existsSync(safePath)) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const stat = fs.statSync(safePath);
    const contentType = rawKey.endsWith(".mov")
      ? "video/quicktime"
      : rawKey.endsWith(".srt")
      ? "text/plain"
      : "video/mp4";

    const stream = fs.createReadStream(safePath);
    const webStream = Readable.toWeb(stream) as any;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
      },
    });
  } catch (error: any) {
    console.error("Local direct-storage GET error:", error);
    return NextResponse.json({ error: "Failed to read file." }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "PUT, GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
