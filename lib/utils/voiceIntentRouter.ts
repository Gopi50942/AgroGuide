// ─────────────────────────────────────────────
// Voice Intent Router for Safe Voice Navigation
// Parses spoken Tamil or English phrases and matches them
// strictly to non-destructive page navigation targets.
// NEVER executes autonomous writes or financial actions.
// ─────────────────────────────────────────────

export interface VoiceIntentResult {
  matched: boolean;
  targetRoute?: string;
  routeNameEn?: string;
  routeNameTa?: string;
  matchedPhrase?: string;
}

const VOICE_ROUTES: Array<{
  route: string;
  nameEn: string;
  nameTa: string;
  patterns: RegExp[];
}> = [
  {
    route: "/weather",
    nameEn: "Weather",
    nameTa: "வானிலை",
    patterns: [
      /வானிலை/i,
      /மழை/i,
      /வெப்பநிலை/i,
      /weather/i,
      /rain/i,
      /temperature/i,
      /forecast/i,
    ],
  },
  {
    route: "/market",
    nameEn: "Market Mandi Prices",
    nameTa: "சந்தை விலை",
    patterns: [
      /சந்தை/i,
      /மண்டி/i,
      /விலை/i,
      /விற்பனை விலை/i,
      /market/i,
      /mandi/i,
      /price/i,
      /rate/i,
    ],
  },
  {
    route: "/crop-doctor",
    nameEn: "Crop Doctor",
    nameTa: "பயிர் மருத்துவர்",
    patterns: [
      /பயிர் மருத்துவர்/i,
      /நோய்/i,
      /பூச்சி/i,
      /இலை நோய்/i,
      /crop doctor/i,
      /disease/i,
      /pest/i,
      /plant doctor/i,
    ],
  },
  {
    route: "/farm",
    nameEn: "My Farm & Crops",
    nameTa: "என் பண்ணை & பயிர்கள்",
    patterns: [
      /பண்ணை/i,
      /பயிர்/i,
      /பயிர்கள்/i,
      /அறுவடை/i,
      /farm/i,
      /crops/i,
      /my farm/i,
      /harvest/i,
    ],
  },
  {
    route: "/soil",
    nameEn: "Soil Health",
    nameTa: "மண் வளம்",
    patterns: [
      /மண்/i,
      /மண் வளம்/i,
      /உரம்/i,
      /soil/i,
      /soil health/i,
      /fertilizer/i,
      /npk/i,
    ],
  },
  {
    route: "/irrigation",
    nameEn: "Irrigation Advisory",
    nameTa: "பாசன வழிகாட்டி",
    patterns: [
      /பாசன/i,
      /பாசனம்/i,
      /தண்ணீர்/i,
      /நீர்/i,
      /irrigation/i,
      /water/i,
      /watering/i,
    ],
  },
  {
    route: "/government",
    nameEn: "Government Schemes",
    nameTa: "அரசு திட்டங்கள்",
    patterns: [
      /அரசு/i,
      /திட்டம்/i,
      /மானியம்/i,
      /scheme/i,
      /government/i,
      /subsidy/i,
      /pm kisan/i,
    ],
  },
  {
    route: "/finance",
    nameEn: "Farm Finance & Ledger",
    nameTa: "பண்ணை நிதி",
    patterns: [
      /நிதி/i,
      /செலவு/i,
      /லாபம்/i,
      /கடன்/i,
      /finance/i,
      /expense/i,
      /profit/i,
      /loan/i,
      /sales/i,
    ],
  },
  {
    route: "/diary",
    nameEn: "Farm Diary",
    nameTa: "பண்ணை நாட்குறிப்பு",
    patterns: [
      /நாட்குறிப்பு/i,
      /டயரி/i,
      /பதிவு/i,
      /diary/i,
      /journal/i,
      /log/i,
    ],
  },
  {
    route: "/community",
    nameEn: "Farmer Community",
    nameTa: "விவசாயிகள் சமூகம்",
    patterns: [
      /சமூகம்/i,
      /விவசாயிகள்/i,
      /community/i,
      /forum/i,
      /discussion/i,
    ],
  },
  {
    route: "/emergency",
    nameEn: "Emergency Helplines",
    nameTa: "அவசர உதவி",
    patterns: [
      /அவசரம்/i,
      /உதவி/i,
      /ஹெல்ப்லைன்/i,
      /emergency/i,
      /helpline/i,
      /disaster/i,
    ],
  },
];

export function parseVoiceNavigationIntent(spokenText: string): VoiceIntentResult {
  if (!spokenText || !spokenText.trim()) {
    return { matched: false };
  }

  const trimmed = spokenText.trim().toLowerCase();

  for (const entry of VOICE_ROUTES) {
    for (const pattern of entry.patterns) {
      if (pattern.test(trimmed)) {
        return {
          matched: true,
          targetRoute: entry.route,
          routeNameEn: entry.nameEn,
          routeNameTa: entry.nameTa,
          matchedPhrase: trimmed,
        };
      }
    }
  }

  return { matched: false };
}
