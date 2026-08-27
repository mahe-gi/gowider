import "server-only";
import { MAX_DURATION_SECONDS } from "@/lib/constants";
import type { StorageProvider } from "@/lib/storage";

export interface MediaMetadataResult {
  valid: boolean;
  durationSeconds?: number;
  timescale?: number;
  majorBrand?: string;
  hasMoov?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

interface MvhdParseResult {
  found: boolean;
  timescale?: number;
  durationSeconds?: number;
}

/**
 * Parses 'mvhd' atom payload from a buffer containing the 'moov' atom.
 */
function parseMvhdFromMoovBuffer(moovBuf: Buffer, moovHeaderSize: number): MvhdParseResult {
  const moovSize = moovBuf.length;
  let childOffset = moovHeaderSize;

  while (childOffset <= moovSize - 8) {
    let childSize = moovBuf.readUInt32BE(childOffset);
    const childType = moovBuf.toString("latin1", childOffset + 4, childOffset + 8);
    let childHeaderSize = 8;

    if (childSize === 1) {
      if (childOffset + 16 > moovSize) break;
      const high = moovBuf.readUInt32BE(childOffset + 8);
      const low = moovBuf.readUInt32BE(childOffset + 12);
      childSize = high * 2 ** 32 + low;
      childHeaderSize = 16;
    } else if (childSize === 0) {
      childSize = moovSize - childOffset;
    }

    if (childType === "mvhd") {
      const payloadStart = childOffset + childHeaderSize;
      if (payloadStart >= moovSize) break;

      const version = moovBuf.readUInt8(payloadStart);

      if (version === 0) {
        // Version 0 (32-bit):
        // [1 byte version] [3 bytes flags] [4 bytes creation] [4 bytes modification]
        // [4 bytes timescale @ payloadStart + 12] [4 bytes duration @ payloadStart + 16]
        if (payloadStart + 20 <= moovSize) {
          const timescale = moovBuf.readUInt32BE(payloadStart + 12);
          const durationUnits = moovBuf.readUInt32BE(payloadStart + 16);
          if (timescale > 0) {
            return {
              found: true,
              timescale,
              durationSeconds: durationUnits / timescale,
            };
          }
        }
      } else if (version === 1) {
        // Version 1 (64-bit):
        // [1 byte version] [3 bytes flags] [8 bytes creation] [8 bytes modification]
        // [4 bytes timescale @ payloadStart + 20] [8 bytes duration @ payloadStart + 24]
        if (payloadStart + 32 <= moovSize) {
          const timescale = moovBuf.readUInt32BE(payloadStart + 20);
          const durationHigh = moovBuf.readUInt32BE(payloadStart + 24);
          const durationLow = moovBuf.readUInt32BE(payloadStart + 28);
          const durationUnits = durationHigh * 2 ** 32 + durationLow;
          if (timescale > 0) {
            return {
              found: true,
              timescale,
              durationSeconds: durationUnits / timescale,
            };
          }
        }
      }
      break;
    }

    if (childSize < childHeaderSize || childOffset + childSize > moovSize) break;
    childOffset += childSize;
  }

  return { found: false };
}

/**
 * Validates calculated duration against system business rules.
 */
function validateDuration(durationSeconds: number, timescale?: number, majorBrand?: string): MediaMetadataResult {
  const roundedDuration = Math.ceil(durationSeconds);

  if (roundedDuration < 1) {
    return {
      valid: false,
      durationSeconds: roundedDuration,
      errorCode: "VIDEO_TOO_SHORT",
      errorMessage: "Video duration must be at least 1 second.",
    };
  }

  if (roundedDuration > MAX_DURATION_SECONDS) {
    return {
      valid: false,
      durationSeconds: roundedDuration,
      errorCode: "VIDEO_TOO_LONG",
      errorMessage: `Video duration (${roundedDuration}s) exceeds maximum allowed limit of ${MAX_DURATION_SECONDS}s.`,
    };
  }

  return {
    valid: true,
    durationSeconds: roundedDuration,
    timescale,
    majorBrand,
    hasMoov: true,
  };
}

/**
 * Server-authoritative Random-Access ISO BMFF atom parser.
 * Traverses top-level atoms (ftyp, mdat, moov) using range reads without downloading full media payloads.
 */
export async function parseMediaFromStorage(
  storage: StorageProvider,
  key: string,
  totalSizeBytes: number
): Promise<MediaMetadataResult> {
  try {
    if (totalSizeBytes < 16) {
      return {
        valid: false,
        errorCode: "VIDEO_METADATA_INVALID",
        errorMessage: "File is too small to be a valid MP4/MOV container.",
      };
    }

    let offset = 0;
    let majorBrand = "";
    let mvhdResult: MvhdParseResult = { found: false };
    let hops = 0;
    const maxHops = 100;

    while (offset < totalSizeBytes - 8 && hops < maxHops) {
      hops++;

      // Read up to 16 bytes for atom size and type header
      const headerBuf = await storage.readRange(
        key,
        offset,
        Math.min(offset + 15, totalSizeBytes - 1)
      );

      if (headerBuf.length < 8) break;

      let size = headerBuf.readUInt32BE(0);
      const type = headerBuf.toString("latin1", 4, 8);
      let headerSize = 8;

      if (size === 1) {
        // 64-bit large size
        if (headerBuf.length < 16) break;
        const high = headerBuf.readUInt32BE(8);
        const low = headerBuf.readUInt32BE(12);
        size = high * 2 ** 32 + low;
        headerSize = 16;
      } else if (size === 0) {
        // Extends to end of file
        size = totalSizeBytes - offset;
      }

      // Safety check: Atom size must be at least header size and cannot exceed file bounds
      if (size < headerSize || offset + size > totalSizeBytes) {
        break;
      }

      if (type === "ftyp") {
        if (headerBuf.length >= 12) {
          majorBrand = headerBuf.toString("latin1", 8, Math.min(12, headerBuf.length));
        }
        offset += size;
      } else if (type === "moov") {
        // Read only the 'moov' atom (metadata container, typically <2MB)
        const moovBuf = await storage.readRange(key, offset, offset + size - 1);
        mvhdResult = parseMvhdFromMoovBuffer(moovBuf, headerSize);
        if (mvhdResult.found) {
          break;
        }
        offset += size;
      } else {
        // For 'mdat', 'free', 'skip', etc.: Skip payload without reading it
        offset += size;
      }
    }

    if (!mvhdResult.found || !mvhdResult.durationSeconds || mvhdResult.durationSeconds <= 0) {
      return {
        valid: false,
        errorCode: "VIDEO_METADATA_INVALID",
        errorMessage: "Unable to parse authoritative video duration from media header.",
      };
    }

    return validateDuration(mvhdResult.durationSeconds, mvhdResult.timescale, majorBrand);
  } catch (err: any) {
    console.error("Storage media parse error:", err);
    return {
      valid: false,
      errorCode: "VIDEO_METADATA_INVALID",
      errorMessage: err.message || "Failed to parse video metadata from storage.",
    };
  }
}

/**
 * Buffer-based parser (for in-memory unit tests and small buffers).
 */
export function parseMp4MovMetadata(buffer: Buffer): MediaMetadataResult {
  try {
    let offset = 0;
    const length = buffer.length;
    let majorBrand = "";
    let mvhdResult: MvhdParseResult = { found: false };

    while (offset <= length - 8) {
      let size = buffer.readUInt32BE(offset);
      const type = buffer.toString("latin1", offset + 4, offset + 8);
      let headerSize = 8;

      if (size === 1) {
        if (offset + 16 > length) break;
        const high = buffer.readUInt32BE(offset + 8);
        const low = buffer.readUInt32BE(offset + 12);
        size = high * 2 ** 32 + low;
        headerSize = 16;
      } else if (size === 0) {
        size = length - offset;
      }

      if (size < headerSize || offset + size > length) break;

      if (type === "ftyp") {
        majorBrand = buffer.toString("latin1", offset + 8, Math.min(offset + 12, length));
        offset += size;
      } else if (type === "moov") {
        const moovBuf = buffer.subarray(offset, offset + size);
        mvhdResult = parseMvhdFromMoovBuffer(moovBuf, headerSize);
        if (mvhdResult.found) break;
        offset += size;
      } else {
        offset += size;
      }
    }

    if (!mvhdResult.found || !mvhdResult.durationSeconds || mvhdResult.durationSeconds <= 0) {
      return {
        valid: false,
        errorCode: "VIDEO_METADATA_INVALID",
        errorMessage: "Unable to parse authoritative video duration from media header.",
      };
    }

    return validateDuration(mvhdResult.durationSeconds, mvhdResult.timescale, majorBrand);
  } catch (err: any) {
    return {
      valid: false,
      errorCode: "VIDEO_METADATA_INVALID",
      errorMessage: err.message || "Failed to parse video metadata.",
    };
  }
}
