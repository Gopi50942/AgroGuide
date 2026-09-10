// ─────────────────────────────────────────────
// Firebase Auth Error Normalizer
// Translates raw Firebase error codes into clean bilingual user messages.
// ─────────────────────────────────────────────
import type { Language } from "@/types";

export function formatAuthError(error: unknown, language: Language = "en"): string {
  const isTa = language === "ta";
  if (!error) return isTa ? "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : "An error occurred. Please try again.";

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("auth/not-configured")) {
    return isTa
      ? "Firebase அங்கீகாரம் சேவையகத்தில் கட்டமைக்கப்படவில்லை. .env.local ஐ சரிபார்க்கவும் அல்லது டெமோ பயன்முறையில் தொடரவும்."
      : "Firebase Auth is not configured on this server. Please check .env.local credentials or use Demo Mode.";
  }

  if (message.includes("auth/api-key-not-valid") || message.includes("invalid-api-key") || message.includes("app-not-authorized")) {
    return isTa
      ? "Firebase API சாவி தவறாக உள்ளது. செல்லுபடியாகும் API சாவியை வழங்கவும் அல்லது டெமோ பயன்முறையில் தொடரவும்."
      : "Firebase client API key is invalid. Please pass a valid Firebase API key or explore in Demo Mode.";
  }

  if (message.includes("auth/user-not-found") || message.includes("auth/wrong-password") || message.includes("auth/invalid-credential") || message.includes("auth/invalid-login-credentials")) {
    return isTa
      ? "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். தயவுசெய்து சரிபார்க்கவும்."
      : "Invalid email or password. Please check your credentials.";
  }

  if (message.includes("auth/email-already-in-use")) {
    return isTa
      ? "இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழையவும்."
      : "This email is already registered. Please sign in instead.";
  }

  if (message.includes("auth/weak-password")) {
    return isTa
      ? "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்."
      : "Password should be at least 6 characters.";
  }

  if (message.includes("auth/popup-closed-by-user") || message.includes("auth/cancelled-popup-request")) {
    return isTa ? "கூகிள் உள்நுழைவு ரத்து செய்யப்பட்டது." : "Google sign-in was cancelled.";
  }

  if (message.includes("auth/network-request-failed")) {
    return isTa
      ? "நெட்வொர்க் இணைப்பு பிழை. உங்கள் இணைய இணைப்பை சரிபார்க்கவும்."
      : "Network error. Please check your internet connection.";
  }

  if (message.includes("auth/too-many-requests")) {
    return isTa
      ? "பல தோல்வியுற்ற முயற்சிகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்."
      : "Too many failed attempts. Please try again later.";
  }

  return isTa ? "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : `Authentication failed: ${message}`;
}
