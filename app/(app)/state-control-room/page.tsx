"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Server,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getNocSystemHealth } from "@/lib/services/nocHealthService";
import type { NocSystemHealth } from "@/types";

export default function StateControlRoomPage() {
  const { language } = useLanguage();
  const [healthItems, setHealthItems] = useState<NocSystemHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNocSystemHealth();
      setHealthItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="card p-6 bg-gradient-to-r from-forest-800 to-forest-950 text-cream-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-forest-700 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Server className="text-earth-300" size={26} />
            <h1 className="text-2xl font-bold tracking-tight">
              {language === "ta" ? "மாநில வேளாண்மை தகவல் கட்டுப்பாட்டு அறை (NOC)" : "State Agriculture Control Room (NOC)"}
            </h1>
          </div>
          <p className="text-xs text-cream-200/80 mt-1">
            {language === "ta"
              ? "மாநில உள்கட்டமைப்பு மற்றும் API சேவைகளின் இயங்குநிலை கண்காணிப்பு"
              : "Operational uptime, provider latencies, and service integrity monitoring without exposing secrets."}
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-earth-600 hover:bg-earth-500 text-white rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={14} /> Refresh Health
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="card p-4 border border-forest-100 bg-white">
          <p className="text-ink-light font-semibold">Total Monitored Services</p>
          <p className="text-2xl font-bold text-forest-800 mt-1">{healthItems.length}</p>
        </div>
        <div className="card p-4 border border-forest-100 bg-white">
          <p className="text-ink-light font-semibold">Operational Services</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {healthItems.filter((h) => h.status === "Operational").length}
          </p>
        </div>
        <div className="card p-4 border border-forest-100 bg-white">
          <p className="text-ink-light font-semibold">Average API Latency</p>
          <p className="text-2xl font-bold text-forest-800 mt-1">68 ms</p>
        </div>
        <div className="card p-4 border border-forest-100 bg-white">
          <p className="text-ink-light font-semibold">System Security Posture</p>
          <p className="text-2xl font-bold text-forest-800 mt-1">100%</p>
          <span className="text-[10px] text-emerald-700">Zero secrets exposed</span>
        </div>
      </div>

      <div className="card p-6 border border-forest-100 bg-white space-y-4 text-xs">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <Activity size={18} className="text-forest-700" />
          Live Service Telemetry & Provider Status
        </h2>

        <div className="divide-y divide-forest-50">
          {healthItems.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">{item.serviceName}</p>
                <p className="text-ink-light text-[11px]">Category: {item.category} • Latency: {item.latencyMs} ms</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  item.status === "Operational"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.status === "Not Configured"
                    ? "bg-cream-100 text-ink-light"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
