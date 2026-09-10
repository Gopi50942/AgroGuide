import type {
  Crop,
  CropTask,
  SoilReport,
  DiseaseReport,
  Expense,
  HarvestRecord,
  ProduceSale,
  DiaryEntry,
  TimelineEvent,
  TimelineEventType,
} from "@/types";
import type { IrrigationLog } from "./irrigationService";
import type { WeatherAlertItem } from "./weatherAlertService";

export interface TimelineBundleInput {
  crops?: Crop[];
  tasks?: CropTask[];
  irrigationLogs?: IrrigationLog[];
  soilReports?: SoilReport[];
  diseaseReports?: DiseaseReport[];
  expenses?: Expense[];
  harvests?: HarvestRecord[];
  sales?: ProduceSale[];
  diaryEntries?: DiaryEntry[];
  weatherAlerts?: WeatherAlertItem[];
}

/**
 * Aggregates all operational farm records into derived chronological timeline events.
 * Does NOT duplicate underlying database entries.
 */
export function aggregateFarmTimeline(
  data: TimelineBundleInput,
  filters?: {
    farmId?: string;
    cropId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // 1. Crops (Sowing dates)
  (data.crops || []).forEach((c) => {
    if (c.sowingDate) {
      events.push({
        id: `timeline_crop_${c.id}`,
        type: "crop_sowing",
        date: c.sowingDate,
        titleEn: `Sown: ${c.name}`,
        titleTa: `விதைப்பு: ${c.name}`,
        descriptionEn: `Registered ${c.name} in stage: ${c.stage || "sowing"}`,
        descriptionTa: `பயிர் பதிவு செய்யப்பட்டது (${c.stage || "விதைப்பு"} நிலை)`,
        farmId: c.farmId,
        cropId: c.id,
        cropName: c.name,
        iconType: "crop_sowing",
      });
    }
  });

  // 2. Crop Tasks
  (data.tasks || []).forEach((t) => {
    events.push({
      id: `timeline_task_${t.id}`,
      type: t.completed ? "task_completed" : "task_scheduled",
      date: t.dueDate,
      titleEn: t.title,
      titleTa: t.title,
      descriptionEn: t.description || (t.completed ? "Task completed on schedule" : "Scheduled farm task"),
      descriptionTa: t.description || (t.completed ? "பணி முடிக்கப்பட்டது" : "திட்டமிடப்பட்ட பணி"),
      farmId: t.farmId,
      cropId: t.cropId,
      cropName: t.cropName,
      category: t.category,
      iconType: t.completed ? "task_completed" : "task_scheduled",
    });
  });

  // 3. Irrigation Logs
  (data.irrigationLogs || []).forEach((i) => {
    events.push({
      id: `timeline_irrig_${i.id}`,
      type: "irrigation_recorded",
      date: i.date,
      titleEn: `Irrigation: ${i.method}`,
      titleTa: `பாசனம்: ${i.method}`,
      descriptionEn: i.estimatedVolumeLitres
        ? `Applied ~${i.estimatedVolumeLitres.toLocaleString()} L water${i.durationMinutes ? ` (${i.durationMinutes} mins)` : ""}`
        : "Field watered",
      descriptionTa: i.estimatedVolumeLitres
        ? `சுமார் ${i.estimatedVolumeLitres.toLocaleString()} லிட்டர் நீர் பாய்ச்சப்பட்டது`
        : "பாசனம் செய்யப்பட்டது",
      farmId: i.farmId,
      cropId: i.cropId,
      cropName: i.cropName,
      quantity: i.estimatedVolumeLitres,
      unit: "Litres",
      iconType: "irrigation_recorded",
    });
  });

  // 4. Soil Reports
  (data.soilReports || []).forEach((s) => {
    const soilDate = s.sampleDate || (s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
    events.push({
      id: `timeline_soil_${s.id}`,
      type: "soil_test",
      date: soilDate,
      titleEn: "Soil Health Matrix Tested",
      titleTa: "மண் வள பரிசோதனை",
      descriptionEn: `pH: ${s.ph ?? "N/A"} · N: ${s.nitrogen ?? "N/A"} · P: ${s.phosphorus ?? "N/A"} · K: ${s.potassium ?? "N/A"}`,
      descriptionTa: `கார அமிலத்தன்மை pH: ${s.ph ?? "N/A"} · தழைச்சத்து N: ${s.nitrogen ?? "N/A"} · மணிச்சத்து P: ${s.phosphorus ?? "N/A"} · சாம்பல்ச்சத்து K: ${s.potassium ?? "N/A"}`,
      farmId: s.farmId,
      iconType: "soil_test",
    });
  });

  // 5. Crop Doctor Disease Scans
  (data.diseaseReports || []).forEach((d) => {
    const scanDate = d.scanDate || (d.createdAt ? d.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
    events.push({
      id: `timeline_disease_${d.id}`,
      type: "disease_scan",
      date: scanDate,
      titleEn: `Diagnosis: ${d.possibleIssue}`,
      titleTa: `நோய் கண்டறிதல்: ${d.possibleIssue}`,
      descriptionEn: d.symptoms?.join(", ") || `Severity: ${d.severity}`,
      descriptionTa: d.symptoms?.join(", ") || `பாதிப்பு: ${d.severity}`,
      cropName: d.cropName,
      severity: d.severity,
      iconType: "disease_scan",
    });
  });

  // 6. Expenses
  (data.expenses || []).forEach((e) => {
    events.push({
      id: `timeline_expense_${e.id}`,
      type: "expense_logged",
      date: e.date,
      titleEn: `Expense: ${e.category}`,
      titleTa: `செலவு: ${e.category}`,
      descriptionEn: e.note || `Logged agricultural expenditure`,
      descriptionTa: e.note || `பண்ணை செலவு பதிவு செய்யப்பட்டது`,
      cropId: e.cropId,
      amount: e.amount,
      iconType: "expense_logged",
    });
  });

  // 7. Harvests
  (data.harvests || []).forEach((h) => {
    events.push({
      id: `timeline_harvest_${h.id}`,
      type: "harvest_recorded",
      date: h.harvestDate,
      titleEn: `Harvest: ${h.cropName}`,
      titleTa: `அறுவடை: ${h.cropName}`,
      descriptionEn: `Harvested ${h.quantity} ${h.quantityUnit} (${h.qualityGrade || "FAQ"} Grade)`,
      descriptionTa: `அறுவடை: ${h.quantity} ${h.quantityUnit}`,
      farmId: h.farmId,
      cropId: h.cropId,
      cropName: h.cropName,
      quantity: h.quantity,
      unit: h.quantityUnit,
      iconType: "harvest_recorded",
    });
  });

  // 8. Produce Sales
  (data.sales || []).forEach((s) => {
    events.push({
      id: `timeline_sale_${s.id}`,
      type: "sale_recorded",
      date: s.saleDate,
      titleEn: `Produce Sale: ${s.cropName}`,
      titleTa: `விளைபொருள் விற்பனை: ${s.cropName}`,
      descriptionEn: `Sold ${s.quantity} ${s.quantityUnit} to ${s.buyerName || "Buyer"} for ₹${s.netRealization.toLocaleString()}`,
      descriptionTa: `விற்பனை: ₹${s.netRealization.toLocaleString()}`,
      cropId: s.cropId,
      cropName: s.cropName,
      amount: s.netRealization,
      quantity: s.quantity,
      unit: s.quantityUnit,
      iconType: "sale_recorded",
    });
  });

  // 9. Diary Entries
  (data.diaryEntries || []).forEach((dy) => {
    events.push({
      id: `timeline_diary_${dy.id}`,
      type: "diary_note",
      date: dy.date,
      titleEn: dy.cropName ? `Observation: ${dy.cropName}` : "Field Note",
      titleTa: dy.cropName ? `வயல் குறிப்பு: ${dy.cropName}` : "பண்ணை குறிப்பு",
      descriptionEn: dy.note,
      descriptionTa: dy.note,
      farmId: dy.farmId,
      cropId: dy.cropId,
      cropName: dy.cropName,
      iconType: "diary_note",
    });
  });

  // 10. Weather Alerts
  (data.weatherAlerts || []).forEach((w, idx) => {
    events.push({
      id: `timeline_weather_${idx}`,
      type: "weather_alert",
      date: w.date || new Date().toISOString().slice(0, 10),
      titleEn: w.title,
      titleTa: w.titleTa,
      descriptionEn: w.actionAdvice,
      descriptionTa: w.actionAdviceTa,
      severity: w.severity,
      iconType: "weather_alert",
    });
  });

  // Sort descending by date
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // Apply filters
  return events.filter((e) => {
    if (filters?.farmId && e.farmId && e.farmId !== filters.farmId) return false;
    if (filters?.cropId && e.cropId && e.cropId !== filters.cropId) return false;
    if (filters?.eventType && filters.eventType !== "all" && e.type !== filters.eventType) return false;
    if (filters?.startDate && e.date < filters.startDate) return false;
    if (filters?.endDate && e.date > filters.endDate) return false;
    return true;
  });
}
