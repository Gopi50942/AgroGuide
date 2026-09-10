"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/types";

// ─────────────────────────────────────────────
// Thin wrapper around the browser's SpeechRecognition API.
// Not all browsers support it (notably Firefox and most desktop
// Safari) — `supported` tells the caller to hide/disable the mic
// button instead of crashing.
// ─────────────────────────────────────────────

type RecognitionState = "idle" | "listening" | "processing";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const LOCALE: Record<Language, string> = { en: "en-IN", ta: "ta-IN" };

export function useSpeechRecognition(language: Language) {
  const [state, setState] = useState<RecognitionState>("idle");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const start = useCallback(
    (onResult: (transcript: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setSupported(false);
        return;
      }
      const recognition = new Ctor();
      recognition.lang = LOCALE[language];
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        setState("processing");
        const transcript = Array.from(event.results as ArrayLike<SpeechRecognitionResultLike>)
          .map((r) => r[0].transcript)
          .join(" ")
          .trim();
        if (transcript) onResult(transcript);
      };
      recognition.onerror = () => setState("idle");
      recognition.onend = () => setState("idle");

      recognitionRef.current = recognition;
      setState("listening");
      recognition.start();
    },
    [language]
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  return { state, supported, start, stop };
}
