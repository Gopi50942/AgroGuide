import type {
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
} from "./types";
import { validateMediaFile } from "./validation";

// ─────────────────────────────────────────────
// Cloudinary Free-Tier Storage Provider (Public / Low-Sensitivity Media)
// Uses server-side signed API endpoint to prevent client secret exposure.
// ─────────────────────────────────────────────

export class CloudinaryStorageProvider implements StorageProvider {
  name = "cloudinary" as const;

  isConfigured(): boolean {
    if (typeof window === "undefined" && typeof process !== "undefined" && process.env) {
      return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );
    }
    return true;
  }

  async uploadImage(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    if (options?.classification === "private_sensitive") {
      return {
        success: false,
        provider: "cloudinary",
        errorCode: "PRIVATE_UPLOAD_DISABLED",
        error: "Private sensitive documents cannot be uploaded to public Cloudinary. Storing metadata reference only.",
      };
    }

    const mime = file.type || "image/jpeg";
    const size = file.size || 0;
    const validation = validateMediaFile(fileName, mime, size, "image");
    if (!validation.isValid) {
      return {
        success: false,
        provider: "cloudinary",
        errorCode: validation.errorCode,
        error: validation.error,
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("folder", options?.folder || "agroguide/public");
      formData.append("mediaType", "image");
      if (options?.ownerId) formData.append("ownerId", options.ownerId);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          provider: "cloudinary",
          errorCode: data.errorCode || "UPLOAD_FAILED",
          error: data.error || "Cloud media upload is not configured on this deployment.",
        };
      }

      return {
        success: true,
        url: data.url,
        publicId: data.publicId,
        provider: "cloudinary",
        mimeType: mime,
        sizeBytes: size,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "cloudinary",
        errorCode: "UPLOAD_FAILED",
        error: err?.message || "Failed to reach media upload endpoint.",
      };
    }
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
        provider: "cloudinary",
        errorCode: validation.errorCode,
        error: validation.error,
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("folder", options?.folder || "agroguide/audio");
      formData.append("mediaType", "audio");
      if (options?.ownerId) formData.append("ownerId", options.ownerId);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          provider: "cloudinary",
          errorCode: data.errorCode || "UPLOAD_FAILED",
          error: data.error || "Voice media upload unavailable on current deployment.",
        };
      }

      return {
        success: true,
        url: data.url,
        publicId: data.publicId,
        provider: "cloudinary",
        mimeType: mime,
        sizeBytes: size,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "cloudinary",
        errorCode: "UPLOAD_FAILED",
        error: err?.message || "Failed to upload audio file.",
      };
    }
  }

  async uploadDocument(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    // Private/sensitive government and farmer documents are prohibited on public Cloudinary
    return {
      success: false,
      provider: "cloudinary",
      errorCode: "PRIVATE_UPLOAD_DISABLED",
      error: "Private file upload is disabled in the free deployment. You can save document metadata/reference details.",
    };
  }

  async deleteFile(publicIdOrUrl: string): Promise<StorageDeleteResult> {
    try {
      const res = await fetch("/api/media/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: publicIdOrUrl }),
      });
      const data = await res.json();
      return { success: data.success || false, provider: "cloudinary" };
    } catch {
      // Safe non-fatal logging
      console.warn("REMOTE_MEDIA_DELETE_FAILED for", publicIdOrUrl);
      return { success: false, provider: "cloudinary", error: "REMOTE_MEDIA_DELETE_FAILED" };
    }
  }

  getProviderStatus() {
    const configured = this.isConfigured();
    return {
      name: "cloudinary" as const,
      isConfigured: configured,
      supportsPublicUploads: true,
      supportsPrivateUploads: false,
      messageEn: configured
        ? "Cloudinary public media storage active."
        : "Cloud media upload is not configured on this deployment.",
      messageTa: configured
        ? "கிளவுடினரி பொது ஊடக சேமிப்பு இயக்கத்தில் உள்ளது."
        : "இந்த சேவையகத்தில் கிளவுட் ஊடக பதிவேற்றம் கட்டமைக்கப்படவில்லை.",
    };
  }
}
