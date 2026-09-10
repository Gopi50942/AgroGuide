"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic, Volume2 } from "lucide-react";

interface Props {
  src: string;
  title?: string;
  durationSeconds?: number;
}

export function AudioVoicePlayer({ src, title, durationSeconds }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-cream-100/90 border border-forest-200/70 p-2.5 rounded-xl flex items-center gap-3 w-full max-w-sm">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-forest-700 text-cream-50 flex items-center justify-center shrink-0 hover:bg-forest-800 transition-colors shadow-sm"
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] text-ink-light mb-1">
          <span className="flex items-center gap-1 font-medium text-forest-900 truncate">
            <Mic size={11} className="text-forest-600" />
            {title || "Voice Note"}
          </span>
          <span className="tabular-nums">
            {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-cream-300/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
