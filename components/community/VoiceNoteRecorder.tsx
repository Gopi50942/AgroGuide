"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, CheckCircle2, Play, Pause } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  onAudioReady: (audioBlob: Blob | null, durationSeconds: number) => void;
  maxSeconds?: number;
}

export function VoiceNoteRecorder({ onAudioReady, maxSeconds = 60 }: Props) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "recording" | "recorded">("idle");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("recorded");
        onAudioReady(blob, secondsElapsed);

        // Stop media stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setState("recording");
      setSecondsElapsed(0);

      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => {
          if (prev >= maxSeconds - 1) {
            stopRecording();
            return maxSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Could not start recording:", err);
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function discardRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setState("idle");
    setSecondsElapsed(0);
    onAudioReady(null, 0);
  }

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={startRecording}
        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-forest-700 hover:bg-forest-100"
      >
        <Mic size={13} /> {t("community.recordVoiceNote")}
      </button>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex items-center gap-2.5 bg-rust-50 border border-rust-200 px-3 py-1.5 rounded-xl text-xs text-rust-800">
        <span className="w-2 h-2 rounded-full bg-rust-600 animate-ping" />
        <span className="font-semibold tabular-nums">{formatSec(secondsElapsed)} / {formatSec(maxSeconds)}</span>
        <button
          type="button"
          onClick={stopRecording}
          className="btn-primary text-xs py-1 px-2.5 bg-rust-600 hover:bg-rust-700 flex items-center gap-1"
        >
          <Square size={11} /> {t("community.stopRecording")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-cream-100 border border-forest-200 px-3 py-1.5 rounded-xl text-xs">
      <CheckCircle2 size={14} className="text-forest-700" />
      <span className="font-medium text-forest-900">
        {t("community.voiceNoteReady")} ({formatSec(secondsElapsed)})
      </span>
      <button
        type="button"
        onClick={discardRecording}
        className="p-1 text-ink-light hover:text-rust-500 rounded"
        title="Discard"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
