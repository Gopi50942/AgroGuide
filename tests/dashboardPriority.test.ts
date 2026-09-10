import { describe, it, expect } from "vitest";
import { buildDashboardPriorities } from "@/lib/services/dashboardPriorityEngine";
import type { WeatherAlert, CropTask, DiseaseReport } from "@/types";

describe("Phase 65 — Smart Dashboard Priority Engine", () => {
  it("deterministically ranks severe weather emergencies ahead of routine tasks", () => {
    const alerts: WeatherAlert[] = [
      {
        id: "w1",
        titleEn: "Cyclone Warning",
        titleTa: "புயல் எச்சரிக்கை",
        severity: "danger",
        descriptionEn: "Heavy cyclonic winds expected",
        descriptionTa: "கனமழை எச்சரிக்கை",
        district: "Thanjavur",
        timestamp: "2026-06-25T10:00:00Z",
      },
    ];

    const tasks: CropTask[] = [
      {
        id: "t1",
        cropId: "c1",
        cropName: "Paddy",
        title: "Weeding",
        dueDate: "2026-06-25",
        completed: false,
        stage: "vegetative",
        priority: "medium",
      },
    ];

    const priorities = buildDashboardPriorities({
      weatherAlerts: alerts,
      todayTasks: tasks,
      recentDiseaseReports: [],
      watchlistMandis: [],
    });

    expect(priorities.length).toBe(2);
    expect(priorities[0].category).toBe("weather");
    expect(priorities[0].priority).toBe("CRITICAL");
    expect(priorities[1].category).toBe("task");
  });
});
