import { NextResponse } from "next/server";
import { getOpenDataMeta } from "@/lib/services/openDataExchangeService";

export async function GET() {
  const meta = getOpenDataMeta("market-trends", "District Mandi Modal Price Trends & Volatility");

  const data = [
    {
      district: "Coimbatore",
      commodity: "Tomato",
      modalPriceRsPerQuintal: 2450,
      priceTrend7DayPercent: 6.5,
      volatilityRating: "Moderate",
    },
    {
      district: "Coimbatore",
      commodity: "Small Onion",
      modalPriceRsPerQuintal: 4200,
      priceTrend7DayPercent: -3.2,
      volatilityRating: "Low",
    },
    {
      district: "Thanjavur",
      commodity: "Paddy (Common)",
      modalPriceRsPerQuintal: 2320,
      priceTrend7DayPercent: 1.1,
      volatilityRating: "Low",
    },
  ];

  return NextResponse.json({ meta, data }, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
