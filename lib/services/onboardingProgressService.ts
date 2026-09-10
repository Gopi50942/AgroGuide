import type { FarmerProfile, Farm, Crop, SoilReport } from "@/types";

// ─────────────────────────────────────────────
// Phase 64: Guided Onboarding Completion Engine
// ─────────────────────────────────────────────

export interface OnboardingStepProgress {
  id: string;
  titleEn: string;
  titleTa: string;
  isComplete: boolean;
  actionRoute: string;
}

export function evaluateOnboardingProgress(params: {
  profile: Partial<FarmerProfile> | null;
  farms: Farm[];
  crops: Crop[];
  soilReports: SoilReport[];
}): {
  steps: OnboardingStepProgress[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  nextSuggestedStep?: OnboardingStepProgress;
} {
  const steps: OnboardingStepProgress[] = [
    {
      id: "profile_setup",
      titleEn: "Farmer Profile & District",
      titleTa: "விவசாயி சுயவிவரம் & மாவட்டம்",
      isComplete: Boolean(params.profile?.name && params.profile?.district),
      actionRoute: "/settings",
    },
    {
      id: "add_farm",
      titleEn: "Add Primary Farm & Boundary",
      titleTa: "முதன்மை பண்ணை சேர்த்தல்",
      isComplete: params.farms.length > 0,
      actionRoute: "/farm",
    },
    {
      id: "add_crop",
      titleEn: "Register Active Crop",
      titleTa: "பயிர் பதிவு செய்தல்",
      isComplete: params.crops.length > 0,
      actionRoute: "/farm",
    },
    {
      id: "soil_health",
      titleEn: "Soil Health Test Record",
      titleTa: "மண் பரிசோதனை அறிக்கை",
      isComplete: params.soilReports.length > 0,
      actionRoute: "/soil",
    },
    {
      id: "irrigation_profile",
      titleEn: "Irrigation & Water Source",
      titleTa: "பாசன முறை விவரங்கள்",
      isComplete: Boolean(params.farms[0]?.irrigationType || params.profile?.irrigationType),
      actionRoute: "/irrigation",
    },
    {
      id: "privacy_consent",
      titleEn: "Privacy & Notification Preferences",
      titleTa: "தனியுரிமை & அறிவிப்பு விருப்பங்கள்",
      isComplete: Boolean(params.profile?.preferredLanguage),
      actionRoute: "/settings",
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const totalCount = steps.length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);
  const nextSuggestedStep = steps.find((s) => !s.isComplete);

  return {
    steps,
    completedCount,
    totalCount,
    completionPercent,
    nextSuggestedStep,
  };
}
