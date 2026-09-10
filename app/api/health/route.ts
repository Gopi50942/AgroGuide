import { NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { SystemHealthStatus } from "@/types";

const startTime = Date.now();

export async function GET() {
  const firebaseConfigured = isFirebaseConfigured;
  const aiProviderConfigured = Boolean(
    process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY
  );
  const marketProviderConfigured = true; // Agmarknet public / data.gov.in integrated
  const weatherApiConfigured = true; // Open-Meteo public non-key API integrated
  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  const isDegraded = !firebaseConfigured || !aiProviderConfigured;

  const payload: SystemHealthStatus = {
    status: isDegraded ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    version: "2026.1",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    services: {
      firebaseConfigured,
      aiProviderConfigured,
      marketProviderConfigured,
      weatherApiConfigured,
      cloudinaryConfigured,
    },
  };

  return NextResponse.json(payload, {
    status: isDegraded ? 200 : 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
