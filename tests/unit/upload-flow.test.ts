import { describe, it, expect } from "vitest";
import { checkR2ObjectExists, createPresignedUploadUrl } from "@/lib/r2/uploads";
import { parseMp4MovMetadata } from "@/lib/media/metadata";

describe("Upload & Storage Workflow Resilience", () => {
  it("generates presigned upload URL for supported MIME types", async () => {
    const url = await createPresignedUploadUrl({
      key: "sources/test_user/test_proj/video.mp4",
      contentType: "video/mp4",
    });

    expect(url).toBeDefined();
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it("handles non-existent objects safely without throwing unhandled exceptions", async () => {
    const check = await checkR2ObjectExists("sources/non_existent_path/video.mp4");
    expect(check.exists).toBe(false);
  });
});
