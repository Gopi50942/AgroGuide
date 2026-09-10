import type { BleSoilDeviceReading } from "@/types";

// ─────────────────────────────────────────────
// Phase 126: BLE Soil Testing Device Gateway Service
// Web Bluetooth abstraction for portable soil sensor kits. Non-certification disclaimer.
// ─────────────────────────────────────────────

export const BLE_SOIL_DISCLAIMER =
  "Device reading — not laboratory certification. For preliminary field screening and advisory calibration.";

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function parseBleSoilPayload(
  rawBytes: number[],
  deviceId: string = "BLE_SOIL_NPK_01"
): BleSoilDeviceReading {
  // Sample byte parsing format: [pH*10, EC_high, EC_low, N_high, N_low, P_high, P_low, K_high, K_low, Moisture, Temp]
  const ph = (rawBytes[0] || 65) / 10;
  const ec = ((rawBytes[1] || 0) << 8 | (rawBytes[2] || 120)) / 100;
  const n = (rawBytes[3] || 0) << 8 | (rawBytes[4] || 180);
  const p = (rawBytes[5] || 0) << 8 | (rawBytes[6] || 24);
  const k = (rawBytes[7] || 0) << 8 | (rawBytes[8] || 220);
  const moisture = rawBytes[9] || 28;
  const temp = (rawBytes[10] || 270) / 10;

  return {
    deviceId,
    modelName: "AgroGuide SoilSense Pro BLE-7",
    calibrationDate: "2026-04-15",
    readingTimestamp: new Date().toISOString(),
    ph,
    ec,
    nitrogenMgKg: n,
    phosphorusMgKg: p,
    potassiumMgKg: k,
    moisturePercent: moisture,
    temperatureC: temp,
    disclaimer: BLE_SOIL_DISCLAIMER,
  };
}

export function getSimulatedBleReading(deviceId: string = "BLE_SOIL_NPK_01"): BleSoilDeviceReading {
  return {
    deviceId,
    modelName: "AgroGuide SoilSense Pro BLE-7",
    calibrationDate: "2026-04-15",
    readingTimestamp: new Date().toISOString(),
    ph: 6.8,
    ec: 1.25,
    nitrogenMgKg: 195,
    phosphorusMgKg: 28,
    potassiumMgKg: 240,
    moisturePercent: 32,
    temperatureC: 27.5,
    disclaimer: BLE_SOIL_DISCLAIMER,
  };
}
