"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { FieldIllustration } from "@/components/landing/FieldIllustration";

import { formatAuthError } from "@/lib/firebase/authErrors";

export default function RegisterPage() {
  const router = useRouter();
  const { registerEmail, signInGoogle, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerEmail(email, password, name);
      showToast(
        isDemoMode ? t("auth.demoToast") : t("auth.accountCreatedToast"),
        "success"
      );
      router.push("/dashboard");
    } catch (err) {
      showToast(formatAuthError(err, language), "warning");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInGoogle();
      router.push("/dashboard");
    } catch (err) {
      showToast(formatAuthError(err, language), "warning");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-forest-800 text-cream-50 p-10 relative overflow-hidden">
        <Logo />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-semibold max-w-sm">
            {t("auth.registerTitle")}
          </h2>
          <p className="mt-3 text-cream-100/70 max-w-sm">
            {t("auth.registerSubtitle")}
          </p>
        </div>
        <FieldIllustration className="absolute -bottom-10 -right-16 w-[130%] opacity-25" />
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <h1 className="text-2xl font-display font-semibold">{t("auth.register")}</h1>
        <p className="text-ink-light text-sm mt-1">
          {isDemoMode ? t("auth.demoRegisterNotice") : t("auth.createAccountSubtitle")}
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4 max-w-sm">
          <div>
            <label className="label-field">{t("auth.fullName")}</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder={t("auth.fullNamePlaceholder")}
              />
            </div>
          </div>
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
          <div>
            <label className="label-field">{t("auth.password")}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder={t("auth.passwordMinLength")}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("auth.creatingAccount") : t("auth.createAccountBtn")}
          </button>
        </form>

        <div className="my-6 max-w-sm flex items-center gap-3 text-xs text-ink-light">
          <div className="h-px flex-1 bg-forest-100" />
          {t("auth.or")}
          <div className="h-px flex-1 bg-forest-100" />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-secondary max-w-sm w-full">
          <Sparkles size={16} /> {t("auth.continueWithGoogle")}
        </button>

        <p className="mt-8 text-sm text-ink-light">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-semibold text-forest-700 hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

