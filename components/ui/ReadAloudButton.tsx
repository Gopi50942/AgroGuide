"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/types";

interface Props {
  text: string;
  language?: Language;
  className?: string;
  size?: number;
  label?: string;
}

export function ReadAloudButton({
  text,
  language: propLang,
  className = "",
  size = 14,
  label,
}: Props) {
  const { language: contextLang, t } = useLanguage();
  const activeLang = propLang || contextLang;

  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  if (!isSupported || !text || !text.trim()) return null;

  function toggleSpeech(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLang === "ta" ? "ta-IN" : "en-IN";
    utterance.rate = activeLang === "ta" ? 0.9 : 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      activeLang === "ta"
        ? v.lang.startsWith("ta")
        : v.lang.startsWith("en-IN") || v.lang.startsWith("en")
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        isSpeaking
          ? "bg-forest-800 text-cream-50 animate-pulse shadow-sm"
          : "text-forest-700 bg-forest-50/80 hover:bg-forest-100 border border-forest-200/60"
      } ${className}`}
      title={isSpeaking ? t("voice.stopListening") : t("voice.readAloud")}
      aria-label={isSpeaking ? "Stop read aloud" : "Read aloud"}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={size} />
          <span>{t("voice.stopListening")}</span>
        </>
      ) : (
        <>
          <Volume2 size={size} />
          <span>{label || t("voice.readAloud")}</span>
        </>
      )}
    </button>
  );
}
