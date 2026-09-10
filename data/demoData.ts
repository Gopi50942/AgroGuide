import type {
  FarmerProfile,
  Farm,
  Crop,
  CropTask,
  Expense,
  Revenue,
  DiaryEntry,
  CommunityPost,
  NotificationItem,
  AdvisoryAlert,
  SoilReport,
} from "@/types";

// All data on this file is CLEARLY LABELED DEMO DATA.
// It exists so AgroGuide looks and feels complete immediately
// after setup, before any real farmer data or live API is connected.

export const DEMO_FARMER: FarmerProfile = {
  uid: "demo-gopi",
  name: "Gopi",
  email: "gopi@example.com",
  phone: "+91 90000 00000",
  preferredLanguage: "en",
  state: "Tamil Nadu",
  district: "Coimbatore",
  location: { lat: 11.0168, lng: 76.9558 },
  landAreaAcres: 2,
  soilType: "Red loamy soil",
  irrigationType: "Drip irrigation",
  farmingType: "Vegetable farming",
  currentCrops: ["Tomato"],
  previousCrops: ["Brinjal", "Chilli"],
  equipmentOwned: ["Sprayer", "Pump"],
  livestock: [],
  experienceYears: 6,
  createdAt: new Date().toISOString(),
  isDemo: true,
};

export const DEMO_FARMS: Farm[] = [
  {
    id: "farm-1",
    ownerId: "demo-gopi",
    name: "Gopi's Home Field",
    location: "Sulur, Coimbatore, Tamil Nadu",
    areaAcres: 2,
    soilType: "Red loamy soil",
    irrigationType: "Drip irrigation",
  },
];

export const DEMO_CROPS: Crop[] = [
  {
    id: "crop-1",
    farmId: "farm-1",
    ownerId: "demo-gopi",
    name: "Tomato",
    variety: "PKM-1 Hybrid",
    sowingDate: "2026-06-27",
    expectedHarvestDate: "2026-09-20",
    areaAcres: 2,
    stage: "flowering",
    dayNumber: 42,
    notes: "Even fruit set on lower branches; staking completed last week.",
  },
];

export const DEMO_TASKS: CropTask[] = [
  { id: "t1", ownerId: "demo-gopi", cropId: "crop-1", title: "Crop inspection for early blight", category: "disease_inspection", dueDate: "2026-08-09", completed: false },
  { id: "t2", ownerId: "demo-gopi", cropId: "crop-1", title: "Apply potassium-rich fertilizer", category: "fertilization", dueDate: "2026-08-11", completed: false },
  { id: "t3", ownerId: "demo-gopi", cropId: "crop-1", title: "Check drip lines for clogging", category: "irrigation", dueDate: "2026-08-08", completed: true },
  { id: "t4", ownerId: "demo-gopi", cropId: "crop-1", title: "Stake and tie new lateral growth", category: "pruning", dueDate: "2026-08-06", completed: true },
];

