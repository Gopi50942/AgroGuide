import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, setDoc } from "firebase/firestore";
import type { PilotFeedbackEntry } from "@/types";

// ─────────────────────────────────────────────
// Phase 81: Final Field Pilot Mode & Feedback Engine
// Captures on-field farmer feedback, connectivity metrics, and pilot verification status.
// ─────────────────────────────────────────────

export async function submitPilotFeedback(
  ownerId: string,
  category: PilotFeedbackEntry["category"],
  rating: number,
  message: string,
  pageRoute: string,
  farmerName?: string,
  isDemoMode: boolean = false
): Promise<PilotFeedbackEntry> {
  const feedbackId = `pilot_fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const entry: PilotFeedbackEntry = {
    id: feedbackId,
    ownerId,
    farmerName,
    category,
    rating: Math.min(5, Math.max(1, rating)),
    message,
    pageRoute,
    connectivityStatus: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online",
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "2026.09-rc1",
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_pilot_feedback_${ownerId}`;
      const existing: PilotFeedbackEntry[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(entry);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return entry;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "pilot_feedback", feedbackId), entry);
  }

  return entry;
}

export function getFieldPilotChecklist(): {
  id: string;
  itemEn: string;
  itemTa: string;
  isMandatory: boolean;
}[] {
  return [
    {
      id: "chk_farmer_onboarded",
      itemEn: "Farmer profile completed with primary district set",
      itemTa: "விவசாயி சுயவிவரம் மற்றும் மாவட்டம் பதிவு செய்யப்பட்டுள்ளது",
      isMandatory: true,
    },
    {
      id: "chk_farm_mapped",
      itemEn: "Farm boundary polygon drawn or legal acreage declared",
      itemTa: "பண்ணை எல்லை வரைபடம் அல்லது நிலப்பரப்பளவு பதிவு செய்யப்பட்டுள்ளது",
      isMandatory: true,
    },
    {
      id: "chk_crop_active",
      itemEn: "Active crop registered with valid sowing date and growth stage",
      itemTa: "பயிர் மற்றும் விதைப்புத் தேதி பதிவு செய்யப்பட்டுள்ளது",
      isMandatory: true,
    },
    {
      id: "chk_weather_synced",
      itemEn: "Local 7-day meteorological forecast and severe alerts verified",
      itemTa: "7-நாள் வானிலை முன்னறிவிப்பு மற்றும் எச்சரிக்கைகள் சரிபார்க்கப்பட்டது",
      isMandatory: true,
    },
    {
      id: "chk_tamil_voice_tested",
      itemEn: "Tamil voice query or multimodal AI diagnostic tested on device",
      itemTa: "தமிழ் குரல்வழி AI அல்லது நோய் கண்டறிதல் களத்தில் சோதிக்கப்பட்டது",
      isMandatory: true,
    },
    {
      id: "chk_offline_verified",
      itemEn: "Offline PWA data caching confirmed on field smartphone",
      itemTa: "இணையம் இல்லாத சூழலிலும் செயலியின் செயல்பாடு உறுதி செய்யப்பட்டது",
      isMandatory: true,
    },
  ];
}
