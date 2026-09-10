import { NextResponse } from "next/server";
import { getOpenDataMeta } from "@/lib/services/openDataExchangeService";

export async function GET() {
  const meta = getOpenDataMeta("weather-risk", "District Agricultural Weather Risk & Hazard Indicators");

  const data = [
    {
      district: "Coimbatore",
      riskLevel: "Moderate Rain",
      forecastSummary: "Scattered moderate rain expected over western blocks.",
      advisoryTag: "Fungicide Spraying Caution",
    },
    {
      district: "Thanjavur",
      riskLevel: "Low Risk",
      forecastSummary: "Normal seasonal temperature and light breeze.",
      advisoryTag: "Normal Agronomic Operations",
    },
  ];

  return NextResponse.json({ meta, data }, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
