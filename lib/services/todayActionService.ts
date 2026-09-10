import type { CropTask, WeatherAlert, DiseaseReport, MandiRecord, GovernmentService } from "@/types";

// ─────────────────────────────────────────────
// Phase 67: Today Field Action Cockpit Aggregator
// ─────────────────────────────────────────────

export interface TodayActionCard {
  id: string;
  type: "weather" | "task" | "disease" | "market" | "scheme";
  titleEn: string;
  titleTa: string;
  subtitleEn: string;
  subtitleTa: string;
  priority: "urgent" | "high" | "normal";
  actionLabelEn: string;
  actionLabelTa: string;
  actionRoute: string;
}

export function aggregateTodayActions(params: {
  tasks: CropTask[];
  weatherAlerts: WeatherAlert[];
  diseaseReports: DiseaseReport[];
}): TodayActionCard[] {
  const cards: TodayActionCard[] = [];

  // Weather Actions
  params.weatherAlerts.forEach((w) => {
    cards.push({
      id: `act_weather_${w.id}`,
      type: "weather",
      titleEn: w.titleEn,
      titleTa: w.titleTa,
      subtitleEn: w.descriptionEn || "Severe weather advisory for district",
      subtitleTa: w.descriptionTa || "மாவட்டத்திற்கான தீவிர வானிலை ஆலோசனை",
      priority: w.severity === "danger" ? "urgent" : "high",
      actionLabelEn: "View Weather Radar",
      actionLabelTa: "வானிலை விவரங்கள்",
      actionRoute: "/weather",
    });
  });

  // Scheduled Tasks
  params.tasks.filter((t) => !t.completed).forEach((t) => {
    cards.push({
      id: `act_task_${t.id}`,
      type: "task",
      titleEn: t.title,
      titleTa: t.titleTa || t.title,
      subtitleEn: `${t.cropName} • Stage: ${t.stage}`,
      subtitleTa: `${t.cropName} • பருவம்: ${t.stage}`,
      priority: t.priority === "high" ? "high" : "normal",
      actionLabelEn: "Complete Task",
      actionLabelTa: "பணியை முடிக்க",
      actionRoute: "/calendar",
    });
  });

  return cards;
}
