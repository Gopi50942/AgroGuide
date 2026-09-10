import { describe, it, expect } from "vitest";
import { AI_READ_ONLY_TOOLS, executeAiReadOnlyTool } from "@/lib/ai/tools";

describe("Phase 30 — AI Level 4 Read-Only Tools", () => {
  it("defines read-only tools with valid property schemas", () => {
    expect(AI_READ_ONLY_TOOLS.length).toBeGreaterThanOrEqual(5);

    AI_READ_ONLY_TOOLS.forEach((tool) => {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.parameters.type).toBe("object");
      // All tools must be read-only retrieval functions
      expect(tool.name.startsWith("get_") || tool.name.startsWith("fetch_") || tool.name.startsWith("calculate_")).toBe(true);
    });
  });

  it("safely executes calculate water budget read-only tool", async () => {
    const res = await executeAiReadOnlyTool("get_irrigation_recommendation", {
      cropName: "Tomato",
      stage: "flowering",
      areaAcres: 2,
      irrigationMethod: "Drip Irrigation",
    });

    expect(res.success).toBe(true);
    expect(res.result).toBeDefined();
    expect(res.result.dailyVolumeLitres).toBeGreaterThan(0);
    expect(res.result.recommendationEn).toBeDefined();
  });

  it("blocks and rejects any unauthorized or mutative tool invocation", async () => {
    const res = await executeAiReadOnlyTool("delete_farmer_account", { uid: "123" });

    expect(res.success).toBe(false);
    expect(res.error).toContain("not an authorized read-only tool");
  });
});
