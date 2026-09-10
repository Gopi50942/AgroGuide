"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CropDoctor } from "@/components/crop-doctor/CropDoctor";
import { listCrops, listFarms } from "@/lib/services/farmService";
import { computeCropProgress } from "@/lib/utils/cropLifecycle";
import { DEMO_CROPS, DEMO_FARMS } from "@/data/demoData";
import type { Crop, Farm } from "@/types";

export default function CropDoctorPage() {
  const { profile, isDemoMode } = useAuth();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (isDemoMode) {
      setCrop(DEMO_CROPS[0] ?? null);
      setFarm(DEMO_FARMS[0] ?? null);
      return;
    }
    Promise.all([listCrops(profile.uid), listFarms(profile.uid)]).then(([crops, farms]) => {
      setCrop(crops[0] ?? null);
      setFarm(farms[0] ?? null);
    });
  }, [profile, isDemoMode]);

  const progress = crop ? computeCropProgress(crop) : null;

  return (
    <div className="animate-fade-up">
      <CropDoctor
        cropName={crop?.name}
        cropStage={progress?.stage}
        cropId={crop?.id}
        farmId={farm?.id}
        farmName={farm?.name}
      />
    </div>
  );
}
