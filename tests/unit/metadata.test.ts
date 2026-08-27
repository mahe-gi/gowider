import { describe, it, expect } from "vitest";
import { parseMp4MovMetadata } from "@/lib/media/metadata";

function createMockMp4Buffer(durationUnits: number, timescale: number): Buffer {
  // Construct a minimal valid MP4 buffer with ftyp and moov/mvhd atoms
  // ftyp atom (16 bytes)
  const ftyp = Buffer.alloc(16);
  ftyp.writeUInt32BE(16, 0);
  ftyp.write("ftyp", 4);
  ftyp.write("isom", 8);

  // mvhd atom (version 0: 108 bytes)
  const mvhd = Buffer.alloc(108);
  mvhd.writeUInt32BE(108, 0); // size
  mvhd.write("mvhd", 4); // type
  mvhd.writeUInt8(0, 8); // version 0
  mvhd.writeUInt32BE(timescale, 20); // timescale
  mvhd.writeUInt32BE(durationUnits, 24); // duration

  // moov atom wrapping mvhd (8 + 108 = 116 bytes)
  const moov = Buffer.alloc(8);
  moov.writeUInt32BE(116, 0);
  moov.write("moov", 4);

  return Buffer.concat([ftyp, moov, mvhd]);
}

describe("Media Metadata Parser (ISO BMFF / QuickTime)", () => {
  it("correctly parses duration from 45-second MP4 header", () => {
    // 45 seconds at 1000 timescale = 45000 units
    const buffer = createMockMp4Buffer(45000, 1000);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(45);
    expect(metadata.timescale).toBe(1000);
  });

  it("correctly parses duration from fractional duration (e.g. 14.2s rounds up to 15s)", () => {
    // 14.2 seconds at 600 timescale = 8520 units
    const buffer = createMockMp4Buffer(8520, 600);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(true);
    expect(metadata.durationSeconds).toBe(15);
  });

  it("rejects video exceeding 90 seconds boundary", () => {
    // 95 seconds at 1000 timescale
    const buffer = createMockMp4Buffer(95000, 1000);
    const metadata = parseMp4MovMetadata(buffer);

    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_TOO_LONG");
  });

  it("rejects corrupted/empty buffer", () => {
    const emptyBuffer = Buffer.alloc(32);
    const metadata = parseMp4MovMetadata(emptyBuffer);

    expect(metadata.valid).toBe(false);
    expect(metadata.errorCode).toBe("VIDEO_METADATA_INVALID");
  });
});
