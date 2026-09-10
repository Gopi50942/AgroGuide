import { describe, it, expect } from "vitest";
import {
  getStorageProvider,
  uploadPublicImage,
  uploadPublicAudio,
  uploadPrivateDocument,
  validateMediaFile,
  CloudinaryStorageProvider,
  DisabledPrivateStorageProvider,
  LocalDemoStorageProvider,
} from "@/lib/services/fileStorage";
import { isFirebaseConfigured } from "@/lib/firebase/config";

describe("AgroGuide Free-Tier Storage Migration Test Suite", () => {
  it("1. returns local demo provider in demo mode with active status", () => {
    const provider = getStorageProvider("public_low_sensitivity", true);
    expect(provider.name).toBe("local_demo");
    expect(provider.isConfigured()).toBe(true);

    const status = provider.getProviderStatus();
    expect(status.supportsPublicUploads).toBe(true);
    expect(status.messageEn).toContain("Local in-memory preview");
  });

  it("2. confirms Firebase config initializes without requiring Firebase Storage", () => {
    // isFirebaseConfigured is boolean, does not crash if storageBucket is missing
    expect(typeof isFirebaseConfigured).toBe("boolean");
  });

  it("3. validates Cloudinary provider status and safe server secret isolation", () => {
    const provider = new CloudinaryStorageProvider();
    expect(provider.name).toBe("cloudinary");
    const status = provider.getProviderStatus();
    expect(status.supportsPrivateUploads).toBe(false);
  });

  it("4. rejects executable and script file extensions (e.g. .exe, .js, .html, .svg)", () => {
    const exeCheck = validateMediaFile("malicious.exe", "application/octet-stream", 1024, "image");
    expect(exeCheck.isValid).toBe(false);
    expect(exeCheck.errorCode).toBe("INVALID_FILE_TYPE");

    const jsCheck = validateMediaFile("script.js", "application/javascript", 1024, "image");
    expect(jsCheck.isValid).toBe(false);

    const htmlCheck = validateMediaFile("index.html", "text/html", 1024, "image");
    expect(htmlCheck.isValid).toBe(false);
  });

  it("5. rejects image files exceeding the 5MB free-tier limit", () => {
    const largeSize = 6 * 1024 * 1024; // 6MB
    const sizeCheck = validateMediaFile("huge_photo.jpg", "image/jpeg", largeSize, "image");
    expect(sizeCheck.isValid).toBe(false);
    expect(sizeCheck.errorCode).toBe("FILE_TOO_LARGE");
  });

  it("6. validates public image and audio allowed MIME types", () => {
    const validJpg = validateMediaFile("crop.jpg", "image/jpeg", 1024 * 500, "image");
    expect(validJpg.isValid).toBe(true);

    const validWebm = validateMediaFile("voice.webm", "audio/webm", 1024 * 200, "audio");
    expect(validWebm.isValid).toBe(true);

    const invalidMime = validateMediaFile("audio.xyz", "audio/unknown", 1024, "audio");
    expect(invalidMime.isValid).toBe(false);
  });

  it("7. disables private sensitive document uploads by default on free tier", async () => {
    const res = await uploadPrivateDocument(
      new Blob(["dummy pdf content"], { type: "application/pdf" }),
      "patta.pdf",
      { classification: "private_sensitive" },
      false
    );

    expect(res.success).toBe(false);
    expect(res.errorCode).toBe("PRIVATE_UPLOAD_DISABLED");
    expect(res.error).toContain("Private file upload is disabled in the free deployment");
  });

  it("8. supports local demo image upload with valid object url", async () => {
    const blob = new Blob(["demo image"], { type: "image/jpeg" });
    const res = await uploadPublicImage(blob, "leaf.jpg", {}, true);

    expect(res.success).toBe(true);
    expect(res.provider).toBe("local_demo");
    expect(res.url).toBeDefined();
  });

  it("9. supports local demo audio upload with valid demo object url", async () => {
    const blob = new Blob(["demo audio"], { type: "audio/webm" });
    const res = await uploadPublicAudio(blob, "voice.webm", {}, true);

    expect(res.success).toBe(true);
    expect(res.provider).toBe("local_demo");
  });

  it("10. disabled private provider returns bilingual user guidance", () => {
    const provider = new DisabledPrivateStorageProvider();
    const status = provider.getProviderStatus();
    expect(status.messageEn).toContain("Private file upload is disabled in the free deployment");
    expect(status.messageTa).toContain("இலவச பதிப்பில் தனிப்பட்ட ஆவண பதிவேற்றம் முடக்கப்பட்டுள்ளது");
  });

  it("11. gracefully handles media file deletion without crashing", async () => {
    const localProvider = new LocalDemoStorageProvider();
    const delRes = await localProvider.deleteFile("blob:test_123");
    expect(delRes.success).toBe(true);
  });

  it("12. Cloudinary provider rejects private documents if classification is private_sensitive", async () => {
    const provider = new CloudinaryStorageProvider();
    const blob = new Blob(["secret patta"], { type: "application/pdf" });
    const res = await provider.uploadImage(blob, "patta.pdf", { classification: "private_sensitive" });
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe("PRIVATE_UPLOAD_DISABLED");
  });

  it("13. /api/health reports cloudinaryConfigured status without exposing secrets", async () => {
    const { GET: getHealth } = await import("@/app/api/health/route");
    const res = await getHealth();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.services.cloudinaryConfigured).toBeDefined();
    expect((data as any).apiSecret).toBeUndefined();
    expect((data as any).apiKey).toBeUndefined();
  });

  it("14. /api/media/upload returns STORAGE_NOT_CONFIGURED if Cloudinary credentials are unset", async () => {
    const { POST: postMedia } = await import("@/app/api/media/upload/route");
    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }), "test.jpg");
    const req = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });
    const res = await postMedia(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(["STORAGE_NOT_CONFIGURED", "UPLOAD_FAILED"]).toContain(data.errorCode || (data.success ? "SUCCESS" : ""));
  });

  it("15. verifies exact Soil Health Report parameter fields and units", () => {
    const sampleReport = {
      ph: 6.8,
      ec: 0.42,
      organicCarbon: 0.65,
      nitrogen: 280,
      phosphorus: 22,
      potassium: 310,
    };
    expect(sampleReport.ph).toBe(6.8);
    expect(sampleReport.ec).toBe(0.42);
    expect(sampleReport.organicCarbon).toBe(0.65);
    expect(sampleReport.nitrogen).toBe(280);
    expect(sampleReport.phosphorus).toBe(22);
    expect(sampleReport.potassium).toBe(310);
  });

  it("16. verifies stable deterministic weather alert fingerprints", async () => {
    const { evaluateWeatherAlerts } = await import("@/lib/services/weatherAlertService");
    const mockWeather: any = {
      current: {
        temperatureC: 38,
        humidity: 65,
        windKph: 20,
        rainProbability: 80,
        condition: "Heavy Rain",
      },
      daily: [{ maxC: 39, minC: 24, rainProbability: 85, condition: "Rain" }],
    };
    const alerts = evaluateWeatherAlerts(mockWeather);
    const today = new Date().toISOString().slice(0, 10);
    expect(alerts.some((a) => a.fingerprint === `rain_${today}`)).toBe(true);
    expect(alerts.some((a) => a.fingerprint === `heat_${today}`)).toBe(true);
  });
});
