// ─────────────────────────────────────────────
// AgroGuide File Storage Abstraction Types
// Provider-neutral media and document storage interfaces.
// ─────────────────────────────────────────────

export type StorageProviderType = "cloudinary" | "local_demo" | "disabled_private" | "none";

export type MediaClassification = "public_low_sensitivity" | "private_sensitive" | "temporary_ai";

export interface StorageUploadOptions {
  ownerId?: string;
  classification?: MediaClassification;
  folder?: string;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  publicId?: string;
}

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  provider: StorageProviderType;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  error?: string;
  errorCode?: "STORAGE_NOT_CONFIGURED" | "PRIVATE_UPLOAD_DISABLED" | "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "UPLOAD_FAILED";
}

export interface StorageDeleteResult {
  success: boolean;
  provider: StorageProviderType;
  error?: string;
}

export interface StorageProvider {
  name: StorageProviderType;
  isConfigured(): boolean;
  uploadImage(file: File | Blob | Buffer, fileName: string, options?: StorageUploadOptions): Promise<StorageUploadResult>;
  uploadAudio(file: File | Blob | Buffer, fileName: string, options?: StorageUploadOptions): Promise<StorageUploadResult>;
  uploadDocument(file: File | Blob | Buffer, fileName: string, options?: StorageUploadOptions): Promise<StorageUploadResult>;
  deleteFile(publicIdOrUrl: string): Promise<StorageDeleteResult>;
  getProviderStatus(): {
    name: StorageProviderType;
    isConfigured: boolean;
    supportsPublicUploads: boolean;
    supportsPrivateUploads: boolean;
    messageEn: string;
    messageTa: string;
  };
}
