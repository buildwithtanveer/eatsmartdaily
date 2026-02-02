import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("/api/posts route regression", () => {
  it("does not use author: true include (prevents leaking user.password)", () => {
    const filePath = path.join(process.cwd(), "src", "app", "api", "posts", "route.ts");
    const contents = fs.readFileSync(filePath, "utf8");
    expect(contents).not.toContain("author: true");
    expect(contents).not.toContain("password");
  });
});

