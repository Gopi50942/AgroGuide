import { describe, it, expect } from "vitest";
import { aggregateFarmTimeline } from "@/lib/services/timelineService";

describe("Phase 28 — Unified Farm Activity Timeline", () => {
  it("aggregates disparate farm records into chronological timeline events", () => {
    const crops = [
      {
        id: "crop_1",
        ownerId: "farmer_1",
        farmId: "farm_1",
        name: "Tomato Hybrid",
        sowingDate: "2026-06-01",
        stage: "flowering" as const,
        areaAcres: 2,
        currentDay: 45,
        estimatedDurationDays: 130,
        createdAt: "2026-06-01T00:00:00Z",
      },
    ];

    const tasks = [
      {
        id: "task_1",
        ownerId: "farmer_1",
        farmId: "farm_1",
        cropId: "crop_1",
        cropName: "Tomato Hybrid",
        title: "Basal Fertigation",
        category: "fertilization",
        dueDate: "2026-06-15",
        completed: true,
      },
    ];

    const expenses = [
      {
        id: "exp_1",
        ownerId: "farmer_1",
        category: "fertilizers" as const,
        amount: 2500,
        date: "2026-06-15",
        note: "Water soluble fertilizer",
      },
    ];

    const events = aggregateFarmTimeline({
      crops,
      tasks,
      expenses,
    });

    expect(events.length).toBe(3);
    // Chronological sort: 2026-06-15 should appear before 2026-06-01
    expect(events[0].date).toBe("2026-06-15");
    expect(events[events.length - 1].date).toBe("2026-06-01");
  });

  it("filters timeline events by crop ID and event type", () => {
    const crops = [
      {
        id: "crop_a",
        ownerId: "farmer_1",
        farmId: "farm_1",
        name: "Tomato",
        sowingDate: "2026-06-01",
        stage: "flowering" as const,
        areaAcres: 1,
        currentDay: 30,
        estimatedDurationDays: 120,
        createdAt: "2026-06-01",
      },
      {
        id: "crop_b",
        ownerId: "farmer_1",
        farmId: "farm_1",
        name: "Paddy",
        sowingDate: "2026-07-01",
        stage: "sowing" as const,
        areaAcres: 3,
        currentDay: 5,
        estimatedDurationDays: 135,
        createdAt: "2026-07-01",
      },
    ];

    const filtered = aggregateFarmTimeline(
      { crops },
      { cropId: "crop_b" }
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].cropId).toBe("crop_b");
  });
});
