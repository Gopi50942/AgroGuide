import type { StorageProvider, StorageUploadOptions, StorageUploadResult } from "./types";
import { CloudinaryStorageProvider } from "./cloudinaryProvider";
import { DisabledPrivateStorageProvider } from "./disabledPrivateStorageProvider";
import { LocalDemoStorageProvider } from "./localDemoProvider";

export * from "./types";
export * from "./validation";
export { CloudinaryStorageProvider } from "./cloudinaryProvider";
export { DisabledPrivateStorageProvider } from "./disabledPrivateStorageProvider";
export { LocalDemoStorageProvider } from "./localDemoProvider";

// ─────────────────────────────────────────────
// Unified File Storage Manager
// Routes public media to free provider and private evidence to disabled metadata provider.
// ─────────────────────────────────────────────

const cloudinaryProvider = new CloudinaryStorageProvider();
const disabledPrivateProvider = new DisabledPrivateStorageProvider();
const localDemoProvider = new LocalDemoStorageProvider();

export function getStorageProvider(
  classification: "public_low_sensitivity" | "private_sensitive" | "temporary_ai" = "public_low_sensitivity",
  isDemoMode: boolean = false
): StorageProvider {
  if (isDemoMode) {
    return localDemoProvider;
  }

  if (classification === "private_sensitive") {
    return disabledPrivateProvider;
  }

  return cloudinaryProvider;
}

/**
 * Upload public image (e.g. farm diary, community photo)
 */
export async function uploadPublicImage(
  file: File | Blob,
  fileName: string,
  options?: StorageUploadOptions,
  isDemoMode: boolean = false
): Promise<StorageUploadResult> {
  const provider = getStorageProvider("public_low_sensitivity", isDemoMode);
  return provider.uploadImage(file, fileName, options);
}

/**
 * Upload public audio (e.g. community voice note)
 */
export async function uploadPublicAudio(
  file: File | Blob,
  fileName: string,
  options?: StorageUploadOptions,
  isDemoMode: boolean = false
): Promise<StorageUploadResult> {
  const provider = getStorageProvider("public_low_sensitivity", isDemoMode);
  return provider.uploadAudio(file, fileName, options);
}

/**
 * Safe rejection for private documents on free tier
 */
export async function uploadPrivateDocument(
  file: File | Blob,
  fileName: string,
  options?: StorageUploadOptions,
  isDemoMode: boolean = false
): Promise<StorageUploadResult> {
  const provider = getStorageProvider("private_sensitive", isDemoMode);
  return provider.uploadDocument(file, fileName, options);
}
