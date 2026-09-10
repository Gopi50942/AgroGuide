import { describe, it, expect } from "vitest";
import { computeCropProgress } from "@/lib/utils/cropLifecycle";
import type { Crop } from "@/types";

describe("Crop Lifecycle Calculations", () => {
  it("computes day number and appropriate stage for recently sown crop", () => {
    const today = new Date().toISOString().slice(0, 10);
    const mockCrop: Crop = {
      id: "c1",
      farmId: "f1",
      name: "Tomato",
      stage: "sowing",
      dayNumber: 1,
      sowingDate: today,
    };

    const progress = computeCropProgress(mockCrop);
    expect(progress.dayNumber).toBeGreaterThanOrEqual(0);
    expect(progress.stage).toBe("sowing");
  });

  it("handles missing sowing date without crashing", () => {
    const mockCrop: Crop = {
      id: "c2",
      farmId: "f1",
      name: "Paddy",
      stage: "tillering",
      dayNumber: 30,
      sowingDate: "",
    };

    const progress = computeCropProgress(mockCrop);
    expect(progress.stage).toBe("tillering");
    expect(progress.dayNumber).toBe(30);
  });
});
