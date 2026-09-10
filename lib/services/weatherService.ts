import type { WeatherCurrent, WeatherHourly, WeatherDaily, AdvisoryAlert } from "@/types";


export interface WeatherBundle {
  current: WeatherCurrent;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
}

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

function conditionFromCode(code: number): string {
  return WMO_CONDITIONS[code] ?? "Variable conditions";
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function fetchWeather(
  lat: number,
  lng: number
): Promise<WeatherBundle> {
  if (!isValidCoordinate(lat, lng)) {
    const error = new Error(`Invalid coordinates for weather lookup: lat=${lat}, lng=${lng}`);
    console.error("❌ WEATHER FETCH FAILED:", error);
    throw error;
  }

  try {
    console.log("🌦️ Fetching weather for:", { lat, lng });

    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));

    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code,uv_index"
    );

    url.searchParams.set(
      "hourly",
      "temperature_2m,precipitation_probability"
    );

    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset"
    );

    url.searchParams.set("timezone", "auto");

    console.log("🌐 Open-Meteo URL:", url.toString());

    const res = await fetch(url.toString());

    if (!res.ok) {
      const errorText = await res.text();

      console.error("❌ Open-Meteo HTTP error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });

      throw new Error(
        `Weather API error: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    console.log("✅ Open-Meteo response:", data);

    if (!data.current || !data.hourly || !data.daily) {
      throw new Error("Open-Meteo returned incomplete weather data.");
    }

    const current: WeatherCurrent = {
      temperatureC: Math.round(data.current.temperature_2m),
      feelsLikeC: Math.round(data.current.apparent_temperature),
      humidity: Math.round(data.current.relative_humidity_2m),
      windKph: Math.round(data.current.wind_speed_10m),
      rainProbability:
        data.hourly.precipitation_probability?.[0] ?? 0,
      rainfallMm: data.current.precipitation ?? 0,
      condition: conditionFromCode(data.current.weather_code),
      uvIndex: Math.round(data.current.uv_index ?? 0),
      sunrise: data.daily.sunrise?.[0] ?? "",
      sunset: data.daily.sunset?.[0] ?? "",
      isDemo: false,
    };

    const hourly: WeatherHourly[] = (data.hourly.time ?? [])
      .slice(0, 24)
      .map((time: string, i: number) => ({
        time,
        temperatureC: Math.round(data.hourly.temperature_2m[i]),
        rainProbability:
          data.hourly.precipitation_probability?.[i] ?? 0,
      }));

    const daily: WeatherDaily[] = (data.daily.time ?? []).map(
      (date: string, i: number) => ({
        date,
        minC: Math.round(data.daily.temperature_2m_min[i]),
        maxC: Math.round(data.daily.temperature_2m_max[i]),
        rainProbability:
          data.daily.precipitation_probability_max?.[i] ?? 0,
        condition: conditionFromCode(data.daily.weather_code[i]),
      })
    );

    console.log("✅ Real weather loaded:", {
      temperature: current.temperatureC,
      humidity: current.humidity,
      condition: current.condition,
      isDemo: current.isDemo,
    });

    return {
      current,
      hourly,
      daily,
    };
  } catch (error) {
    console.error("❌ WEATHER FETCH FAILED:", error);

    // IMPORTANT:
    // During debugging, do NOT silently return demo data.
    throw error;
  }
}


export function getDemoWeather(): WeatherBundle {
  return {
    current: {
      temperatureC: 31,
      feelsLikeC: 34,
      humidity: 72,
      windKph: 14,
      rainProbability: 40,
      rainfallMm: 0,
      condition: "Partly cloudy",
      uvIndex: 7,
      sunrise: "06:05",
      sunset: "18:32",
      isDemo: true,
    },
    hourly: Array.from({ length: 12 }).map((_, i) => ({
      time: `${(6 + i) % 24}:00`,
      temperatureC: 27 + Math.round(Math.sin(i / 2) * 4),
      rainProbability: Math.max(10, Math.min(80, 30 + i * 4)),
    })),
    daily: Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
      minC: 24,
      maxC: 32 - (i % 3),
      rainProbability: 30 + ((i * 11) % 50),
      condition: i % 2 === 0 ? "Partly cloudy" : "Light rain",
    })),
  };
}

/**
 * Generates farming advisories from weather data. This is presented to
 * the farmer as guidance/recommendations, never as a guaranteed decision.
 */
export function buildWeatherAdvisories(w: WeatherBundle): AdvisoryAlert[] {
  const alerts: AdvisoryAlert[] = [];

  if (w.current.rainProbability >= 60 || w.daily[1]?.rainProbability >= 60) {
    alerts.push({
      id: "weather-rain",
      type: "weather",
      severity: "moderate",
      title: "Rain expected soon",
      message: "Consider postponing irrigation to avoid waterlogging.",
      why: `Forecast rain probability is ${Math.max(w.current.rainProbability, w.daily[1]?.rainProbability ?? 0)}%, which may be sufficient to meet crop water needs.`,
    });
  }

  if (w.current.windKph >= 25) {
    alerts.push({
      id: "weather-wind",
      type: "weather",
      severity: "moderate",
      title: "Strong winds expected",
      message: "Avoid spraying pesticides or fertilizers during high-wind periods.",
      why: `Current wind speed is ${w.current.windKph} km/h, which can cause spray drift and uneven application.`,
    });
  }

  if (w.current.humidity >= 80) {
    alerts.push({
      id: "weather-humidity",
      type: "disease",
      severity: "moderate",
      title: "High humidity — disease risk",
      message: "High humidity may increase fungal disease risk. Inspect your crop closely.",
      why: `Relative humidity is ${w.current.humidity}%, which favors fungal pathogen development in many crops.`,
    });
  }

  if (w.current.uvIndex >= 9) {
    alerts.push({
      id: "weather-uv",
      type: "weather",
      severity: "low",
      title: "Very high UV levels",
      message: "Schedule outdoor field work for early morning or late afternoon where possible.",
      why: `UV index is ${w.current.uvIndex}, in the very-high range for prolonged sun exposure.`,
    });
  }

  return alerts;
}
