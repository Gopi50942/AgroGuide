import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { logAuditEvent } from "./auditLogService";
import type { UserConsent, ConsentType } from "@/types";

const CONSENTS_COLLECTION = "user_consents";
export const CURRENT_CONSENT_VERSION = "2026.1";

export interface ConsentConfig {
  type: ConsentType;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  defaultGranted: boolean;
  isEssential: boolean;
}

export const CONSENT_DEFINITIONS: ConsentConfig[] = [
  {
    type: "location",
    titleEn: "Device Location & Weather Grounding",
    titleTa: "இருப்பிடம் & உள்ளூர் வானிலை தகவல்",
    descEn: "Used solely to provide hyper-local weather alerts, local mandi prices, and nearby agricultural extension services.",
    descTa: "உள்ளூர் வானிலை எச்சரிக்கைகள், அருகிலுள்ள மண்டி விலை மற்றும் வேளாண்மை அலுவலக தகவல்களை வழங்க மட்டுமே பயன்படுத்தப்படுகிறது.",
    defaultGranted: true,
    isEssential: false,
  },
  {
    type: "ai_processing",
    titleEn: "AgroGuide AI Agronomic Processing",
    titleTa: "அக்ரோகைடு AI வேளாண் ஆலோசனை செயலாக்கம்",
    descEn: "Processes your farm crop stages, soil test parameters, and pest questions to generate grounded agricultural guidance.",
    descTa: "உங்கள் பயிர் நிலை, மண் பரிசோதனை மற்றும் பூச்சி கேள்விகளை ஆய்வு செய்து துல்லியமான விவசாய ஆலோசனைகளை வழங்குகிறது.",
    defaultGranted: true,
    isEssential: false,
  },
  {
    type: "image_diagnosis",
    titleEn: "Crop Doctor Leaf & Pest Image Analysis",
    titleTa: "பயிர் மருத்துவர் இலை & பூச்சி புகைப்பட ஆய்வு",
    descEn: "Analyzes uploaded crop disease photos to identify potential botanical deficiencies and pests.",
    descTa: "பயிர் நோய் மற்றும் பூச்சி தாக்குதல்களை கண்டறிய நீங்கள் பதிவேற்றும் இலை புகைப்படங்களை பகுப்பாய்வு செய்கிறது.",
    defaultGranted: true,
    isEssential: false,
  },
  {
    type: "voice_recording",
    titleEn: "Voice Notes & Audio Input",
    titleTa: "குரல் பதிவு & ஆடியோ உள்ளீடு",
    descEn: "Allows recording spoken Tamil or English queries and community voice questions on your device microphone.",
    descTa: "உங்கள் சாதன மைக்ரோஃபோன் மூலம் தமிழ் அல்லது ஆங்கிலத்தில் கேள்விகளை பேசவும் சமூகத்தில் குரல் பதிவிடவும் அனுமதிக்கிறது.",
    defaultGranted: true,
    isEssential: false,
  },
  {
    type: "weather_notifications",
    titleEn: "Severe Weather Alerts & Task Reminders",
    titleTa: "தீவிர வானிலை எச்சரிக்கைகள் & பணி நினைவூட்டல்",
    descEn: "Sends timely notices for heavy rainfall, extreme heatwaves, and critical agronomic fertigation tasks.",
    descTa: "கனமழை, கடுமையான வெப்ப அலை மற்றும் முக்கிய உரப்பாசன பணிகளுக்கான அறிவிப்புகளை சரியான நேரத்தில் அனுப்புகிறது.",
    defaultGranted: true,
    isEssential: false,
  },
  {
    type: "community_media",
    titleEn: "Community Photo & Advice Sharing",
    titleTa: "சமூகத்தில் படங்கள் & ஆலோசனைகள் பகிர்தல்",
    descEn: "Allows sharing non-sensitive field observation photos and advice with peer farmers in the AgroGuide community.",
    descTa: "பிற விவசாயிகளுடன் வயல் புகைப்படங்கள் மற்றும் அனுபவ ஆலோசனைகளை அக்ரோகைடு சமூகத்தில் பகிர அனுமதிக்கிறது.",
    defaultGranted: false,
    isEssential: false,
  },
];

/**
 * Fetch all consent states for the authenticated farmer.
 */
export async function getFarmerConsents(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<Record<ConsentType, boolean>> {
  const defaults: Record<ConsentType, boolean> = {
    location: true,
    ai_processing: true,
    image_diagnosis: true,
    voice_recording: true,
    weather_notifications: true,
    community_media: false,
  };

  if (!ownerId) return defaults;

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const stored = localStorage.getItem(`agroguide_consents_${ownerId}`);
      if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch {}
    return defaults;
  }

  const db = getFirebaseDb();
  if (!db) return defaults;

  try {
    const q = query(
      collection(db, CONSENTS_COLLECTION),
      where("ownerId", "==", ownerId)
    );
    const snapshot = await getDocs(q);
    const result = { ...defaults };

    snapshot.forEach((d) => {
      const data = d.data() as UserConsent;
      if (data.type && typeof data.granted === "boolean") {
        result[data.type] = data.granted;
      }
    });

    return result;
  } catch {
    return defaults;
  }
}

/**
 * Save or update consent preference for a specific feature.
 */
export async function updateFarmerConsent(
  ownerId: string,
  type: ConsentType,
  granted: boolean,
  isDemoMode: boolean = false
): Promise<void> {
  if (!ownerId) return;

  const now = new Date().toISOString();

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const storedKey = `agroguide_consents_${ownerId}`;
      const existing = JSON.parse(localStorage.getItem(storedKey) || "{}");
      existing[type] = granted;
      localStorage.setItem(storedKey, JSON.stringify(existing));
    } catch {}
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  const docId = `${ownerId}_${type}`;
  const consentDocRef = doc(db, CONSENTS_COLLECTION, docId);

  await setDoc(
    consentDocRef,
    {
      id: docId,
      ownerId,
      type,
      granted,
      timestamp: now,
      version: CURRENT_CONSENT_VERSION,
      updatedAt: now,
    },
    { merge: true }
  );

  await logAuditEvent(
    ownerId,
    "CONSENT_UPDATE",
    "consent",
    type,
    { consentType: type, granted, version: CURRENT_CONSENT_VERSION },
    "web",
    isDemoMode
  );
}
