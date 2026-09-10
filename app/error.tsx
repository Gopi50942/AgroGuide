"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Redacted error logging in production
    console.error("[AgroGuide Production Error]", error?.message || "Unexpected UI error");
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6 text-center bg-white border border-rose-200 rounded-2xl shadow-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900">
          Something went wrong / பிழை ஏற்பட்டது
        </h2>
        <p className="text-xs text-ink-light">
          An unexpected issue occurred while rendering this page. Your agricultural data remains safe.
        </p>
        <p className="text-xs text-forest-700 font-medium">
          பக்கத்தை ஏற்றுவதில் பிழை ஏற்பட்டது. உங்கள் பண்ணைத் தரவுகள் பாதுகாப்பாக உள்ளன.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => reset()}
            className="btn btn-primary text-xs flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl"
          >
            <RefreshCw size={13} /> Try Again / மீண்டும் முயற்சி
          </button>
          <Link
            href="/dashboard"
            className="btn btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl"
          >
            <Home size={13} /> Dashboard / முகப்பு
          </Link>
        </div>
      </div>
    </div>
  );
}
