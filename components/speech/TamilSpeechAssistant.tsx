"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { processTamilSpeechQuery, type SpeechIntentResponse } from "@/lib/services/tamilSpeechAssistantService";

export function TamilSpeechAssistant() {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [response, setResponse] = useState<SpeechIntentResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();
      recognition.lang = language === "ta" ? "ta-IN" : "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setSpokenText(transcript);
        const res = processTamilSpeechQuery(transcript);
        setResponse(res);
        speakResponse(language === "ta" ? res.responseTa : res.responseEn);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      // Fallback simulation for unsupported browsers
      const fallbackQuery = "இன்று மழை வருமா?";
      setSpokenText(fallbackQuery);
      const res = processTamilSpeechQuery(fallbackQuery);
      setResponse(res);
      speakResponse(res.responseTa);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "ta" ? "ta-IN" : "en-IN";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="card p-5 border border-forest-100 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Sparkles size={16} className="text-forest-600" />
          {language === "ta" ? "குரல் வழி விவசாய உதவியாளர்" : "Tamil Speech-to-Speech Farmer Assistant"}
        </h3>
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1 text-[11px] text-rust-700 bg-rust-50 px-2 py-1 rounded-lg font-semibold"
          >
            <VolumeX size={13} /> {language === "ta" ? "நிறுத்து" : "Stop Speaking"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={startListening}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors ${
            isListening
              ? "bg-rust-600 text-white animate-pulse"
              : "bg-forest-700 hover:bg-forest-800 text-cream-50 shadow-sm"
          }`}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          {isListening
            ? language === "ta" ? "கேட்கிறது..." : "Listening..."
            : language === "ta" ? "பேசி கேட்கவும்" : "Speak Query"}
        </button>

        <p className="text-xs text-ink-light">
          {language === "ta"
            ? "வானிலை, சந்தை விலை, உரம் அல்லது பூச்சி தாக்குதல் குறித்து கேட்கவும்"
            : "Ask about weather, mandi prices, fertilizer, or crop diseases"}
        </p>
      </div>

      {spokenText && (
        <div className="p-3 bg-cream-50 rounded-xl border border-forest-100/60 text-xs space-y-1.5">
          <p className="text-ink-light"><strong>{language === "ta" ? "நீங்கள் கேட்டது:" : "You asked:"}</strong> {spokenText}</p>
          {response && (
            <p className="text-forest-900 font-semibold leading-relaxed">
              {language === "ta" ? response.responseTa : response.responseEn}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
