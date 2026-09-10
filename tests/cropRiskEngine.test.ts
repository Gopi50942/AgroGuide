import { describe, it, expect } from "vitest";
import { evaluateCropRisk } from "@/lib/services/cropRiskEngine";
import type { Crop, WeatherAlert, DiseaseReport } from "@/types";

describe("Phase 66 — Crop Risk Score Engine", () => {
  it("calculates elevated risk level during flowering stage under active weather warnings", () => {
    const crop: Crop = {
      id: "c1",
      ownerId: "u1",
      farmId: "f1",
      name: "Tomato",
      variety: "Shivam",
      sowingDate: "2026-05-01",
      status: "active",
      currentStage: "flowering",
    };

    const weatherAlerts: WeatherAlert[] = [
      {
        id: "w1",
        titleEn: "Heavy Rainfall Warning",
        titleTa: "கனமழை எச்சரிக்கை",
        severity: "warning",
        district: "Coimbatore",
        timestamp: "2026-06-25",
      },
    ];

    const diseaseReports: DiseaseReport[] = [
      {
        id: "d1",
        ownerId: "u1",
        cropName: "Tomato",
        diagnosis: "Early Blight",
        confidence: 0.92,
        treatment: [],
        preventativeMeasures: [],
        createdAt: "2026-06-24",
      },
    ];

    const risk = evaluateCropRisk({
      crop,
      weatherAlerts,
      diseaseReports,
      overdueTasksCount: 3,
    });

    expect(risk.riskLevel).toBe("High");
    expect(risk.riskScore).toBeGreaterThanOrEqual(65);
    expect(risk.keyRiskFactorsEn.length).toBeGreaterThan(1);
    expect(risk.preventiveActionEn).toContain("drainage");
  });
});
