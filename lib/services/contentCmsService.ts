import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import type { ContentCatalogItem, ContentCatalogType, ContentStatus } from "@/types";

// ─────────────────────────────────────────────
// Phase 53: Agriculture Content & Admin CMS Architecture
// Decouples static advisory/scheme knowledge from source code commits.
// ─────────────────────────────────────────────

export const DEMO_CONTENT_CATALOG: ContentCatalogItem[] = [
  {
    id: "cms_scheme_pmksy_01",
    type: "scheme_definition",
    titleEn: "PM Krishi Sinchayee Yojana (Micro-Irrigation)",
    titleTa: "பிரதம மந்திரி நுண்ணீர் பாசன திட்டம்",
    contentEn: "Central scheme providing 100% subsidy for small/marginal farmers and 75% for other farmers on drip/sprinkler installation.",
    contentTa: "சிறு மற்றும் குறு விவசாயிகளுக்கு 100% மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் சொட்டுநீர் பாசனம் அமைக்கும் திட்டம்.",
    status: "published",
    version: "2026.1",
    authorId: "admin_tnau_editorial",
    sourceName: "Department of Agriculture & Farmers Welfare",
    sourceUrl: "https://pmksy.gov.in",
    publishedAt: "2026-01-01T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cms_crop_banana_g9_02",
    type: "crop_template",
    titleEn: "Grand Naine (G9) Banana Tissue Culture Package of Practices",
    titleTa: "திசு வளர்ப்பு ஜி9 வாழை சாகுபடி தொழில் நுட்பங்கள்",
    contentEn: "Planting density: 1200 suckers/acre at 6x6 ft spacing. Water requirement: 15-20 litres/plant/day via drip.",
    contentTa: "நடவு இடைவெளி 6x6 அடி (ஏக்கருக்கு 1200 கன்றுகள்). சொட்டுநீர் மூலம் ஒரு மரத்திற்கு நாள் ஒன்றுக்கு 15-20 லிட்டர் நீர் தேவை.",
    status: "published",
    version: "2026.1",
    authorId: "admin_horticulture_dept",
    sourceName: "TNAU Agritech Portal",
    sourceUrl: "https://agritech.tnau.ac.in",
    publishedAt: "2026-02-15T00:00:00Z",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
];

export async function listPublishedContent(
  typeFilter?: ContentCatalogType
): Promise<ContentCatalogItem[]> {
  if (!isFirebaseConfigured) {
    if (!typeFilter) return DEMO_CONTENT_CATALOG;
    return DEMO_CONTENT_CATALOG.filter((c) => c.type === typeFilter);
  }

  const db = getFirebaseDb();
  if (!db) return DEMO_CONTENT_CATALOG;

  try {
    const q = typeFilter
      ? query(
          collection(db, "content_catalog"),
          where("status", "==", "published"),
          where("type", "==", typeFilter)
        )
      : query(collection(db, "content_catalog"), where("status", "==", "published"));
    const snap = await getDocs(q);
    const results: ContentCatalogItem[] = [];
    snap.forEach((d) => results.push(d.data() as ContentCatalogItem));
    return results.length > 0 ? results : DEMO_CONTENT_CATALOG;
  } catch {
    return DEMO_CONTENT_CATALOG;
  }
}
