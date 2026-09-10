import type { TrainingProgram } from "@/types";

// ─────────────────────────────────────────────
// Phase 139: Farmer Training & Capacity Building Service
// Extension training programs, batch capacity, and attendance rosters.
// ─────────────────────────────────────────────

let inMemoryTrainingPrograms: TrainingProgram[] = [
  {
    id: "trn_ipm_2026",
    titleEn: "Integrated Pest & Nutrient Management in Horticulture",
    titleTa: "தோட்டக்கலை பயிர்களில் ஒருங்கிணைந்த பயிர் பாதுகாப்பு மற்றும் ஊட்டச்சத்து மேலாண்மை",
    topic: "Integrated Pest Management",
    district: "Coimbatore",
    block: "Thondamuthur",
    scheduledDate: "2026-06-20",
    trainerName: "Dr. Soundararajan (TNAU Extension Scientist)",
    capacity: 60,
    enrolledCount: 48,
    status: "Scheduled",
  },
  {
    id: "trn_drip_2026",
    titleEn: "Drip Fertigation & Automation Workshop",
    titleTa: "சொட்டு நீர் பாசனத்தில் உரமிடுதல் மற்றும் ஆட்டோமேஷன் பயிற்சி",
    topic: "Micro Irrigation",
    district: "Coimbatore",
    block: "Pollachi",
    scheduledDate: "2026-06-25",
    trainerName: "Er. Prabhakaran (Agricultural Engineering Dept)",
    capacity: 50,
    enrolledCount: 45,
    status: "Scheduled",
  },
];

export async function listTrainingPrograms(districtFilter?: string): Promise<TrainingProgram[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryTrainingPrograms;
  return inMemoryTrainingPrograms.filter((t) => t.district.toLowerCase() === districtFilter.toLowerCase());
}

export async function enrollInTraining(programId: string): Promise<TrainingProgram | null> {
  const p = inMemoryTrainingPrograms.find((item) => item.id === programId);
  if (!p) return null;
  if (p.enrolledCount < p.capacity) {
    p.enrolledCount += 1;
  }
  return p;
}
