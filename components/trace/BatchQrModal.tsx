"use client";

import { useState } from "react";
import { QrCode, X, Download, Share2, Eye, ShieldCheck, Copy, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import type { HarvestBatch } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batch: HarvestBatch;
}

export function BatchQrModal({ isOpen, onClose, batch }: Props) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const isTa = language === "ta";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicTraceUrl = typeof window !== "undefined"
    ? `${window.location.origin}/trace/${batch.batchCode}`
    : `https://agroguide.app/trace/${batch.batchCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(publicTraceUrl);
    setCopied(true);
    showToast(isTa ? "இணைப்பு நகலெடுக்கப்பட்டது!" : "Traceability link copied!", "success");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm overflow-y-auto">
      <div className="card max-w-md w-full bg-white p-6 shadow-2xl rounded-2xl border border-forest-100 my-8 space-y-5 text-center">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-forest-100 pb-3 text-left">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {isTa ? "விளைபொருள் QR சான்றிதழ்" : "Harvest Provenance QR"}
            </h2>
            <p className="text-xs text-ink-light font-mono">{batch.batchCode}</p>
          </div>
          <button onClick={onClose} className="text-ink-lighter hover:text-ink p-1">
            <X size={20} />
          </button>
        </div>

        {/* QR Code Vector Mock */}
        <div className="p-6 bg-forest-50/50 rounded-2xl border border-forest-100 inline-block mx-auto">
          {/* SVG Generative QR Matrix */}
          <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#ffffff" rx="8" />
            {/* Top-Left Finder */}
            <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="4" />
            <rect x="14" y="14" width="16" height="16" fill="#ffffff" rx="2" />
            <rect x="18" y="18" width="8" height="8" fill="#15803d" rx="1" />

            {/* Top-Right Finder */}
            <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="4" />
            <rect x="70" y="14" width="16" height="16" fill="#ffffff" rx="2" />
            <rect x="74" y="18" width="8" height="8" fill="#15803d" rx="1" />

            {/* Bottom-Left Finder */}
            <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="4" />
            <rect x="14" y="70" width="16" height="16" fill="#ffffff" rx="2" />
            <rect x="18" y="74" width="8" height="8" fill="#15803d" rx="1" />

            {/* Simulated Data Pattern */}
            <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
            <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
            <rect x="40" y="38" width="8" height="8" fill="#15803d" />
            <rect x="54" y="44" width="6" height="6" fill="#0f172a" />
            <rect x="68" y="48" width="8" height="8" fill="#0f172a" />
            <rect x="44" y="68" width="6" height="6" fill="#0f172a" />
            <rect x="60" y="74" width="8" height="8" fill="#15803d" />
            <rect x="76" y="68" width="6" height="6" fill="#0f172a" />
          </svg>

          <div className="text-[11px] font-semibold text-forest-800 mt-2">
            {batch.crop} ({batch.qualityGrade})
          </div>
        </div>

        <p className="text-xs text-ink-light px-4">
          {isTa
            ? "இந்த QR குறியீட்டை வாடிக்கையாளர்கள் ஸ்கேன் செய்து அறுவடை தேதி மற்றும் தர சான்றிதழைப் பார்க்கலாம்."
            : "Consumers can scan this QR code to view authenticated harvest date and variety origin."}
        </p>

        {/* Copy Link & Share Actions */}
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check size={14} className="text-forest-600" /> : <Copy size={14} />}
            {copied ? (isTa ? "நகலெடுக்கப்பட்டது" : "Copied") : isTa ? "இணைப்பை நகலெடு" : "Copy Link"}
          </button>
          <a
            href={publicTraceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Eye size={14} /> {isTa ? "சான்றிதழைப் பார்" : "View Live Page"}
          </a>
        </div>
      </div>
    </div>
  );
}
