// ─────────────────────────────────────────────
// File Validation Utilities
// Safe MIME, extension, and size checks for public and AI media.
// ─────────────────────────────────────────────

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
export const ALLOWED_AUDIO_MIMES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"];
export const ALLOWED_DOC_MIMES = ["application/pdf", "image/jpeg", "image/png"];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const FORBIDDEN_EXTENSIONS = [
  ".html",
  ".htm",
  ".svg",
  ".js",
  ".mjs",
  ".ts",
  ".exe",
  ".sh",
  ".bat",
  ".php",
  ".py",
  ".dll",
];

export function validateMediaFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
  expectedType: "image" | "audio" | "document"
): { isValid: boolean; error?: string; errorCode?: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" } {
  const lowerName = fileName.toLowerCase();

  // Check forbidden extensions
  for (const ext of FORBIDDEN_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return {
        isValid: false,
        error: `Executable or script extension ${ext} is strictly prohibited.`,
        errorCode: "INVALID_FILE_TYPE",
      };
    }
  }

  if (expectedType === "image") {
    if (!ALLOWED_IMAGE_MIMES.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported image MIME type: ${mimeType}. Allowed: JPEG, PNG, WebP.`,
        errorCode: "INVALID_FILE_TYPE",
      };
    }
    if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Image size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 5MB.`,
        errorCode: "FILE_TOO_LARGE",
      };
    }
  } else if (expectedType === "audio") {
    if (!ALLOWED_AUDIO_MIMES.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported audio MIME type: ${mimeType}. Allowed: WebM, OGG, MP4, WAV, MP3.`,
        errorCode: "INVALID_FILE_TYPE",
      };
    }
    if (sizeBytes > MAX_AUDIO_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Audio size exceeds maximum limit of 10MB.`,
        errorCode: "FILE_TOO_LARGE",
      };
    }
  } else if (expectedType === "document") {
    if (!ALLOWED_DOC_MIMES.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported document MIME type: ${mimeType}. Allowed: PDF, JPEG, PNG.`,
        errorCode: "INVALID_FILE_TYPE",
      };
    }
    if (sizeBytes > MAX_DOC_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Document size exceeds maximum limit of 10MB.`,
        errorCode: "FILE_TOO_LARGE",
      };
    }
  }

  return { isValid: true };
}
