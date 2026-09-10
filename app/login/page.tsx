"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Phone, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { FieldIllustration } from "@/components/landing/FieldIllustration";

import { formatAuthError } from "@/lib/firebase/authErrors";

type Mode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const { signInEmail, signInGoogle, sendOtp, confirmOtp, enterDemoMode, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState<Awaited<ReturnType<typeof sendOtp>> | null>(null);
  const [loading, setLoading] = useState(false);

  function handleEnterDemo() {
    enterDemoMode();
    showToast(t("auth.demoToast"), "info");
    router.push("/dashboard");
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInEmail(email, password);
      showToast(t("auth.welcomeToast"), "success");
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
      showToast(t("auth.welcomeToast"), "success");
      router.push("/dashboard");
    } catch (err) {
      showToast(formatAuthError(err, language), "warning");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setLoading(true);
    try {
      const conf = await sendOtp(phone, "recaptcha-container");
      setConfirmation(conf);
      setOtpSent(true);
      showToast("OTP sent to your phone.", "info");
    } catch (err) {
      showToast(formatAuthError(err, language), "warning");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmOtp() {
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmOtp(confirmation, otp);
      showToast(t("auth.welcomeToast"), "success");
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
            {t("auth.welcomeBack")}
          </h2>
          <p className="mt-3 text-cream-100/70 max-w-sm">
            {t("auth.welcomeBackSubtitle")}
          </p>
        </div>
        <FieldIllustration className="absolute -bottom-10 -right-16 w-[130%] opacity-25" />
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <h1 className="text-2xl font-display font-semibold">{t("auth.login")}</h1>
        <p className="text-ink-light text-sm mt-1">
          {isDemoMode ? t("auth.demoLoginNotice") : t("auth.loginSubtitle")}
        </p>

        <div className="mt-6 flex rounded-full bg-forest-50 p-1 w-fit">
          <button
            onClick={() => setMode("email")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${mode === "email" ? "bg-cream-50 shadow-soft" : "text-ink-light"}`}
          >
            {t("auth.email")}
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${mode === "phone" ? "bg-cream-50 shadow-soft" : "text-ink-light"}`}
          >
            {t("auth.phoneOtp")}
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="mt-6 space-y-4 max-w-sm">
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
              <div className="flex justify-between">
                <label className="label-field">{t("auth.password")}</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-forest-600 hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4 max-w-sm">
            <div>
              <label className="label-field">{t("auth.phoneNumber")}</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t("auth.phonePlaceholder")}
                />
              </div>
            </div>
            {otpSent && (
              <div>
                <label className="label-field">{t("auth.enterOtp")}</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field tracking-[0.3em] text-center"
                  placeholder={t("auth.otpPlaceholder")}
                  maxLength={6}
                />
              </div>
            )}
            <div id="recaptcha-container" />
            <button
              onClick={otpSent ? handleConfirmOtp : handleSendOtp}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t("auth.pleaseWait") : otpSent ? t("auth.verifyOtp") : t("auth.sendOtp")}
            </button>
          </div>
        )}

        <div className="my-6 max-w-sm flex items-center gap-3 text-xs text-ink-light">
          <div className="h-px flex-1 bg-forest-100" />
          {t("auth.or")}
          <div className="h-px flex-1 bg-forest-100" />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-secondary max-w-sm w-full">
          <Sparkles size={16} /> {t("auth.continueWithGoogle")}
        </button>

        <button
          type="button"
          onClick={handleEnterDemo}
          className="mt-3 btn-ghost max-w-sm w-full text-xs font-semibold text-forest-800 border border-forest-200 hover:bg-forest-50 py-2.5 rounded-full"
        >
          🌱 {language === "ta" ? "டெமோ பயன்முறையை ஆராய்க (பதிவு தேவையில்லை)" : "Explore in Demo Mode (No account required)"}
        </button>

        <p className="mt-8 text-sm text-ink-light">
          {t("auth.newToAgroGuide")}{" "}
          <Link href="/register" className="font-semibold text-forest-700 hover:underline">
            {t("auth.createAccountBtn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

