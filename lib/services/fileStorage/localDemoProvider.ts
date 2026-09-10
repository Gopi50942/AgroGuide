import type {
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
} from "./types";
import { validateMediaFile } from "./validation";

// ─────────────────────────────────────────────
// Local Demo Storage Provider
// Creates local browser object URLs for non-cloud interactive testing.
// ─────────────────────────────────────────────

export class LocalDemoStorageProvider implements StorageProvider {
  name = "local_demo" as const;

  isConfigured(): boolean {
    return true;
  }

  async uploadImage(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const mime = file.type || "image/jpeg";
    const size = file.size || 0;
    const validation = validateMediaFile(fileName, mime, size, "image");
    if (!validation.isValid) {
      return {
        success: false,
        provider: "local_demo",
        errorCode: validation.errorCode,
        error: validation.error,
      };
    }

    const objectUrl = typeof window !== "undefined" ? URL.createObjectURL(file) : `blob:demo_${Date.now()}`;
    return {
      success: true,
      url: objectUrl,
      publicId: `local_demo_${Date.now()}`,
      provider: "local_demo",
      mimeType: mime,
      sizeBytes: size,
      uploadedAt: new Date().toISOString(),
    };
  }

  async uploadAudio(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const mime = file.type || "audio/webm";
    const size = file.size || 0;
    const validation = validateMediaFile(fileName, mime, size, "audio");
    if (!validation.isValid) {
      return {
        success: false,
        provider: "local_demo",
        errorCode: validation.errorCode,
        error: validation.error,
      };
    }

    const objectUrl = typeof window !== "undefined" ? URL.createObjectURL(file) : `blob:demo_audio_${Date.now()}`;
    return {
      success: true,
      url: objectUrl,
      publicId: `local_demo_audio_${Date.now()}`,
      provider: "local_demo",
      mimeType: mime,
      sizeBytes: size,
      uploadedAt: new Date().toISOString(),
    };
  }

  async uploadDocument(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const objectUrl = typeof window !== "undefined" ? URL.createObjectURL(file) : `blob:demo_doc_${Date.now()}`;
    return {
      success: true,
      url: objectUrl,
      publicId: `local_demo_doc_${Date.now()}`,
      provider: "local_demo",
      mimeType: file.type || "application/pdf",
      sizeBytes: file.size || 0,
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(publicIdOrUrl: string): Promise<StorageDeleteResult> {
    if (typeof window !== "undefined" && publicIdOrUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(publicIdOrUrl);
      } catch {}
    }
    return { success: true, provider: "local_demo" };
  }

  getProviderStatus() {
    return {
      name: "local_demo" as const,
      isConfigured: true,
      supportsPublicUploads: true,
      supportsPrivateUploads: false,
      messageEn: "Local in-memory preview mode active.",
      messageTa: "உள்ளூர் முன்னோட்ட நிலை இயக்கத்தில் உள்ளது.",
    };
  }
}
