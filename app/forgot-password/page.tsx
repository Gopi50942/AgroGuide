"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const { resetPassword, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      if (isDemoMode) showToast("Password reset isn't needed in demo mode.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("common.error"), "warning");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Logo className="mb-8" />
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-light hover:text-forest-700 mb-4">
          <ArrowLeft size={15} /> {t("auth.backToLogin")}
        </Link>
        <h1 className="text-2xl font-display font-semibold">{t("auth.resetPasswordTitle")}</h1>

        {sent ? (
          <div className="card p-5 mt-6">
            <p className="text-sm text-ink-light">
              {t("auth.resetSent").replace("{email}", email)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-field">{t("auth.email")}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t("auth.sending") : t("auth.sendResetLink")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

