import { describe, it, expect } from "vitest";
import { parseMp4MovMetadata, parseMediaFromStorage } from "@/lib/media/metadata";
import type { StorageProvider } from "@/lib/storage";
import fs from "fs";
import path from "path";

function createFtypAtom(): Buffer {
  const ftyp = Buffer.alloc(16);
  ftyp.writeUInt32BE(16, 0);
  ftyp.write("ftyp", 4);
  ftyp.write("isom", 8);
  return ftyp;
}

function createMvhdV0Atom(durationUnits: number, timescale: number): Buffer {
  const mvhd = Buffer.alloc(108);
  mvhd.writeUInt32BE(108, 0);
  mvhd.write("mvhd", 4);
  mvhd.writeUInt8(0, 8); // version 0
  // payload start is at 8 (header size is 8)
  // timescale at payload + 12 = 20
  mvhd.writeUInt32BE(timescale, 20);
  // duration at payload + 16 = 24
  mvhd.writeUInt32BE(durationUnits, 24);
  return mvhd;
}

function createMvhdV1Atom(durationUnits: number, timescale: number): Buffer {
  const mvhd = Buffer.alloc(120);
  mvhd.writeUInt32BE(120, 0);
  mvhd.write("mvhd", 4);
  mvhd.writeUInt8(1, 8); // version 1
  // timescale at payload + 20 = 28
  mvhd.writeUInt32BE(timescale, 28);
  // 64-bit duration at payload + 24 = 32
  const high = Math.floor(durationUnits / 2 ** 32);
  const low = durationUnits >>> 0;
  mvhd.writeUInt32BE(high, 32);
  mvhd.writeUInt32BE(low, 36);
  return mvhd;
}

function createMoovAtom(mvhd: Buffer): Buffer {
  const moov = Buffer.alloc(8);
  moov.writeUInt32BE(8 + mvhd.length, 0);
  moov.write("moov", 4);
  return Buffer.concat([moov, mvhd]);
}

function createMdatAtom(sizeBytes: number): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(sizeBytes, 0);
  header.write("mdat", 4);
  // Create sparse buffer or dummy padding
  const padding = Buffer.alloc(Math.max(0, sizeBytes - 8));
  return Buffer.concat([header, padding]);
}