export const DEMO_ALERTS: AdvisoryAlert[] = [
  {
    id: "a1",
    type: "weather",
    severity: "moderate",
    title: "Rain expected tomorrow",
    message: "Consider postponing irrigation for your tomato crop.",
    why: "Forecast shows a 70% chance of rain over the next 24 hours, which should meet most of the crop's water need.",
  },
  {
    id: "a2",
    type: "disease",
    severity: "moderate",
    title: "Disease risk: Moderate",
    message: "Humidity above 80% can raise fungal disease risk in flowering tomato.",
    why: "High humidity combined with warm temperatures favors early blight and leaf mold development.",
  },
  {
    id: "a3",
    type: "irrigation",
    severity: "low",
    title: "Delay irrigation",
    message: "Soil moisture from recent rain should be sufficient for 1–2 days.",
    why: "Rainfall recorded in the last 24 hours plus current soil type (loamy) retains moisture well.",
  },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", type: "weather", title: "Rain expected tomorrow", message: "Consider postponing irrigation.", read: false, createdAt: "2026-08-08T06:00:00Z" },
  { id: "n2", type: "disease_risk", title: "Moderate disease risk", message: "High humidity may increase fungal risk in tomato.", read: false, createdAt: "2026-08-07T14:00:00Z" },
  { id: "n3", type: "market_price", title: "Tomato prices trending up", message: "Nearby market shows a 6% increase this week.", read: true, createdAt: "2026-08-06T09:00:00Z" },
  { id: "n4", type: "crop_task", title: "Task due: Crop inspection", message: "Inspect crop for early blight symptoms.", read: true, createdAt: "2026-08-05T09:00:00Z" },
  { id: "n5", type: "government_scheme", title: "New scheme match found", message: "A micro-irrigation subsidy may match your profile.", read: true, createdAt: "2026-08-01T09:00:00Z" },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: "e1", ownerId: "demo-gopi", category: "seeds", amount: 3200, date: "2026-06-20", note: "Hybrid tomato seedlings" },
  { id: "e2", ownerId: "demo-gopi", category: "fertilizer", amount: 4500, date: "2026-06-28" },
  { id: "e3", ownerId: "demo-gopi", category: "labour", amount: 6000, date: "2026-07-05", note: "Transplanting labour" },
  { id: "e4", ownerId: "demo-gopi", category: "irrigation", amount: 2100, date: "2026-07-10", note: "Drip line repair" },
  { id: "e5", ownerId: "demo-gopi", category: "pesticides", amount: 1800, date: "2026-07-22" },
  { id: "e6", ownerId: "demo-gopi", category: "electricity", amount: 1400, date: "2026-07-30" },
];

export const DEMO_REVENUE: Revenue[] = [
  { id: "r1", ownerId: "demo-gopi", cropId: "crop-1", amount: 8000, date: "2026-07-15", note: "Partial early harvest sale" },
];

export const DEMO_DIARY: DiaryEntry[] = [
  { id: "d1", ownerId: "demo-gopi", date: "2026-08-05", note: "First flowering observed across most of the field. Bees active in the morning.", tags: ["flowering", "observation"] },
  { id: "d2", ownerId: "demo-gopi", date: "2026-07-28", note: "Light leaf curl on a few plants near the eastern edge — monitoring.", tags: ["pest_watch"] },
  { id: "d3", ownerId: "demo-gopi", date: "2026-06-27", note: "Transplanting completed. 2 acres, spacing 60x45cm.", tags: ["sowing"] },
];

export const DEMO_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    ownerId: "demo-gopi",
    authorName: "Meena R.",
    category: "disease",
    content: "Anyone else seeing early blight on tomato this week in Coimbatore district? Leaves showing concentric brown rings.",
    likes: 14,
    commentsCount: 6,
    createdAt: "2026-08-06T10:00:00Z",
  },
  {
    id: "p2",
    ownerId: "demo-gopi",
    authorName: "Suresh K.",
    category: "market",
    content: "Sold tomato at Ukkadam market today, ₹1,850/quintal — slightly better than last week.",
    likes: 22,
    commentsCount: 9,
    createdAt: "2026-08-05T16:30:00Z",
  },
  {
    id: "p3",
    ownerId: "demo-gopi",
    authorName: "Lakshmi P.",
    category: "government",
    content: "Got my micro-irrigation subsidy approved after the AGRISNET application — took about 5 weeks.",
    likes: 31,
    commentsCount: 12,
    createdAt: "2026-08-02T08:15:00Z",
  },
];

export const DEMO_SOIL_REPORTS: SoilReport[] = [
  {
    id: "soil-demo-1",
    ownerId: "demo-gopi",
    farmId: "farm-1",
    farmName: "Gopi's Home Field",
    sampleDate: "2026-06-15",
    ph: 6.8,
    nitrogen: 240,
    phosphorus: 18,
    potassium: 290,
    ec: 0.45,
    organicCarbon: 0.62,
    soilType: "Red loamy soil",
    notes: "Pre-sowing composite sample from 6 field spots.",
    recommendationSummary: [
      "pH is in a generally favorable range for most common crops.",
      "Nitrogen appears on the lower side — consider soil-test-based nitrogen management.",
    ],
    createdAt: "2026-06-16T10:00:00.000Z",
  },
];
