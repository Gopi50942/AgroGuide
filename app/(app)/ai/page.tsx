"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Sparkles,
  Mic,
  Square,
  Volume2,
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { useSharedWeather } from "@/hooks/useSharedWeather";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speak, isSpeechSynthesisSupported } from "@/lib/utils/speech";
import { parseVoiceNavigationIntent } from "@/lib/utils/voiceIntentRouter";
import { askAgroGuideAI, SUGGESTED_QUESTIONS } from "@/lib/services/aiService";
import { listCrops } from "@/lib/services/farmService";
import { listSoilReports } from "@/lib/services/soilService";
import { listDiseaseReports } from "@/lib/services/diseaseService";
import {
  listChatSessions,
  createChatSession,
  listSessionMessages,
  addSessionMessage,
  removeChatSession,
} from "@/lib/services/chatSessionService";
import { computeCropProgress } from "@/lib/utils/cropLifecycle";
import { DEMO_CROPS, DEMO_SOIL_REPORTS } from "@/data/demoData";
import type { ChatMessage, Crop, SoilReport, DiseaseReport, ChatSession } from "@/types";

export default function AiAssistantPage() {
  const router = useRouter();
  const { profile, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { weather } = useSharedWeather();
  const speechRecognition = useSpeechRecognition(language);
  const ttsSupported = isSpeechSynthesisSupported();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [latestSoil, setLatestSoil] = useState<SoilReport | null>(null);
  const [latestDisease, setLatestDisease] = useState<DiseaseReport | null>(null);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load farmer grounding data
  useEffect(() => {
    if (!profile) return;
    if (isDemoMode) {
      setCrop(DEMO_CROPS[0] ?? null);
      setLatestSoil(DEMO_SOIL_REPORTS[0] ?? null);
      return;
    }
    listCrops(profile.uid).then((crops) => setCrop(crops[0] ?? null));
    listSoilReports(profile.uid).then((reports) => setLatestSoil(reports[0] ?? null));
    listDiseaseReports(profile.uid).then((reports) => setLatestDisease(reports[0] ?? null));
  }, [profile, isDemoMode]);

  // Load chat sessions
  async function loadSessions() {
    if (!profile) return;
    if (isDemoMode) {
      setSessions([]);
      setLoadingSessions(false);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t("ai.welcome").replace(
            "{name}",
            profile?.name ?? (language === "ta" ? "நண்பரே" : "there")
          ),
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    setLoadingSessions(true);
    try {
      const list = await listChatSessions(profile.uid);
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        selectSession(list[0].id);
      } else if (list.length === 0) {
        initNewChat();
      }
    } catch {
      initNewChat();
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  async function selectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setLoading(true);
    try {
      const msgs = await listSessionMessages(sessionId);
      if (msgs.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: t("ai.welcome").replace(
              "{name}",
              profile?.name ?? (language === "ta" ? "நண்பரே" : "there")
            ),
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(msgs);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  function initNewChat() {
    setActiveSessionId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("ai.welcome").replace(
          "{name}",
          profile?.name ?? (language === "ta" ? "நண்பரே" : "there")
        ),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  async function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(t("ai.deleteChatConfirm"))) return;
    if (isDemoMode) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) initNewChat();
      showToast(t("ai.chatDeleted"), "success");
      return;
    }
    try {
      await removeChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) initNewChat();
      showToast(t("ai.chatDeleted"), "success");
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function send(question: string) {
    if (!question.trim() || !profile) return;

    let currentSessionId = activeSessionId;

    // If new session, create one with the user question as title
    if (!currentSessionId && !isDemoMode) {
      try {
        const title = question.slice(0, 40) + (question.length > 40 ? "…" : "");
        currentSessionId = await createChatSession(profile.uid, title, language, crop?.id);
        setActiveSessionId(currentSessionId);
        setSessions((prev) => [
          {
            id: currentSessionId!,
            ownerId: profile.uid,
            title,
            language,
            cropId: crop?.id,
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch {
        // Non-fatal
      }
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setLastFailedQuestion(null);

    // Save user message to Firestore
    if (currentSessionId && !isDemoMode) {
      addSessionMessage(profile.uid, currentSessionId, "user", question).catch(() => null);
    }

    const progress = crop ? computeCropProgress(crop) : null;

    // Send rolling context (last 6 messages)
    const rollingContext = messages.slice(-6);

    const result = await askAgroGuideAI(
      rollingContext,
      question,
      {
        profile: {
          name: profile.name,
          district: profile.district,
          state: profile.state,
          soilType: profile.soilType,
          irrigationType: profile.irrigationType,
        },
        cropName: crop?.name,
        cropStage: progress?.stage,
        weather: weather
          ? {
              temperatureC: weather.current.temperatureC,
              humidity: weather.current.humidity,
              rainProbability: weather.current.rainProbability,
              condition: weather.current.condition,
            }
          : undefined,
        soilReport: latestSoil
          ? {
              ph: latestSoil.ph,
              nitrogen: latestSoil.nitrogen,
              phosphorus: latestSoil.phosphorus,
              potassium: latestSoil.potassium,
              ec: latestSoil.ec,
              organicCarbon: latestSoil.organicCarbon,
              sampleDate: latestSoil.sampleDate,
              farmName: latestSoil.farmName,
              summary: latestSoil.recommendationSummary,
            }
          : undefined,
        diseaseReport: latestDisease
          ? {
              cropName: latestDisease.cropName,
              scanDate: latestDisease.scanDate,
              possibleIssue: latestDisease.possibleIssue,
              severity: latestDisease.severity,
              recommendation: latestDisease.recommendedSteps?.[0],
            }
          : undefined,
      },
      language
    );

    if (result.success) {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.data,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant message to Firestore
      if (currentSessionId && !isDemoMode) {
        addSessionMessage(profile.uid, currentSessionId, "assistant", result.data).catch(() => null);
      }
    } else {
      setLastFailedQuestion(question);
    }
    setLoading(false);
  }

  function handleMicTap() {
    if (speechRecognition.state === "listening") {
      speechRecognition.stop();
      return;
    }
    speechRecognition.start((transcript) => {
      setInput(transcript);
      const intent = parseVoiceNavigationIntent(transcript);
      if (intent.matched && intent.targetRoute) {
        showToast(
          language === "ta"
            ? `குரல் வழிசெலுத்தல்: ${intent.routeNameTa} திறக்கப்படுகிறது...`
            : `Voice Navigation: Opening ${intent.routeNameEn}...`
        );
        router.push(intent.targetRoute);
        return;
      }
      send(transcript);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-5.5rem)] animate-fade-up">
      {/* ── Top Header & Session Bar ── */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center text-cream-50 shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold">{t("nav.ai")}</h1>
            <p className="text-xs text-ink-light">{t("ai.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={initNewChat}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Plus size={13} /> {t("ai.newChat")}
          </button>
        </div>
      </div>

      {/* ── Sessions Carousel / Pills Bar ── */}
      {sessions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 shrink-0 transition-all ${
                activeSessionId === s.id
                  ? "bg-forest-600 text-cream-50 border-forest-600 font-semibold shadow-sm"
                  : "bg-cream-100 text-ink-light border-forest-100 hover:bg-forest-50"
              }`}
            >
              <MessageSquare size={12} />
              <span className="max-w-[140px] truncate">{s.title}</span>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className={`p-0.5 rounded hover:text-rust-500 ${
                  activeSessionId === s.id ? "text-cream-50/70 hover:text-cream-50" : "text-ink-light"
                }`}
                title={t("ai.deleteChat")}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Message Thread ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-forest-600 text-cream-50 rounded-br-sm"
                    : "card bg-cream-50 border-forest-100 text-ink rounded-bl-sm shadow-xs"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    {(m as any).isFallback ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-wheat-200 text-clay-800 border border-wheat-300">
                        🏷️ {language === "ta" ? "ஆஃப்லைன் / விதிமுறை பதில்" : "Offline / Rule-based fallback"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-100 text-forest-800 border border-forest-200">
                        🤖 {language === "ta" ? "நேரடி AI" : "Live AI"}
                      </span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
                {!isUser && ttsSupported && (
                  <button
                    onClick={() => speak(m.content, language)}
                    className="mt-2 text-xs text-forest-700 hover:underline flex items-center gap-1 opacity-75 hover:opacity-100"
                  >
                    <Volume2 size={13} /> {t("ai.speak")}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="card bg-cream-50 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-xs text-ink-light">
              <Loader2 size={14} className="animate-spin text-forest-600" />
              {t("ai.thinking")}
            </div>
          </div>
        )}

        {lastFailedQuestion && (
          <div className="card p-3 border-clay-300 bg-clay-50/50 flex items-center justify-between text-xs text-clay-700">
            <span>{t("ai.failed")}</span>
            <button
              onClick={() => send(lastFailedQuestion)}
              className="font-semibold text-forest-700 underline"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested Prompts (when starting new thread) ── */}
      {messages.length <= 1 && (
        <div className="pt-2 pb-1">
          <p className="text-xs text-ink-light flex items-center gap-1 mb-2 font-semibold">
            <Sparkles size={12} className="text-wheat-500" /> {t("ai.suggestedTitle")}:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => send(q)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-forest-200 bg-cream-100/60 hover:bg-forest-50 text-ink text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Box ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="pt-2 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            speechRecognition.state === "listening"
              ? t("ai.listening")
              : t("ai.inputPlaceholder")
          }
          className="input-field flex-1"
          disabled={loading}
        />
        {speechRecognition.supported && (
          <button
            type="button"
            onClick={handleMicTap}
            className={`p-2.5 rounded-xl border transition-all ${
              speechRecognition.state === "listening"
                ? "bg-rust-500 text-cream-50 border-rust-500 animate-pulse"
                : "border-forest-200 text-forest-700 hover:bg-forest-50"
            }`}
            title="Speech to text"
          >
            {speechRecognition.state === "listening" ? <Square size={18} /> : <Mic size={18} />}
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary p-2.5 rounded-xl"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
