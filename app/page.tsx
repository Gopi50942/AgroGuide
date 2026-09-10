import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  Sparkles,
  Landmark,
  TrendingUp,
  Leaf,
  Droplets,
  Wallet,
  Stethoscope,
  Languages,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FieldIllustration } from "@/components/landing/FieldIllustration";
import { LIFECYCLE_STAGES, FEATURES, AI_DEMO_CONVERSATION } from "@/data/landingContent";

const FEATURE_ICONS = [CloudSun, Sparkles, Stethoscope, Landmark, TrendingUp, Leaf, Wallet, Droplets];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* ── Nav ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream-100/85 backdrop-blur border-b border-forest-100/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-light">
            <a href="#how-it-helps" className="hover:text-forest-700 transition-colors">How it helps</a>
            <a href="#features" className="hover:text-forest-700 transition-colors">Features</a>
            <a href="#government" className="hover:text-forest-700 transition-colors">Government access</a>
            <a href="#lifecycle" className="hover:text-forest-700 transition-colors">Crop lifecycle</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
            <Link href="/register" className="btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2.5">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-6 md:pt-20 md:pb-10 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <span className="section-eyebrow">AI-powered farming companion</span>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.05] font-semibold tracking-tight">
              Intelligence for
              <br />
              <span className="text-forest-600">every stage</span> of farming.
            </h1>
            <p className="mt-5 text-lg text-ink-light max-w-md">
              Plan better. Grow smarter. Protect your crops. Sell better —
              from the first seed to the final sale, in one place built for
              how farmers actually work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-secondary">
                Explore Features
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-ink-light">
              <div className="flex -space-x-2">
                {["🇮🇳", "🌾", "🚜"].map((e, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-forest-50 border border-cream-100 flex items-center justify-center text-sm">
                    {e}
                  </span>
                ))}
              </div>
              <span>Built for farmers across Tamil Nadu &amp; India</span>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-6 bg-forest-100/40 rounded-[2.5rem] -z-10 blur-2xl" />
            <FieldIllustration className="w-full h-auto drop-shadow-sm" />
          </div>
        </div>
      </section>

      {/* ── How AgroGuide Helps ──────────────────── */}
      <section id="how-it-helps" className="py-16 md:py-20 border-t border-forest-100/70">
        <div className="max-w-6xl mx-auto px-5">
          <span className="section-eyebrow">How AgroGuide helps</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold max-w-2xl">
            One companion, guiding you through the whole season.
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {["Plan", "Grow", "Protect", "Harvest", "Sell"].map((step, i) => (
              <div key={step} className="card p-5">
                <span className="text-clay-500 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{step}</h3>
                <p className="mt-1 text-sm text-ink-light">
                  {
                    [
                      "Choose the right crop for your land, season and budget.",
                      "Get irrigation, fertilization and task guidance as your crop develops.",
                      "Catch weather, pest and disease risk before they become losses.",
                      "Know when and how to bring in your crop with less waste.",
                      "Compare markets and reach official schemes to sell smarter.",
                    ][i]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section id="features" className="py-16 md:py-20 bg-forest-800 text-cream-50">
        <div className="max-w-6xl mx-auto px-5">
          <span className="section-eyebrow text-wheat-300">Features</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold max-w-xl">
            Everything a working farm actually needs.
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="rounded-xl2 bg-forest-700/60 border border-forest-600 p-5">
                  <Icon size={22} className="text-wheat-300" />
                  <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-cream-100/75 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Government Access ───────────────────── */}
      <section id="government" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="section-eyebrow">Government access</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
              One place to discover official farmer services.
            </h2>
            <p className="mt-4 text-ink-light max-w-md">
              AgroGuide never copies government content — it curates and
              links directly to official portals like PM-KISAN, e-NAM,
              Soil Health Card and Tamil Nadu&rsquo;s AGRISNET, matched
              informationally to your profile.
            </p>
            <Link href="/register" className="btn-secondary mt-6">
              Browse Government Services
            </Link>
          </div>
          <div className="grid gap-3">
            {[
              { name: "PM-KISAN", tag: "Central · Subsidy" },
              { name: "AGRISNET Tamil Nadu", tag: "State · Subsidy" },
              { name: "Soil Health Card Scheme", tag: "Central · Soil" },
            ].map((s) => (
              <div key={s.name} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-ink-light mt-0.5">{s.tag}</p>
                </div>
                <span className="chip">Official ↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Assistant Demo ────────────────────── */}
      <section className="py-16 md:py-20 border-t border-forest-100/70">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 card p-5 space-y-3">
            {AI_DEMO_CONVERSATION.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-forest-600 text-cream-50 rounded-br-sm"
                    : "bg-forest-50 text-ink rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <span className="section-eyebrow">AgroGuide AI</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
              An assistant that knows your farm.
            </h2>
            <p className="mt-4 text-ink-light max-w-md">
              Every answer is grounded in your soil, current crop stage and
              local weather — and every recommendation comes with a
              &ldquo;Why?&rdquo; so you understand the reasoning, not just the
              answer.
            </p>
          </div>
        </div>
      </section>

      {/* ── Crop Lifecycle ───────────────────────── */}
      <section id="lifecycle" className="py-16 md:py-20 bg-forest-50/60 border-y border-forest-100">
        <div className="max-w-6xl mx-auto px-5">
          <span className="section-eyebrow">Crop lifecycle</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold max-w-xl">
            A visual timeline for every crop you grow.
          </h2>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:gap-3">
            {LIFECYCLE_STAGES.map((s, i) => (
              <div key={s.key} className="min-w-[150px] md:min-w-0 card p-4">
                <span className="text-clay-500 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1.5 font-display font-semibold text-sm">{s.label}</h3>
                <p className="mt-1 text-xs text-ink-light leading-relaxed">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ─────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-6 card p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center">
              <Languages className="text-forest-600" size={22} />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Speak your language</h3>
              <p className="text-sm text-ink-light">தமிழ் &amp; English today — more languages on the way.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="chip">தமிழ்</span>
            <span className="chip">English</span>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────── */}
      <section className="py-20 bg-ink text-cream-50">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Start your smart farming journey.
          </h2>
          <p className="mt-3 text-cream-100/75">
            Free to explore, with a full demo farm ready the moment you sign in.
          </p>
          <Link href="/register" className="btn-primary mt-7">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="py-10 border-t border-forest-100/70">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-ink-light">
            © {new Date().getFullYear()} AgroGuide. Government links point to official sources only.
          </p>
        </div>
      </footer>
    </div>
  );
}
