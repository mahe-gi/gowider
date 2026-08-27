import "server-only";
import { MAX_DURATION_SECONDS } from "@/lib/constants";

export interface MediaMetadataResult {
  valid: boolean;
  durationSeconds?: number;
  timescale?: number;
  majorBrand?: string;
  hasMoov?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Lightweight ISO Base Media File Format (MP4 / QuickTime MOV) parser.
 * Extracts authoritative duration from the 'mvhd' (Movie Header Box) atom without FFmpeg.
 */
export function parseMp4MovMetadata(buffer: Buffer): MediaMetadataResult {
  try {
    let offset = 0;
    const length = buffer.length;
    let majorBrand = "";
    let mvhdFound = false;
    let durationSeconds = 0;
    let timescale = 1000;

    while (offset < length - 8) {
      let size = buffer.readUInt32BE(offset);
      const type = buffer.toString("latin1", offset + 4, offset + 8);

      if (size === 1) {
        // 64-bit large size
        if (offset + 16 > length) break;
        const high = buffer.readUInt32BE(offset + 8);
        const low = buffer.readUInt32BE(offset + 12);
        size = high * 2 ** 32 + low;
      } else if (size === 0) {
        // Extends to end of file
        size = length - offset;
      }

      if (type === "ftyp") {
        majorBrand = buffer.toString("latin1", offset + 8, Math.min(offset + 12, length));
      } else if (type === "moov") {
        // Search inside 'moov' for 'mvhd'
        const moovEnd = offset + size;
        let moovOffset = offset + 8;

        while (moovOffset < moovEnd - 8 && moovOffset < length - 8) {
          let innerSize = buffer.readUInt32BE(moovOffset);
          const innerType = buffer.toString("latin1", moovOffset + 4, moovOffset + 8);

          if (innerSize === 1) {
            innerSize = buffer.readUInt32BE(moovOffset + 8) * 2 ** 32 + buffer.readUInt32BE(moovOffset + 12);
          } else if (innerSize === 0) {
            innerSize = moovEnd - moovOffset;
          }

          if (innerType === "mvhd") {
            mvhdFound = true;
            const version = buffer.readUInt8(moovOffset + 8);

            if (version === 0) {
              // 32-bit creation, modification, timescale, duration
              timescale = buffer.readUInt32BE(moovOffset + 20);
              const durationUnits = buffer.readUInt32BE(moovOffset + 24);
              if (timescale > 0) {
                durationSeconds = durationUnits / timescale;
              }
            } else if (version === 1) {
              // 64-bit creation, modification, 32-bit timescale, 64-bit duration
              timescale = buffer.readUInt32BE(moovOffset + 28);
              const durationHigh = buffer.readUInt32BE(moovOffset + 32);
              const durationLow = buffer.readUInt32BE(moovOffset + 36);
              const durationUnits = durationHigh * 2 ** 32 + durationLow;
              if (timescale > 0) {
                durationSeconds = durationUnits / timescale;
              }
            }
            break;
          }

          if (innerSize <= 0) break;
          moovOffset += innerSize;
        }
      }

      if (mvhdFound || size <= 0) break;
      offset += size;
    }

    if (!mvhdFound || durationSeconds <= 0) {
      return {
        valid: false,
        errorCode: "VIDEO_METADATA_INVALID",
        errorMessage: "Unable to parse authoritative video duration from media header.",
      };
    }

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
        errorMessage: `Video duration (${roundedDuration}s) exceeds maximum allowed duration of ${MAX_DURATION_SECONDS}s.`,
      };
    }

    return {
      valid: true,
      durationSeconds: roundedDuration,
      timescale,
      majorBrand,
      hasMoov: true,
    };
  } catch (err: any) {
    console.error("Error parsing video metadata:", err);
    return {
      valid: false,
      errorCode: "VIDEO_METADATA_INVALID",
      errorMessage: err.message || "Failed to parse video metadata.",
    };
  }
}
