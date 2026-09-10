import { createOwned, listOwned } from "@/lib/firebase/firestore";
import type { WeatherBundle } from "@/lib/services/weatherService";
import type { Crop, Language, NotificationItem } from "@/types";

// ─────────────────────────────────────────────
// Deterministic Weather Alert Rule Engine & Notification Architecture
// Evaluates real meteorological conditions from Open-Meteo
// and synthesizes crop-aware farming advisories without fabricating data.
// ─────────────────────────────────────────────

export interface WeatherAlertItem {
  id: string;
  type: "heavy_rain" | "strong_wind" | "extreme_heat" | "cold_risk" | "thunderstorm" | "high_uv";
  severity: "high" | "moderate" | "low";
  title: string;
  titleTa: string;
  message: string;
  messageTa: string;
  cropContext?: string;
  cropContextTa?: string;
  actionAdvice: string;
  actionAdviceTa: string;
  fingerprint: string;
  date: string;
}

export function evaluateWeatherAlerts(
  weather: WeatherBundle,
  crops: Crop[] = [],
  language: Language = "en"
): WeatherAlertItem[] {
  if (!weather || !weather.current) return [];

  const alerts: WeatherAlertItem[] = [];
  const { current, daily } = weather;
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayForecast = daily?.[0];

  const maxTemp = todayForecast?.maxC ?? current.temperatureC;
  const minTemp = todayForecast?.minC ?? current.temperatureC;
  const rainProb = todayForecast?.rainProbability ?? current.rainProbability;
  const windKph = current.windKph;

  // 1. Heavy Rain Alert
  if (rainProb >= 75 || current.condition.toLowerCase().includes("rain")) {
    const floweringCrops = crops.filter(
      (c) => c.stage === "flowering" || c.stage === "fruiting"
    );

    let cropContext = "";
    let cropContextTa = "";
    if (floweringCrops.length > 0) {
      const names = floweringCrops.map((c) => c.name).join(", ");
      cropContext = `Active crops (${names}) are in flowering/fruiting stage — heavy rain can cause flower shedding.`;
      cropContextTa = `உங்கள் பயிர்கள் (${names}) பூக்கும் தருணத்தில் உள்ளதால் அதிக மழையால் பூக்கள் உதிர வாய்ப்புள்ளது.`;
    }

    alerts.push({
      id: `alert_rain_${todayDate}`,
      type: "heavy_rain",
      severity: rainProb >= 85 ? "high" : "moderate",
      title: "Heavy Rainfall Advisory",
      titleTa: "அதிக மழை எச்சரிக்கை",
      message: `High rain probability (${rainProb}%) expected today.`,
      messageTa: `இன்று அதிக மழை வாய்ப்பு (${rainProb}%) பதிவாகியுள்ளது.`,
      cropContext,
      cropContextTa,
      actionAdvice: "Ensure clear field drainage channels and postpone spray operations.",
      actionAdviceTa: "வயலில் உள்ள வடிகால் வாய்க்கால்களை சீரமைத்து தெளிப்பு பணிகளை ஒத்திவைக்கவும்.",
      fingerprint: `rain_${todayDate}`,
      date: todayDate,
    });
  }

  // 2. Extreme Heat Alert (> 37°C)
  if (maxTemp >= 37) {
    const seedlingCrops = crops.filter(
      (c) => c.stage === "sowing" || c.stage === "germination" || c.stage === "vegetative"
    );

    let cropContext = "";
    let cropContextTa = "";
    if (seedlingCrops.length > 0) {
      const names = seedlingCrops.map((c) => c.name).join(", ");
      cropContext = `Young seedlings (${names}) are prone to heat stress and moisture depletion.`;
      cropContextTa = `இளம் நாற்றுகள் (${names}) வெப்பத்தால் வாடும் அபாயம் உள்ளது.`;
    }

    alerts.push({
      id: `alert_heat_${todayDate}`,
      type: "extreme_heat",
      severity: maxTemp >= 40 ? "high" : "moderate",
      title: "Extreme Heat & Evaporation Alert",
      titleTa: "அதிக வெப்ப எச்சரிக்கை",
      message: `Maximum temperatures expected to reach ${maxTemp}°C.`,
      messageTa: `இன்றைய வெப்பநிலை ${maxTemp}°C வரை உயரக்கூடும்.`,
      cropContext,
      cropContextTa,
      actionAdvice: "Irrigate early in the morning or evening; apply mulching to conserve moisture.",
      actionAdviceTa: "காலை அல்லது மாலை வேளையில் நீர் பாய்ச்சவும்; நிலப்போர்வை அமைத்து ஈரப்பதத்தை பாதுகாக்கவும்.",
      fingerprint: `heat_${todayDate}`,
      date: todayDate,
    });
  }

  // 3. Strong Wind Alert (> 35 km/h)
  if (windKph >= 35) {
    alerts.push({
      id: `alert_wind_${todayDate}`,
      type: "strong_wind",
      severity: windKph >= 45 ? "high" : "moderate",
      title: "High Wind Velocity Warning",
      titleTa: "பலத்த காற்று எச்சரிக்கை",
      message: `Wind speeds of ${windKph} km/h recorded.`,
      messageTa: `காற்றின் வேகம் மணிக்கு ${windKph} கி.மீ வரை வீசக்கூடும்.`,
      actionAdvice: "Provide staking support to tall crops (banana, sugarcane, tomato). Postpone foliar spraying.",
      actionAdviceTa: "வாழை, கரும்பு, தக்காளி பயிர்களுக்கு முட்டுக்கொடுக்கவும். இலைவழி தெளிப்பை தவிர்க்கவும்.",
      fingerprint: `wind_${todayDate}`,
      date: todayDate,
    });
  }

  // 4. Cold / Frost Risk (< 12°C)
  if (minTemp <= 12 && minTemp > -50) {
    alerts.push({
      id: `alert_cold_${todayDate}`,
      type: "cold_risk",
      severity: minTemp <= 8 ? "high" : "moderate",
      title: "Cold Temperature Advisory",
      titleTa: "குறைந்த குளிர் வெப்பநிலை எச்சரிக்கை",
      message: `Night temperatures dropping to ${minTemp}°C.`,
      messageTa: `இரவு வெப்பநிலை ${minTemp}°C வரை குறையக்கூடும்.`,
      actionAdvice: "Give light evening irrigation to maintain soil warmth around roots.",
      actionAdviceTa: "வேர் பகுதியில் வெப்பத்தை தக்கவைக்க மாலை வேளையில் லேசான நீர் பாய்ச்சவும்.",
      fingerprint: `cold_${todayDate}`,
      date: todayDate,
    });
  }

  // 5. Thunderstorm Alert
  if (current.condition.toLowerCase().includes("thunderstorm")) {
    alerts.push({
      id: `alert_thunder_${todayDate}`,
      type: "thunderstorm",
      severity: "high",
      title: "Thunderstorm Safety Alert",
      titleTa: "இடி மின்னல் எச்சரிக்கை",
      message: "Thunderstorm activity detected in your local area.",
      messageTa: "உங்கள் பகுதியில் இடி மின்னலுடன் கூடிய மழை பதிவாகியுள்ளது.",
      actionAdvice: "Stay away from open fields, electrical poles, and tall isolated trees during lightning.",
      actionAdviceTa: "மின்னலின் போது திறந்தவெளி வயல்வெளிகள் மற்றும் உயரமான மரங்களின் கீழ் நிற்க வேண்டாம்.",
      fingerprint: `thunder_${todayDate}`,
      date: todayDate,
    });
  }

  return alerts;
}

/**
 * Deduplicate and persist alert notifications into Firestore `notifications` collection.
 */
export async function syncWeatherAlertNotifications(
  ownerId: string,
  alerts: WeatherAlertItem[],
  isDemoMode: boolean = false
): Promise<number> {
  if (!ownerId || alerts.length === 0 || isDemoMode) return 0;

  try {
    const existing = await listOwned<NotificationItem>("notifications", ownerId);
    const existingFingerprints = new Set(
      existing.map((n) => (n as unknown as { fingerprint?: string }).fingerprint)
    );

    let createdCount = 0;
    for (const alert of alerts) {
      if (!existingFingerprints.has(alert.fingerprint)) {
        await createOwned("notifications", ownerId, {
          type: "weather",
          title: alert.title,
          message: `${alert.message} ${alert.actionAdvice}`,
          fingerprint: alert.fingerprint,
          severity: alert.severity,
          read: false,
          createdAt: new Date().toISOString(),
        } as unknown as Record<string, unknown>);
        createdCount++;
      }
    }
    return createdCount;
  } catch (err) {
    console.warn("Could not sync weather notifications:", err);
    return 0;
  }
}

/**
 * Browser Web Notification API Helpers
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return await Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string): boolean {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
