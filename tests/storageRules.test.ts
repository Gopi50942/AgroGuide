import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Phase 87 — Firebase Storage Rules Security & Policy Audit", () => {
  const storageRulesPath = path.resolve(process.cwd(), "storage.rules");
  const storageContent = fs.readFileSync(storageRulesPath, "utf-8");

  it("verifies storage.rules enforces size and MIME boundaries", () => {
    expect(storageContent).toContain("request.resource.size < 10 * 1024 * 1024");
    expect(storageContent).toContain("request.resource.contentType.matches('image/.*')");
    expect(storageContent).toContain("application/pdf");
  });

  it("enforces user folder isolation on private media paths", () => {
    expect(storageContent).toContain("/farm-images/{uid}/{fileName}");
    expect(storageContent).toContain("/crop-images/{uid}/{fileName}");
    expect(storageContent).toContain("/users/{uid}/farm-diary/");
  });

  it("denies unauthenticated or root access wildcard matching", () => {
    expect(storageContent).toContain("match /{allPaths=**} {");
    expect(storageContent).toContain("allow read, write: if false;");
  });
});
