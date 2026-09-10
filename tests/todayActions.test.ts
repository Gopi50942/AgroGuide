import { describe, it, expect } from "vitest";
import { aggregateTodayActions } from "@/lib/services/todayActionService";
import type { CropTask, WeatherAlert } from "@/types";

describe("Phase 67 — Today Action Cockpit Aggregator", () => {
  it("aggregates incomplete tasks and active weather notices into today action cards", () => {
    const tasks: CropTask[] = [
      {
        id: "t1",
        cropId: "c1",
        cropName: "Tomato",
        title: "Irrigation Schedule",
        dueDate: "2026-06-25",
        completed: false,
        stage: "fruiting",
        priority: "high",
      },
      {
        id: "t2",
        cropId: "c1",
        cropName: "Tomato",
        title: "Old Task",
        dueDate: "2026-06-20",
        completed: true, // Completed task should be excluded
        stage: "fruiting",
        priority: "low",
      },
    ];

    const alerts: WeatherAlert[] = [
      {
        id: "w1",
        titleEn: "Thunderstorm Alert",
        titleTa: "இடிமின்னல் எச்சரிக்கை",
        severity: "warning",
        district: "Coimbatore",
        timestamp: "2026-06-25",
      },
    ];

    const cards = aggregateTodayActions({
      tasks,
      weatherAlerts: alerts,
      diseaseReports: [],
    });

    expect(cards.length).toBe(2);
    expect(cards.some((c) => c.type === "weather")).toBe(true);
    expect(cards.some((c) => c.type === "task")).toBe(true);
  });
});
