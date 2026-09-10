"use client";

import { Siren, Waves, Wind, Sun, Flame, Bug, Droplets, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/Primitives";
import { useLanguage } from "@/hooks/useLanguage";

export default function EmergencyPage() {
  const { language, t } = useLanguage();
  const isTa = language === "ta";

  const CATEGORIES = [
    {
      icon: Waves,
      title: isTa ? "வெள்ளம் மற்றும் அதிக மழை" : t("emergency.flood"),
      guidance: isTa
        ? [
            "மேடான பகுதிக்குச் செல்லவும் மற்றும் வேகமாக ஓடும் நீரிலிருந்து விலகி இருக்கவும்.",
            "தானியங்கள், விதைகள் மற்றும் வேளாண் உபகரணங்களை பாதுகாப்பான உயரமான இடங்களில் வைக்கவும்.",
            "வெள்ளம் சூழ்ந்த வயல்கள் அல்லது சாலைகளை கால்நடையாகவோ வாகனத்திலோ கடக்க வேண்டாம்.",
          ]
        : [
            "Move to higher ground and keep away from fast-flowing water.",
            "If safe, move stored grain, seed and equipment above expected water levels.",
            "Do not attempt to cross flooded fields or roads on foot or by vehicle.",
          ],
    },
    {
      icon: Wind,
      title: isTa ? "புயல் மற்றும் சூறாவளி காற்று" : t("emergency.cyclone"),
      guidance: isTa
        ? [
            "பண்ணைக் கருவிகள், தார்ப்பாய்கள் மற்றும் கூரை அமைப்புகளைப் பாதுகாப்பாகக் கட்டவும்.",
            "கடுமையான காற்றின் போது திறந்தவெளிகள் மற்றும் உயரமான மரங்களிலிருந்து விலகி இருக்கவும்.",
            "உங்கள் மாவட்டத்தில் உள்ள வேளாண் மற்றும் பேரிடர் எச்சரிக்கைகளைப் பின்பற்றவும்.",
          ]
        : [
            "Secure or store loose farm equipment and materials.",
            "Stay away from open fields and tall trees during high winds.",
            "Follow official warnings for evacuation timing in your district.",
          ],
    },
    {
      icon: Sun,
      title: isTa ? "வறட்சி மற்றும் கடும் வெப்பம்" : t("emergency.drought"),
      guidance: isTa
        ? [
            "பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் உள்ள பயிர்களுக்கு பாசன முன்னுரிமை அளிக்கவும்.",
            "மண்ணின் ஈரப்பதம் ஆவியாவதைத் தடுக்க நிலப்போர்வை (Mulching) அமைக்கவும்.",
            "வறட்சி நிவாரண நடவடிக்கைகள் குறித்து வட்டார வேளாண் அலுவலரைத் தொடர்பு கொள்ளவும்.",
          ]
        : [
            "Prioritize irrigation for the most water-sensitive crop stages.",
            "Consider mulching to reduce soil moisture loss.",
            "Contact your local agriculture office about drought relief measures.",
          ],
    },
    {
      icon: Flame,
      title: isTa ? "தீ விபத்து அவசரநிலை" : t("emergency.fire"),
      guidance: isTa
        ? [
            "வைக்கோல், உலர்ந்த பயிர்க்கழிவுகள் உள்ள பகுதிகளில் தீத்தடுப்பு வளையம் அமைக்கவும்.",
            "மனிதர்கள் மற்றும் கால்நடைகளை முதலில் பாதுகாப்பான இடத்திற்கு வெளியேற்றவும்.",
            "தீ விபத்து ஏற்பட்டால் உடனடியாக தீயணைப்புத் துறைக்கு (101) தகவல் தெரிவிக்கவும்.",
          ]
        : [
            "Keep a cleared firebreak around stored hay, straw and dry crop residue.",
            "Evacuate people and livestock first — property can be replaced.",
            "Call local emergency services immediately for active fires.",
          ],
    },
    {
      icon: Bug,
      title: isTa ? "தீவிர பூச்சி மற்றும் நோய் தாக்குதல்" : t("emergency.pestOutbreak"),
      guidance: isTa
        ? [
            "பாதிக்கப்பட்ட பகுதியை உடனடியாக தனிமைப்படுத்தி பரவலைக் கண்காணிக்கவும்.",
            "பெரிய அளவிலான தாக்குதலை உடனடியாக வட்டார வேளாண் விரிவாக்க மையத்தில் பதிவு செய்யவும்.",
            "பரிந்துரைக்கப்படாத பூச்சிக்கொல்லி கலவைகளைத் தவிர்க்கவும் — வேளாண் நிபுணர் ஆலோசனை பெறவும்.",
          ]
        : [
            "Isolate and inspect the affected area before it spreads further.",
            "Report large-scale outbreaks to your district agriculture office.",
            "Avoid unverified pesticide combinations under pressure — confirm dosage with an expert.",
          ],
    },
    {
      icon: Droplets,
      title: isTa ? "பாசன மோட்டார் / பம்ப் செயலிழப்பு" : t("emergency.irrigationFailure"),
      guidance: isTa
        ? [
            "அதிக நீர் அழுத்தம் தேவைப்படும் முக்கிய பயிர்களுக்கு மட்டும் முதலில் நீர் பாய்ச்சவும்.",
            "மின் இணைப்பு அல்லது பைப் அடைப்புகள் உள்ளதா என சரிபார்க்கவும்.",
            "அவசர பழுதுபார்ப்பு உதவிக்கு உள்ளூர் பாசன சேவை மையத்தை அணுகவும்.",
          ]
        : [
            "Prioritize water for your most water-stressed crop stage first.",
            "Check for simple fixes (clogged lines, pump power) before assuming major failure.",
            "Contact your irrigation service provider or local agriculture office for urgent repair support.",
          ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="card p-5 bg-rust-500 text-cream-50 border-rust-500 flex items-center gap-3">
        <Siren size={22} />
        <div>
          <p className="font-display font-semibold">{t("emergency.title")}</p>
          <p className="text-sm text-cream-100/85">{t("emergency.subtitle")}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <div key={c.title} className="card p-5">
            <div className="flex items-center gap-2 text-forest-700">
              <c.icon size={18} />
              <p className="font-display font-semibold">{c.title}</p>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-light">
              {c.guidance.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-forest-500">•</span> {g}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <SectionHeading title={t("emergency.resourcesTitle")} />
        <div className="card p-5 space-y-3 text-sm">
          <p className="text-ink-light">
            {t("emergency.resourcesIntro")}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="https://tnema.tn.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:underline"
            >
              TN State Disaster Management Authority <ExternalLink size={12} />
            </a>
            <a
              href="https://agricoop.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:underline"
            >
              Ministry of Agriculture & Farmers Welfare <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
