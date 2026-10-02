import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isProviderId, parseProviderIds } from "./provider-id.ts";

describe("provider IDs", () => {
  test("accepts convention IDs and rejects malformed ones", () => {
    for (const id of ["vercel.com/api", "linear.app/mcp", "google.com/gmail/api", "local/foo-3000"]) {
      expect(isProviderId(id)).toBe(true);
    }
    for (const id of ["Vercel.com/api", "prv_abc123", "vercel.com//api", "/api", "vercel.com/api/", "a b", "", "x".repeat(256)]) {
      expect(isProviderId(id)).toBe(false);
    }
  });

  test("parseProviderIds fails on a bad ID instead of shipping it", () => {
    expect(parseProviderIds({ entries: { "mcp/x": "x.com/mcp" } }).get("mcp/x")).toBe("x.com/mcp");
    expect(() => parseProviderIds({ entries: { "mcp/x": "X.com/MCP" } })).toThrow(/invalid provider IDs/);
    expect(() => parseProviderIds([])).toThrow();
  });

  test("the checked-in mapping is valid", () => {
    const json = JSON.parse(readFileSync(join(import.meta.dir, "../../provider-ids.json"), "utf8"));
    expect(parseProviderIds(json).size).toBeGreaterThan(0);
  });
});
