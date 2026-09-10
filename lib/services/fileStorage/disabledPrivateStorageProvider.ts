import type {
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
} from "./types";

// ─────────────────────────────────────────────
// Disabled Private Storage Provider
// Explicit safe rejection for sensitive government / farmer documents on free tier.
// ─────────────────────────────────────────────

export class DisabledPrivateStorageProvider implements StorageProvider {
  name = "disabled_private" as const;

  isConfigured(): boolean {
    return false;
  }

  async uploadImage(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    return {
      success: false,
      provider: "disabled_private",
      errorCode: "PRIVATE_UPLOAD_DISABLED",
      error: "Private file upload is disabled in the free deployment. You can save document metadata/reference details.",
    };
  }

  async uploadAudio(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    return {
      success: false,
      provider: "disabled_private",
      errorCode: "PRIVATE_UPLOAD_DISABLED",
      error: "Private audio upload is disabled in the free deployment.",
    };
  }

  async uploadDocument(
    file: File | Blob,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    return {
      success: false,
      provider: "disabled_private",
      errorCode: "PRIVATE_UPLOAD_DISABLED",
      error: "Private file upload is disabled in the free deployment. You can save document metadata/reference details.",
    };
  }

  async deleteFile(publicIdOrUrl: string): Promise<StorageDeleteResult> {
    return { success: true, provider: "disabled_private" };
  }

  getProviderStatus() {
    return {
      name: "disabled_private" as const,
      isConfigured: false,
      supportsPublicUploads: false,
      supportsPrivateUploads: false,
      messageEn: "Private file upload is disabled in the free deployment. You can save document metadata/reference details.",
      messageTa: "இலவச பதிப்பில் தனிப்பட்ட ஆவண பதிவேற்றம் முடக்கப்பட்டுள்ளது. ஆவண குறிப்பு விவரங்களை மட்டும் சேமிக்கலாம்.",
    };
  }
}
