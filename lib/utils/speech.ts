import type { Language } from "@/types";

// ─────────────────────────────────────────────
// Thin wrapper around the browser's SpeechSynthesis API. Fails
// silently (returns false) when unsupported or no matching voice is
// available — callers should hide the speaker button in that case
// rather than surfacing an error to the farmer.
// ─────────────────────────────────────────────

const LOCALE: Record<Language, string> = { en: "en-IN", ta: "ta-IN" };

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(language: Language): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const locale = LOCALE[language];
  return (
    voices.find((v) => v.lang === locale) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(language)) ??
    undefined
  );
}

export function speak(text: string, language: Language): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    window.speechSynthesis.cancel(); // stop any current utterance first
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE[language];
    const voice = pickVoice(language);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
