import { describe, it, expect } from "vitest";
import {
  buildDraftTasks,
  recalculateGeneratedTaskDates,
} from "@/lib/services/cropTaskSchedulerService";
import type { CropTask } from "@/types";

describe("Automated Crop Task Scheduler", () => {
  it("generates correct chronological due dates based on sowing date", () => {
    const sowingDate = "2026-06-01";
    const drafts = buildDraftTasks("Tomato", sowingDate, "en");

    expect(drafts.length).toBeGreaterThanOrEqual(6);

    // Land preparation (-7 days)
    const landPrep = drafts.find((d) => d.templateId === "tom_1");
    expect(landPrep?.dueDate).toBe("2026-05-25");

    // Transplanting (day 0)
    const transplant = drafts.find((d) => d.templateId === "tom_2");
    expect(transplant?.dueDate).toBe("2026-06-01");

    // First fertigation (+18 days)
    const firstFert = drafts.find((d) => d.templateId === "tom_3");
    expect(firstFert?.dueDate).toBe("2026-06-19");
  });

  it("non-destructively recalculates dates for template tasks while preserving custom user tasks", () => {
    const newSowing = "2026-06-10";

    const existingTasks: CropTask[] = [
      {
        id: "task-1",
        ownerId: "farmer-1",
        title: "Transplanting",
        dueDate: "2026-06-01",
        completed: false,
        generatedFromTemplate: true,
        daysFromSowing: 0,
      },
      {
        id: "task-2",
        ownerId: "farmer-1",
        title: "First Fertigation",
        dueDate: "2026-06-15",
        completed: false,
        generatedFromTemplate: true,
        daysFromSowing: 14,
      },
      {
        id: "custom-task",
        ownerId: "farmer-1",
        title: "Buy bio-fertilizer from local cooperative",
        dueDate: "2026-06-05",
        completed: false,
      },
    ];

    const { updatedTasks, updatedCount } = recalculateGeneratedTaskDates(newSowing, existingTasks);

    expect(updatedCount).toBe(2);
    // Template task 1 moved from 06-01 to 06-10
    expect(updatedTasks.find((t) => t.id === "task-1")?.dueDate).toBe("2026-06-10");
    // Template task 2 moved from 06-15 to 06-24 (10 + 14)
    expect(updatedTasks.find((t) => t.id === "task-2")?.dueDate).toBe("2026-06-24");
    // Custom task remained untouched
    expect(updatedTasks.find((t) => t.id === "custom-task")?.dueDate).toBe("2026-06-05");
  });
});
