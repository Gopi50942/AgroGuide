import { describe, it, expect } from "vitest";
import { evaluateWeatherAlerts } from "@/lib/services/weatherAlertService";
import type { WeatherBundle } from "@/lib/services/weatherService";
import type { Crop } from "@/types";

describe("Weather Alert Rule Engine & Crop Impact", () => {
  const baseWeather: WeatherBundle = {
    current: {
      temperatureC: 40,
      feelsLikeC: 43,
      humidity: 50,
      windKph: 15,
      rainProbability: 20,
      condition: "Clear",
      uvIndex: 9,
      isDemo: false,
    },
    hourly: [],
    daily: [
      {
        date: new Date().toISOString().slice(0, 10),
        maxC: 41,
        minC: 28,
        rainProbability: 20,
        condition: "Sunny",
      },
    ],
  };

  it("detects extreme heat alert when temperature exceeds threshold", () => {
    const alerts = evaluateWeatherAlerts(baseWeather);
    const heatAlert = alerts.find((a) => a.type === "extreme_heat");
    expect(heatAlert).toBeDefined();
    expect(heatAlert?.severity).toBe("high");
  });

  it("enriches heavy rain alert with crop flowering stage context", () => {
    const rainWeather: WeatherBundle = {
      ...baseWeather,
      current: {
        ...baseWeather.current,
        temperatureC: 26,
        rainProbability: 85,
        condition: "Heavy rain",
      },
      daily: [
        {
          date: new Date().toISOString().slice(0, 10),
          maxC: 27,
          minC: 22,
          rainProbability: 85,
          condition: "Heavy rain",
        },
      ],
    };

    const crops: Crop[] = [
      {
        id: "c1",
        ownerId: "u1",
        farmId: "f1",
        name: "Tomato",
        sowingDate: "2026-05-01",
        stage: "flowering",
      },
    ];

    const alerts = evaluateWeatherAlerts(rainWeather, crops, "en");
    const rainAlert = alerts.find((a) => a.type === "heavy_rain");
    expect(rainAlert).toBeDefined();
    expect(rainAlert?.cropContext).toContain("flowering/fruiting");
  });
});
