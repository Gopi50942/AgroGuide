import { getMarketPrices } from "@/lib/services/marketService";
import { fetchWeather } from "@/lib/services/weatherService";
import { calculateWaterBudget } from "@/lib/services/irrigationService";
import { evaluateCropSeasonPlan } from "@/lib/services/cropSeasonPlannerService";
import { EXTENSION_DIRECTORIES } from "@/lib/data/extensionDirectory";

export interface AiToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export const AI_READ_ONLY_TOOLS: AiToolDefinition[] = [
  {
    name: "get_latest_weather",
    description: "Fetch live or localized weather forecast for farmer's latitude and longitude.",
    parameters: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "GPS latitude" },
        longitude: { type: "number", description: "GPS longitude" },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "get_mandi_prices",
    description: "Fetch real-time Indian mandi wholesale commodity prices from official market data feeds.",
    parameters: {
      type: "object",
      properties: {
        commodity: { type: "string", description: "Crop name e.g. Tomato, Paddy, Onion" },
        state: { type: "string", description: "Indian state e.g. Tamil Nadu" },
        district: { type: "string", description: "District e.g. Coimbatore" },
      },
      required: ["commodity"],
    },
  },
  {
    name: "get_irrigation_recommendation",
    description: "Calculate daily irrigation water requirement in Litres based on crop, stage, area and weather.",
    parameters: {
      type: "object",
      properties: {
        cropName: { type: "string", description: "Crop name e.g. Tomato, Paddy" },
        stage: { type: "string", description: "Growth stage e.g. vegetative, flowering, maturity" },
        areaAcres: { type: "number", description: "Land area in acres" },
        irrigationMethod: { type: "string", description: "Drip, Sprinkler, or Flood" },
      },
      required: ["cropName"],
    },
  },
  {
    name: "get_crop_season_suggestions",
    description: "Retrieve recommended crops based on agricultural season, soil type, and water availability.",
    parameters: {
      type: "object",
      properties: {
        season: { type: "string", description: "Season e.g. samba, kuruvai, kharif, rabi, zaid" },
        soilType: { type: "string", description: "Soil type e.g. red, clay, loam, black" },
        waterAvailability: { type: "string", description: "abundant, moderate, limited, or rainfed" },
      },
      required: ["season"],
    },
  },
  {
    name: "get_extension_office_contacts",
    description: "Search official KVKs, Soil Testing Labs, and District Agriculture Offices for a district.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string", description: "Tamil Nadu district e.g. Coimbatore, Madurai, Thanjavur" },
      },
      required: ["district"],
    },
  },
];

/**
 * Execute a read-only tool call safely on the server.
 * All mutations are strictly forbidden.
 */
export async function executeAiReadOnlyTool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; result: any; error?: string }> {
  try {
    switch (toolName) {
      case "get_latest_weather": {
        const lat = typeof args.latitude === "number" ? args.latitude : 11.0168;
        const lng = typeof args.longitude === "number" ? args.longitude : 76.9558;
        const weather = await fetchWeather(lat, lng);
        return {
          success: true,
          result: {
            temperatureC: weather.current.temperatureC,
            condition: weather.current.condition,
            humidity: weather.current.humidity,
            windKph: weather.current.windKph,
            rainProbability: weather.current.rainProbability,
            forecast7Days: weather.daily.slice(0, 3).map((d) => ({
              date: d.date,
              maxC: d.maxC,
              minC: d.minC,
              rainChance: d.rainProbability,
              condition: d.condition,
            })),
          },
        };
      }

      case "get_mandi_prices": {
        const commodity = args.commodity || "Tomato";
        const state = args.state || "Tamil Nadu";
        const district = args.district;
        const res = await getMarketPrices({ commodity, state, district });
        return {
          success: true,
          result: {
            commodity,
            recordCount: res.records.length,
            records: res.records.slice(0, 5).map((r) => ({
              market: r.market,
              district: r.district,
              modalPrice: r.modalPrice,
              minPrice: r.minPrice,
              maxPrice: r.maxPrice,
              arrivalDate: r.arrivalDate,
            })),
          },
        };
      }

      case "get_irrigation_recommendation": {
        const budget = calculateWaterBudget({
          cropName: args.cropName || "Tomato",
          stage: args.stage || "vegetative",
          areaAcres: Number(args.areaAcres) || 1,
          irrigationMethod: args.irrigationMethod || "Drip Irrigation",
        });
        return {
          success: true,
          result: {
            status: budget.status,
            dailyVolumeLitres: budget.dailyVolumeLitres,
            litresPerAcre: budget.litresPerAcre,
            kc: budget.kc,
            recommendationEn: budget.recommendationEn,
            recommendationTa: budget.recommendationTa,
          },
        };
      }

      case "get_crop_season_suggestions": {
        const recs = evaluateCropSeasonPlan({
          state: "Tamil Nadu",
          district: "Coimbatore",
          seasonOrMonth: args.season || "samba",
          soilType: args.soilType || "red",
          waterAvailability: args.waterAvailability || "moderate",
          landAreaAcres: 2,
        });
        return {
          success: true,
          result: recs.map((r) => ({
            cropName: r.cropNameEn,
            duration: r.durationDays,
            waterDemand: r.waterDemand,
            varieties: r.varietySuggestionsEn,
            costPerAcre: r.estimatedCostPerAcre,
            suitability: r.suitabilityReasonEn,
          })),
        };
      }

      case "get_extension_office_contacts": {
        const district = (args.district || "").toLowerCase();
        const matches = EXTENSION_DIRECTORIES.filter(
          (o) => o.district.toLowerCase().includes(district) || o.district === "All Districts"
        );
        return {
          success: true,
          result: matches.map((m) => ({
            name: m.nameEn,
            type: m.type,
            phone: m.phone || m.tollFree,
            address: m.addressEn,
          })),
        };
      }

      default:
        return {
          success: false,
          result: null,
          error: `Tool '${toolName}' is not an authorized read-only tool.`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      result: null,
      error: err?.message || "Tool execution failed.",
    };
  }
}
