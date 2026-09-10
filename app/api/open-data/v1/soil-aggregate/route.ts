import { NextResponse } from "next/server";
import { getOpenDataMeta } from "@/lib/services/openDataExchangeService";

export async function GET() {
  const meta = getOpenDataMeta("soil-aggregate", "District Soil Health & Micronutrient Deficiency Aggregates");

  const data = [
    {
      district: "Coimbatore",
      averagePh: 7.2,
      zincDeficiencyPercent: 34.5,
      boronDeficiencyPercent: 28.0,
      organicCarbonDeficitPercent: 42.0,
      testedSamplesCohort: 355,
    },
    {
      district: "Thanjavur",
      averagePh: 6.8,
      zincDeficiencyPercent: 48.0,
      boronDeficiencyPercent: 18.0,
      organicCarbonDeficitPercent: 35.0,
      testedSamplesCohort: 420,
    },
  ];

  return NextResponse.json({ meta, data }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
