import { describe, it, expect } from "vitest";
import path from "path";
import { storage } from "@/lib/storage";

describe("Storage Architecture & Security Invariants", () => {
  it("provides upload target and check methods on unified StorageProvider", async () => {
    expect(storage.createUploadTarget).toBeDefined();
    expect(storage.checkObjectExists).toBeDefined();
    expect(storage.getObjectStream).toBeDefined();
    expect(storage.deleteObject).toBeDefined();
    expect(storage.createDownloadUrl).toBeDefined();
  });

  it("handles non-existent keys cleanly without throwing unhandled exceptions", async () => {
    const res = await storage.checkObjectExists("sources/non_existent/non_existent.mp4");
    expect(res.exists).toBe(false);
  });
});
