import type {
  DashboardPriorityItem,
  DashboardPriorityLevel,
  WeatherAlert,
  CropTask,
  DiseaseReport,
  MandiRecord,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 65: Smart Dashboard Deterministic Priority Engine
// Ranks field alerts deterministically so critical advisories always appear first.
// ─────────────────────────────────────────────

export function buildDashboardPriorities(params: {
  weatherAlerts: WeatherAlert[];
  todayTasks: CropTask[];
  recentDiseaseReports: DiseaseReport[];
  watchlistMandis: MandiRecord[];
}): DashboardPriorityItem[] {
  const items: DashboardPriorityItem[] = [];

  // 1. Severe Weather Alerts (Priority: CRITICAL / HIGH)
  params.weatherAlerts.forEach((w) => {
    const isCritical = w.severity === "danger";
    items.push({
      id: `prio_weather_${w.id}`,
      titleEn: w.titleEn,
      titleTa: w.titleTa,
      category: "weather",
      priority: isCritical ? "CRITICAL" : "HIGH",
      whyImportantEn: "Adverse weather directly threatens standing crops; immediate protective measures recommended.",
      whyImportantTa: "வானிலை மாற்றம் பயிரை பாதிக்கலாம் என்பதால் முன்னெச்சரிக்கை நடவடிக்கை அவசியம்.",
      actionRoute: "/weather",
      timestamp: w.timestamp,
    });
  });

  // 2. Active Disease Scans with pending follow-up (Priority: HIGH)
  params.recentDiseaseReports.slice(0, 2).forEach((d) => {
    items.push({
      id: `prio_disease_${d.id}`,
      titleEn: `Follow-up: ${d.diagnosis}`,
      titleTa: `கள ஆய்வு: ${d.diagnosis}`,
      category: "crop_disease",
      priority: "HIGH",
      whyImportantEn: "Active pathogen or pest requires monitoring after treatment application.",
      whyImportantTa: "நோய் தடுப்பு மருந்து தெளித்த பின் பயிரின் முன்னேற்றத்தை கண்காணிக்கவும்.",
      actionRoute: "/crop-doctor",
      timestamp: d.createdAt || new Date().toISOString(),
    });
  });

  // 3. Today's Scheduled Crop Tasks (Priority: HIGH / NORMAL)
  params.todayTasks.forEach((t) => {
    items.push({
      id: `prio_task_${t.id}`,
      titleEn: `Task Due: ${t.title}`,
      titleTa: `இன்றைய பணி: ${t.title}`,
      category: "task",
      priority: t.priority === "high" ? "HIGH" : "NORMAL",
      whyImportantEn: "Timely agronomic task completion ensures optimal vegetative growth and yield.",
      whyImportantTa: "குறிப்பிட்ட காலத்தில் பணிகளை முடிப்பது பயிர் வளர்ச்சிக்கும் அதிக மகசூலுக்கும் உதவும்.",
      actionRoute: "/calendar",
      timestamp: t.dueDate,
    });
  });

  // Sort deterministically: CRITICAL > HIGH > NORMAL > LOW
  const priorityWeight: Record<DashboardPriorityLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1,
  };

  return items.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
}
