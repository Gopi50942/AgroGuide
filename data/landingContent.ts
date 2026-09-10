export const LIFECYCLE_STAGES = [
  { key: "plan", label: "Plan", note: "Decide what to grow, where, and with what budget." },
  { key: "soil", label: "Soil", note: "Understand your soil and what it needs." },
  { key: "seed", label: "Seed", note: "Choose the right variety for your conditions." },
  { key: "sow", label: "Sow", note: "Time your sowing with weather and season." },
  { key: "grow", label: "Grow", note: "Irrigate, fertilize and protect through each stage." },
  { key: "protect", label: "Protect", note: "Catch pest and disease risk early." },
  { key: "harvest", label: "Harvest", note: "Know when your crop is ready." },
  { key: "store", label: "Store", note: "Reduce post-harvest loss." },
  { key: "sell", label: "Sell", note: "Find the market with the best return." },
  { key: "support", label: "Government Support", note: "Discover schemes you may qualify for." },
] as const;

export const FEATURES = [
  { title: "Weather & Farm Alerts", desc: "Hyperlocal forecasts turned into plain-language farming advisories." },
  { title: "AgroGuide AI", desc: "A farm-aware assistant that answers using your soil, crop and weather data." },
  { title: "AI Crop Doctor", desc: "Photograph a leaf or fruit for a cautious, confidence-rated assessment." },
  { title: "Government Services", desc: "One directory of official schemes, linked straight to the real portal." },
  { title: "Market Intelligence", desc: "Compare nearby markets and estimate your net return before you sell." },
  { title: "Soil Health", desc: "Log soil test values and get conservative, test-based guidance." },
  { title: "Finance Tracker", desc: "Track expenses and revenue, crop by crop, season by season." },
  { title: "Smart Irrigation", desc: "Clear irrigation recommendations, always with a 'Why?' explanation." },
] as const;

export const AI_DEMO_CONVERSATION = [
  { role: "user" as const, text: "Should I irrigate today?" },
  {
    role: "assistant" as const,
    text: "Rain is expected within 24 hours (70% probability) and your soil is loamy, which retains moisture well. You could likely delay irrigation by a day and recheck after the rain.",
  },
  { role: "user" as const, text: "Why?" },
  {
    role: "assistant" as const,
    text: "Delaying avoids overwatering. If the forecast changes or your soil dries out sooner than expected, irrigate as usual — this is guidance, not a guarantee.",
  },
];
