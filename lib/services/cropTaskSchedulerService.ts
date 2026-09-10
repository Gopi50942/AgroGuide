import { CROP_TASK_TEMPLATES, type CropTaskTemplate } from "@/lib/data/cropTaskTemplates";
import { createOwned, listOwned, updateOwned } from "@/lib/firebase/firestore";
import type { CropTask, Language } from "@/types";

// ─────────────────────────────────────────────
// Crop Lifecycle Automated Task Scheduler Service
// Deterministic calendar generation & date recalculation.
// Prevents duplicate tasks & protects custom farmer edits.
// ─────────────────────────────────────────────

export function getTaskTemplatesForCrop(cropName: string): CropTaskTemplate[] {
  if (!cropName) return CROP_TASK_TEMPLATES.filter((t) => t.cropType === "generic");

  const normalized = cropName.trim().toLowerCase();

  if (normalized.includes("tomato") || normalized.includes("தக்காளி")) {
    return CROP_TASK_TEMPLATES.filter((t) => t.cropType === "tomato");
  }

  if (
    normalized.includes("paddy") ||
    normalized.includes("rice") ||
    normalized.includes("நெல்") ||
    normalized.includes("அரிசி")
  ) {
    return CROP_TASK_TEMPLATES.filter((t) => t.cropType === "paddy");
  }

  // Fallback to generic agronomic templates
  return CROP_TASK_TEMPLATES.filter((t) => t.cropType === "generic");
}

export function calculateTaskDueDate(sowingDate: string, daysFromSowing: number): string {
  try {
    const base = new Date(sowingDate);
    if (isNaN(base.getTime())) return sowingDate;

    const due = new Date(base.getTime() + daysFromSowing * 86400000);
    return due.toISOString().slice(0, 10);
  } catch {
    return sowingDate;
  }
}

export interface DraftCropTask {
  templateId: string;
  title: string;
  description: string;
  category: CropTask["category"];
  stage: CropTask["stage"];
  dueDate: string;
  daysFromSowing: number;
  priority: "high" | "medium" | "low";
  selected: boolean;
}

export function buildDraftTasks(
  cropName: string,
  sowingDate: string,
  language: Language = "en"
): DraftCropTask[] {
  const templates = getTaskTemplatesForCrop(cropName);

  return templates.map((tmpl) => ({
    templateId: tmpl.id,
    title: language === "ta" ? tmpl.titleTa : tmpl.titleEn,
    description: language === "ta" ? tmpl.descTa : tmpl.descEn,
    category: tmpl.category,
    stage: tmpl.stage,
    dueDate: calculateTaskDueDate(sowingDate, tmpl.daysFromSowing),
    daysFromSowing: tmpl.daysFromSowing,
    priority: tmpl.priority,
    selected: true,
  }));
}

/**
 * Filter out existing generated tasks to prevent duplicates.
 */
export function filterNewTasks(
  drafts: DraftCropTask[],
  existingTasks: CropTask[]
): DraftCropTask[] {
  const existingTemplateIds = new Set(
    existingTasks
      .filter((t) => t.generatedFromTemplate && t.templateId)
      .map((t) => t.templateId)
  );

  return drafts.filter((d) => !existingTemplateIds.has(d.templateId));
}

/**
 * Recalculate due dates for generated tasks when a crop's sowing date is updated.
 * Preserves custom farmer tasks that were not generated from templates.
 */
export function recalculateGeneratedTaskDates(
  newSowingDate: string,
  tasks: CropTask[]
): { updatedTasks: CropTask[]; updatedCount: number } {
  let count = 0;
  const updatedTasks = tasks.map((t) => {
    if (t.generatedFromTemplate && typeof t.daysFromSowing === "number") {
      const newDueDate = calculateTaskDueDate(newSowingDate, t.daysFromSowing);
      if (newDueDate !== t.dueDate) {
        count++;
        return { ...t, dueDate: newDueDate };
      }
    }
    return t;
  });

  return { updatedTasks, updatedCount: count };
}

/**
 * Batch save generated crop tasks to Firestore
 */
export async function saveGeneratedCropTasks(
  ownerId: string,
  cropId: string,
  cropName: string,
  farmId: string | undefined,
  selectedDrafts: DraftCropTask[]
): Promise<void> {
  const promises = selectedDrafts
    .filter((d) => d.selected)
    .map((draft) =>
      createOwned("crop_tasks", ownerId, {
        cropId,
        cropName,
        farmId,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        stage: draft.stage,
        dueDate: draft.dueDate,
        daysFromSowing: draft.daysFromSowing,
        priority: draft.priority,
        completed: false,
        generatedFromTemplate: true,
        templateId: draft.templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
    );

  await Promise.all(promises);
}