describe("Media Metadata Parser (ISO BMFF / QuickTime)", () => {
  it("1. Parses moov at beginning of file", () => {
    const ftyp = createFtypAtom();
    const mvhd = createMvhdV0Atom(30000, 1000); // 30s
    const moov = createMoovAtom(mvhd);
    const mdat = createMdatAtom(100);

    const buffer = Buffer.concat([ftyp, moov, mdat]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(30);
  });

  it("2. Parses moov after >2 MB mdat using Mock Storage Range Reader", async () => {
    const ftyp = createFtypAtom();
    const mdatSize = 3 * 1024 * 1024; // 3 MB mdat
    const mdatHeader = Buffer.alloc(8);
    mdatHeader.writeUInt32BE(mdatSize, 0);
    mdatHeader.write("mdat", 4);

    const mvhd = createMvhdV0Atom(45000, 1000); // 45s
    const moov = createMoovAtom(mvhd);

    const totalSize = ftyp.length + mdatSize + moov.length;

    // Virtual Storage Provider that simulates 3MB mdat without allocating 3MB RAM
    const mockStorage: StorageProvider = {
      createUploadTarget: async () => "",
      checkObjectExists: async () => ({ exists: true, sizeBytes: totalSize }),
      getObjectStream: async () => ({ stream: null as any }),
      saveFromUrl: async () => true,
      readRange: async (key: string, start: number, endInclusive: number) => {
        const length = endInclusive - start + 1;
        const result = Buffer.alloc(length);

        for (let i = 0; i < length; i++) {
          const absPos = start + i;
          if (absPos < ftyp.length) {
            result[i] = ftyp[absPos];
          } else if (absPos < ftyp.length + 8) {
            result[i] = mdatHeader[absPos - ftyp.length];
          } else if (absPos < ftyp.length + mdatSize) {
            result[i] = 0; // mdat body
          } else if (absPos < totalSize) {
            result[i] = moov[absPos - (ftyp.length + mdatSize)];
          }
        }
        return result;
      },
      deleteObject: async () => true,
      createDownloadUrl: async () => "",
    };

    const metadata = await parseMediaFromStorage(mockStorage, "test.mp4", totalSize);
    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(45);
  });

  it("3. Parses moov near EOF", () => {
    const ftyp = createFtypAtom();
    const mdat = createMdatAtom(500);
    const mvhd = createMvhdV0Atom(20000, 1000); // 20s
    const moov = createMoovAtom(mvhd);

    const buffer = Buffer.concat([ftyp, mdat, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(20);
  });

  it("4. Correctly parses mvhd version 0 (32-bit timescale and duration)", () => {
    const ftyp = createFtypAtom();
    const mvhd = createMvhdV0Atom(14200, 1000); // 14.2s -> rounds to 15s
    const moov = createMoovAtom(mvhd);

    const buffer = Buffer.concat([ftyp, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(15);
    expect(metadata.timescale).toBe(1000);
  });

  it("5. Correctly parses mvhd version 1 (64-bit timescale and duration)", () => {
    const ftyp = createFtypAtom();
    const mvhd = createMvhdV1Atom(60000, 1000); // 60s
    const moov = createMoovAtom(mvhd);

    const buffer = Buffer.concat([ftyp, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(60);
  });

  it("6. Rejects malformed atom size", () => {
    const malformed = Buffer.alloc(32);
    malformed.writeUInt32BE(2, 0); // Invalid size < 8
    malformed.write("moov", 4);

    const metadata = parseMp4MovMetadata(malformed);
    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_METADATA_INVALID");
  });

  it("7. Rejects missing moov atom", () => {
    const ftyp = createFtypAtom();
    const mdat = createMdatAtom(200);

    const buffer = Buffer.concat([ftyp, mdat]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_METADATA_INVALID");
  });

  it("8. Rejects moov atom with missing mvhd child", () => {
    const ftyp = createFtypAtom();
    const dummyChild = Buffer.alloc(16);
    dummyChild.writeUInt32BE(16, 0);
    dummyChild.write("udta", 4);

    const moov = createMoovAtom(dummyChild);
    const buffer = Buffer.concat([ftyp, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_METADATA_INVALID");
  });

  it("9. Accepts video of exactly 90 seconds", () => {
    const ftyp = createFtypAtom();
    const mvhd = createMvhdV0Atom(90000, 1000); // exactly 90s
    const moov = createMoovAtom(mvhd);

    const buffer = Buffer.concat([ftyp, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(90);
  });

  it("10. Rejects video exceeding 90 seconds limit", () => {
    const ftyp = createFtypAtom();
    const mvhd = createMvhdV0Atom(91000, 1000); // 91s
    const moov = createMoovAtom(mvhd);

    const buffer = Buffer.concat([ftyp, moov]);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_TOO_LONG");
  });

  it("11. Verifies REAL cached video file (28MB with moov at offset 29.2MB)", async () => {
    const realFilePath = path.resolve(
      process.cwd(),
      ".media_cache/sources/usr_UipR0H4sNPVefRcp/proj_WX5yMp4ozpyMtWe9/ioPdNKBW1PAf.mp4"
    );

    if (fs.existsSync(realFilePath)) {
      const stats = fs.statSync(realFilePath);
      const fileHandle = await fs.promises.open(realFilePath, "r");

      const realStorage: StorageProvider = {
        createUploadTarget: async () => "",
        checkObjectExists: async () => ({ exists: true, sizeBytes: stats.size }),
        getObjectStream: async () => ({ stream: null as any }),
        readRange: async (key: string, start: number, endInclusive: number) => {
          const length = endInclusive - start + 1;
          const buffer = Buffer.alloc(length);
          const { bytesRead } = await fileHandle.read(buffer, 0, length, start);
          return buffer.subarray(0, bytesRead);
        },
        deleteObject: async () => true,
        saveFromUrl: async () => true,
        createDownloadUrl: async () => "",
      };

      try {
        const metadata = await parseMediaFromStorage(realStorage, "real.mp4", stats.size);
        expect(metadata.valid).toBe(true);
        // The real Snapchat video is 46.02s which rounds up to 47 seconds
        expect(metadata.durationSeconds).toBe(47);
        expect(metadata.timescale).toBe(600);
        expect(metadata.hasMoov).toBe(true);
      } finally {
        await fileHandle.close();
      }
    }
  });
});
