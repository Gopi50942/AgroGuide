import { NextResponse } from "next/server";
import { getOpenDataMeta } from "@/lib/services/openDataExchangeService";

export async function GET() {
  const meta = getOpenDataMeta("crop-acreage", "Tamil Nadu District-Level Aggregated Crop Acreage");

  const data = [
    {
      district: "Coimbatore",
      season: "Kharif 2026",
      totalDigitizedAcres: 4850.5,
      crops: [
        { crop: "Tomato", acres: 1420.0, participatingFarmsCohort: 64 },
        { crop: "Maize", acres: 1180.0, participatingFarmsCohort: 52 },
        { crop: "Small Onion", acres: 650.5, participatingFarmsCohort: 38 },
        { crop: "Banana", acres: 980.0, participatingFarmsCohort: 41 },
      ],
    },
    {
      district: "Thanjavur",
      season: "Samba 2026",
      totalDigitizedAcres: 8420.0,
      crops: [
        { crop: "Paddy (CR 1009 / Ponmani)", acres: 6200.0, participatingFarmsCohort: 185 },
        { crop: "Black Gram", acres: 1420.0, participatingFarmsCohort: 56 },
      ],
    },
  ];

  return NextResponse.json({ meta, data }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
