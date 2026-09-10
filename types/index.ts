// ─────────────────────────────────────────────
// AgroGuide — Shared type definitions
// ─────────────────────────────────────────────

export type Language = "en" | "ta";

export interface WeatherAlert {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
  severity: "info" | "warning" | "danger";
  district: string;
  timestamp: string;
}

export interface MandiRecord {
  id?: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  arrivalDate?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export interface IrrigationLog {
  id: string;
  ownerId?: string;
  farmId?: string;
  cropId?: string;
  durationMinutes: number;
  waterSource?: string;
  method?: string;
  notes?: string;
  createdAt?: string;
}

export interface FarmerProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  preferredLanguage: Language;
  state: string;
  district: string;
  ageGroup?: string;
  gender?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    village?: string;
    panchayat?: string;
    taluk?: string;
    pinCode?: string;
    displayName?: string;
    updatedAt?: string;
  };
  landOwnershipType?: "owned" | "leased" | "joint" | "ancestral" | "other";
  landAreaAcres?: number;
  landUnit?: "acres" | "hectares" | "cents" | "bigha" | "guntha";
  soilType?: string;
  irrigationType?: string;
  waterSource?: string;
  farmingType?: string;
  farmingExperienceYears?: number;
  currentCrops?: string[];
  previousCrops?: string[];
  preferredCrops?: string[];
  equipmentOwned?: string[];
  livestock?: string[];
  experienceYears?: number;
  farmingGoals?: string;
  approxFarmingExpensesAnnual?: number;
  hasAgriculturalLoans?: boolean;
  onboardingCompleted?: boolean;
  createdAt?: string;
  isDemo?: boolean;
}

export type UserProfile = FarmerProfile;

export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  areaAcres: number;
  landUnit?: string;
  ownershipType?: string;
  soilType: string;
  irrigationType: string;
  waterSource?: string;
  soilPh?: number;
  soilTestDate?: string;
  soilTestSummary?: string;
  cultivationType?: string;
  district?: string;
  taluk?: string;
  block?: string;
  village?: string;
  state?: string;
  totalAreaAcres?: number;
  acres?: number;
  coordinates?: { lat: number; lng: number };
  boundaryGeoJson?: FarmBoundaryGeoJson;
  notes?: string;
  imageUrls?: string[];
  createdAt?: string;
}

export type CropStage =
  | "land_preparation"
  | "seed_selection"
  | "sowing"
  | "germination"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "maturity"
  | "harvest"
  | "post_harvest";

export interface Crop {
  id: string;
  farmId: string;
  ownerId: string;
  name: string;
  localNameTamil?: string;
  variety?: string;
  fieldOrPlot?: string;
  sowingDate: string;
  expectedHarvestDate: string;
  areaAcres: number;
  stage: CropStage;
  currentStage?: CropStage;
  status?: string;
  dayNumber: number;
  seedSource?: string;
  seedQuantityKg?: number;
  plantingMethod?: string;
  spacing?: string;
  soilType?: string;
  irrigationMethod?: string;
  fertilizerPlan?: string;
  manureUsage?: string;
  pesticideUsage?: string;
  diseaseHistory?: string;
  pestHistory?: string;
  estimatedYieldQuintals?: number;
  actualYieldQuintals?: number;
  expectedSellingPricePerQuintal?: number;
  actualSellingPricePerQuintal?: number;
  cultivationCostRs?: number;
  actualHarvestDate?: string;
  notes?: string;
  imageUrls?: string[];
  createdAt?: string;
}

export interface CropTask {
  id: string;
  ownerId: string;
  cropId: string;
  farmId?: string;
  cropName?: string;
  title: string;
  titleTa?: string;
  description?: string;
  descriptionTa?: string;
  category:
    | "land_preparation"
    | "sowing"
    | "irrigation"
    | "fertilization"
    | "weeding"
    | "pest_inspection"
    | "disease_inspection"
    | "pruning"
    | "harvest_preparation"
    | "harvest"
    | "post_harvest";
  stage?: CropStage;
  dueDate: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
  generatedFromTemplate?: boolean;
  templateId?: string;
  daysFromSowing?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeatherCurrent {
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  rainProbability: number;
  rainfallMm: number;
  condition: string;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  isDemo: boolean;
}

export interface WeatherHourly {
  time: string;
  temperatureC: number;
  rainProbability: number;
}

export interface WeatherDaily {
  date: string;
  minC: number;
  maxC: number;
  rainProbability: number;
  condition: string;
}

export interface AdvisoryAlert {
  id: string;
  type: "weather" | "irrigation" | "disease" | "market" | "task" | "government";
  severity: "low" | "moderate" | "high";
  title: string;
  message: string;
  why?: string;
}

export interface NotificationItem {
  id: string;
  type:
    | "weather"
    | "crop_task"
    | "irrigation"
    | "disease_risk"
    | "market_price"
    | "government_scheme"
    | "harvest"
    | "farming_calendar";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface CropDoctorResult {
  possibleIssue: string;
  confidence: "low" | "moderate" | "high";
  symptoms: string[];
  severity: "low" | "moderate" | "high";
  whatToInspect: string[];
  recommendedSteps: string[];
  prevention: string[];
  isDemo: boolean;
}

export interface DiseaseReport {
  id: string;
  ownerId: string;
  farmId?: string;
  farmName?: string;
  cropId?: string;
  cropName?: string;
  cropStage?: string;
  imageUrl?: string;
  imageName?: string;
  possibleIssue: string;
  severity: "low" | "moderate" | "high";
  confidence: "low" | "moderate" | "high";
  symptoms: string[];
  whatToInspect: string[];
  recommendedSteps: string[];
  prevention: string[];
  disclaimer?: string;
  scanDate?: string;
  diagnosis?: string;
  diseaseName?: string;
  treatment?: string[];
  preventativeMeasures?: string[];
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SoilReport {
  id: string;
  ownerId: string;
  farmId: string;
  farmName?: string;
  sampleDate?: string;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ec?: number;
  organicCarbon?: number;
  soilType?: string;
  notes?: string;
  recommendationSummary?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  ownerId: string;
  category:
    | "seeds"
    | "fertilizer"
    | "labour"
    | "pesticides"
    | "irrigation"
    | "electricity"
    | "equipment"
    | "transport"
    | "storage"
    | "other";
  amount: number;
  date: string;
  note?: string;
  cropId?: string;
  farmId?: string;
}

export interface Revenue {
  id: string;
  ownerId: string;
  cropId?: string;
  farmId?: string;
  amount: number;
  date: string;
  note?: string;
}

export interface DiaryEntry {
  id: string;
  ownerId: string;
  farmId?: string;
  cropId?: string;
  cropName?: string;
  stage?: CropStage;
  date: string;
  note: string;
  imageUrls?: string[];
  daysAfterSowing?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type GovernmentLevel = "central" | "state";

export interface GovernmentService {
  id: string;
  name: string;
  nameTa?: string;
  description: string;
  descriptionTa?: string;
  category:
    | "subsidy"
    | "insurance"
    | "market"
    | "soil"
    | "irrigation"
    | "loan"
    | "mechanization"
    | "advisory"
    | "seed_fertilizer"
    | "general";
  state?: string;
  governmentLevel: GovernmentLevel;
  officialUrl: string;
  domain: string;
  lastVerified: string;
  active: boolean;
}

export interface SchemeMatch extends GovernmentService {
  matchPercent: number;
  matchReasons: string[];
}

export interface DiaryEntry {
  id: string;
  ownerId: string;
  date: string;
  note: string;
  imageUrls?: string[];
  tags?: string[];
}

export interface CommunityPost {
  id: string;
  ownerId: string;
  authorName: string;
  authorAvatar?: string;
  category:
    | "crop"
    | "disease"
    | "market"
    | "government"
    | "irrigation"
    | "equipment"
    | "general"
    | "advice"
    | "crop_disease"
    | "market_rate"
    | "success_story";
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  likes: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

// ── Loans & Financial Assistance ──────────────────────────

export type LoanCategory =
  | "crop_loan"
  | "kisan_credit_card"
  | "term_loan"
  | "irrigation_finance"
  | "farm_development"
  | "horticulture_finance"
  | "livestock_dairy_finance"
  | "machinery_finance"
  | "warehouse_finance"
  | "fpo_finance";

/**
 * A catalog entry describing a general category of agricultural credit
 * available in India (not a specific bank's live product feed — see
 * data/loanProducts.ts for the "why is this qualitative, not a rate
 * sheet" explanation). Never carries a specific numeric interest rate.
 */
export interface LoanProduct {
  id: string;
  name: string;
  category: LoanCategory;
  lenderType: string; // e.g. "Commercial banks, RRBs, cooperative banks"
  purpose: string;
  targetFarmer: string;
  eligibility: string[];
  documents: string[];
  howToApply: string;
  officialSource: string;
  officialUrl: string;
  lastVerified: string; // ISO date
}

/** A farmer's own record of a loan they've actually taken — private, Firestore-backed. */
export interface FarmerLoan {
  id: string;
  ownerId: string;
  lender: string;
  loanType: string;
  purpose: string;
  sanctionedAmount: number;
  outstandingAmount: number;
  interestRatePercent?: number;
  emiAmount?: number;
  startDate: string;
  nextDueDate?: string;
  endDate?: string;
  status: "active" | "closed" | "overdue";
  notes?: string;
}

export interface LoanRecommendation {
  product: LoanProduct;
  relevance: "high" | "medium" | "low";
  reasons: string[];
}

// ── Harvest & Produce Sales ──────────────────────────

export type QuantityUnit = "kg" | "quintal" | "tonne";

export interface HarvestRecord {
  id: string;
  ownerId: string;
  farmId?: string;
  farmName?: string;
  cropId: string;
  cropName: string;
  crop?: string;
  harvestDate: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  unit?: string;
  qualityGrade?: string;
  moisturePercent?: number;
  storageLocation?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BuyerType =
  | "mandi"
  | "trader"
  | "fpo"
  | "cooperative"
  | "direct_consumer"
  | "processor"
  | "other";

export type PaymentStatus = "paid" | "partially_paid" | "pending";

export interface ProduceSale {
  id: string;
  ownerId: string;
  farmId?: string;
  cropId: string;
  cropName: string;
  crop?: string;
  harvestRecordId?: string;
  saleDate: string;
  buyerName?: string;
  buyerType: BuyerType;
  marketName?: string;
  quantity: number;
  quantitySold?: number;
  quantityUnit: QuantityUnit;
  unit?: string;
  ratePerUnit: number;
  pricePerUnit?: number;
  grossAmount: number;
  totalAmount?: number;
  totalRevenueRs?: number;
  transportCost: number;
  commissionCost: number;
  otherSellingCost: number;
  netRealization: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Market Watchlist ──────────────────────────

export interface MarketWatchlist {
  id: string;
  ownerId: string;
  commodity: string;
  state: string;
  district: string;
  market?: string;
  targetPrice?: number;
  targetDirection: "ABOVE" | "BELOW";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Scheme Application Tracker ──────────────────────────

export type SchemeApplicationStatus =
  | "planning"
  | "applied"
  | "pending"
  | "document_verification"
  | "field_verification"
  | "approved"
  | "rejected"
  | "benefit_received";

export interface SchemeApplication {
  id: string;
  ownerId: string;
  schemeId: string;
  schemeName: string;
  applicationReference?: string;
  appliedDate: string;
  status: SchemeApplicationStatus;
  lastUpdatedDate?: string;
  notes?: string;
  officialUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Chat Session ──────────────────────────

export interface ChatSession {
  id: string;
  ownerId: string;
  title: string;
  language: Language;
  cropId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string;
}

// ── Community Comments ──────────────────────────

export interface CommunityComment {
  id: string;
  ownerId: string;
  postId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Privacy, Consent & Data Portability (Phases 22, 23, 24) ──

export type ConsentType =
  | "location"
  | "ai_processing"
  | "image_diagnosis"
  | "voice_recording"
  | "weather_notifications"
  | "community_media";

export interface UserConsent {
  id: string;
  ownerId: string;
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  version: string;
  updatedAt?: string;
}

export interface FarmerDataExportPayload {
  exportMetadata: {
    exportDate: string;
    version: string;
    farmerUid: string;
    farmerName?: string;
    recordCounts: Record<string, number>;
  };
  profile: any;
  farms: any[];
  crops: any[];
  soilReports: any[];
  diseaseReports: any[];
  irrigationLogs: any[];
  tasks: any[];
  expenses: any[];
  revenues: any[];
  harvests: any[];
  sales: any[];
  schemeApplications: any[];
  diaryEntries: any[];
  consents: any[];
}

// ── Audit Logs (Phase 25) ──────────────────────────

export type AuditActionType =
  | "PROFILE_UPDATE"
  | "FARM_CREATE"
  | "FARM_UPDATE"
  | "FARM_DELETE"
  | "CROP_CREATE"
  | "CROP_UPDATE"
  | "CROP_DELETE"
  | "SOIL_REPORT_SAVE"
  | "SOIL_REPORT_DELETE"
  | "DISEASE_REPORT_SAVE"
  | "DISEASE_REPORT_DELETE"
  | "IRRIGATION_LOG_SAVE"
  | "IRRIGATION_LOG_DELETE"
  | "EXPENSE_SAVE"
  | "EXPENSE_DELETE"
  | "HARVEST_RECORD_SAVE"
  | "HARVEST_RECORD_DELETE"
  | "PRODUCE_SALE_SAVE"
  | "PRODUCE_SALE_DELETE"
  | "SCHEME_STATUS_UPDATE"
  | "CONSENT_UPDATE"
  | "DATA_EXPORT_INITIATED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "GOV_CONNECTOR_ATTEMPT"
  | "OFFICER_ACCESS_GRANT"
  | "OFFICER_ACCESS_REVOKE"
  | "EQUIPMENT_REQUEST_CREATE"
  | "HARVEST_BATCH_CREATE"
  | "GRIEVANCE_FILED"
  | "GRIEVANCE_STATUS_UPDATE"
  | "INSPECTION_SUBMITTED"
  | "ADVISORY_PUBLISHED"
  | "MIS_EXPORT_GENERATED";

export type AuditEntityType =
  | "profile"
  | "farm"
  | "crop"
  | "soil_report"
  | "disease_report"
  | "irrigation_log"
  | "expense"
  | "harvest"
  | "produce_sale"
  | "scheme_application"
  | "consent"
  | "account"
  | "government_service"
  | "officer_access"
  | "equipment_request"
  | "harvest_batch"
  | "livestock"
  | "sustainability_practice"
  | "farmer_grievance"
  | "field_inspection"
  | "government_advisory";

export interface AuditLogEntry {
  id: string;
  ownerId: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId?: string;
  timestamp: string;
  source: "web" | "pwa" | "mobile";
  metadataSafe?: Record<string, string | number | boolean>;
}

// ── KVK & Agriculture Office Directory (Phase 26) ──

export type ExtensionOfficeType =
  | "kvk"
  | "district_agriculture_office"
  | "assistant_director_office"
  | "soil_testing_lab"
  | "kisan_call_center"
  | "fpo_support_center";

export interface ExtensionOffice {
  id: string;
  nameEn: string;
  nameTa: string;
  type: ExtensionOfficeType;
  district: string;
  state: string;
  addressEn: string;
  addressTa: string;
  pincode: string;
  phone?: string;
  tollFree?: string;
  email?: string;
  officialWebsite?: string;
  googleMapsUrl?: string;
  verifiedSource: string;
  servicesOfferedEn: string[];
  servicesOfferedTa: string[];
}

// ── Unified Farm Activity Timeline (Phase 28) ──────

export type TimelineEventType =
  | "crop_sowing"
  | "task_scheduled"
  | "task_completed"
  | "irrigation_recorded"
  | "soil_test"
  | "disease_scan"
  | "expense_logged"
  | "harvest_recorded"
  | "sale_recorded"
  | "diary_note"
  | "weather_alert";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  titleEn: string;
  titleTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
  farmId?: string;
  farmName?: string;
  cropId?: string;
  cropName?: string;
  category?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  severity?: "low" | "moderate" | "high";
  iconType: string;
}

// ── Crop Season Planner (Phase 29) ─────────────────

export type AgriSeason = "kharif" | "rabi" | "zaid" | "samba" | "kuruvai" | "thaladi" | "navarai" | "sornavari";

export interface CropSeasonPlanCriteria {
  state: string;
  district: string;
  seasonOrMonth: string;
  soilType: string;
  waterAvailability: "abundant" | "moderate" | "limited" | "rainfed";
  landAreaAcres: number;
}

export interface CropSeasonRecommendation {
  cropNameEn: string;
  cropNameTa: string;
  varietySuggestionsEn: string[];
  varietySuggestionsTa: string[];
  suitabilityReasonEn: string;
  suitabilityReasonTa: string;
  waterDemand: "Low" | "Moderate" | "High";
  durationDays: string;
  estimatedCostPerAcre: number;
  expectedYieldPerAcre: string;
  considerationsEn: string[];
  considerationsTa: string[];
  matchedSeason: string;
}

// ── Observability & Health Status (Phase 31) ───────

export interface SystemHealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  services: {
    firebaseConfigured: boolean;
    aiProviderConfigured: boolean;
    marketProviderConfigured: boolean;
    weatherApiConfigured: boolean;
    cloudinaryConfigured?: boolean;
  };
}

// ─────────────────────────────────────────────
// BATCH 4 — INSTITUTIONAL & ECOSYSTEM TYPES (Phases 32–41)
// ─────────────────────────────────────────────

// ── Phase 32: Role & Extension Officer Architecture ──

export type UserRole = "farmer" | "extension_officer" | "admin";

export interface OfficerProfile {
  uid: string;
  name: string;
  department: string;
  designation: string;
  district: string;
  officeName: string;
  verified: boolean;
  officialEmail: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OfficerAccessScope =
  | "farm_summary"
  | "crop_status"
  | "soil_reports"
  | "disease_reports"
  | "irrigation"
  | "scheme_support";

export interface FarmerOfficerAccess {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerDistrict?: string;
  officerId: string;
  officerName?: string;
  officerDesignation?: string;
  scopes: OfficerAccessScope[];
  granted: boolean;
  grantedAt: string;
  expiresAt: string;
  revokedAt?: string | null;
}

// ── Phase 33: SMS & WhatsApp Messaging Gateway ──

export type MessagingChannel = "sms" | "whatsapp" | "push" | "in_app";
export type AlertMessageType =
  | "severe_weather"
  | "task_reminder"
  | "market_target_reached"
  | "scheme_deadline"
  | "critical_advisory";

export interface MessageDeliveryLog {
  id: string;
  ownerId: string;
  channel: MessagingChannel;
  type: AlertMessageType;
  status: "delivered" | "failed" | "mocked" | "disabled";
  recipientContact: string;
  provider: "mock" | "twilio" | "gupshup" | "meta_whatsapp" | "disabled";
  sentAt: string;
  errorCategory?: string;
}

export interface MessagingPreferences {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  criticalOnly: boolean;
  language: "en" | "ta";
  phoneNumber?: string;
}

// ── Phase 34: FPO Produce Aggregation ──

export interface FPO {
  id: string;
  name: string;
  district: string;
  state: string;
  registrationReference?: string;
  verifiedStatus: boolean;
  contactPerson: string;
  contactPhone: string;
  cropsHandled: string[];
  isDemo?: boolean;
}

export interface FPOMembership {
  id: string;
  ownerId: string;
  farmerName: string;
  fpoId: string;
  fpoName: string;
  status: "pending" | "active" | "rejected" | "left";
  joinedDate: string;
}

export interface FPOLot {
  id: string;
  ownerId: string;
  fpoId: string;
  harvestRecordId?: string;
  crop: string;
  variety: string;
  grade: string;
  quantity: number;
  unit: QuantityUnit;
  availableDate: string;
  expectedPricePerUnit?: number;
  status: "offered" | "pooled" | "sold" | "withdrawn";
  createdAt: string;
}

export interface FPOBuyerRequirement {
  id: string;
  fpoId?: string;
  buyerName: string;
  crop: string;
  variety?: string;
  requiredQuantity: number;
  unit: QuantityUnit;
  offeredPricePerUnit: number;
  deliveryLocation: string;
  deadlineDate: string;
  status: "open" | "fulfilled" | "expired";
}

// ── Phase 35: GPS Farm Boundary / Polygon Mapping ──

export interface GeoPolygonCoordinate {
  lat: number;
  lng: number;
}

export interface FarmBoundaryGeoJson {
  type: "Polygon";
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
}

// ── Phase 36: Custom Hiring / Machinery Coordination ──

export type EquipmentCategory =
  | "tractor"
  | "power_tiller"
  | "rotavator"
  | "transplanter"
  | "harvester"
  | "sprayer"
  | "drone_sprayer"
  | "other";

export interface CustomHiringProvider {
  id: string;
  centerName: string;
  operatorType: "chc_government" | "fpo_cooperative" | "private_verified";
  district: string;
  taluk: string;
  contactNumber: string;
  equipmentAvailable: {
    category: EquipmentCategory;
    model: string;
    ratePerHourRs: number;
    availableCount: number;
  }[];
  verified: boolean;
  isDemo?: boolean;
}

export interface EquipmentRequest {
  id: string;
  ownerId: string;
  farmerName: string;
  farmerPhone: string;
  farmId: string;
  farmName: string;
  providerId: string;
  providerName: string;
  equipmentType: EquipmentCategory;
  preferredDate: string;
  durationHours: number;
  notes?: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

// ── Phase 37: Harvest Batch Traceability & QR Codes ──

export interface HarvestBatch {
  id: string;
  ownerId: string;
  batchCode: string;
  farmId: string;
  farmName?: string;
  cropId: string;
  crop: string;
  variety: string;
  harvestRecordId?: string;
  harvestDate: string;
  quantity: number;
  unit: QuantityUnit;
  qualityGrade: string;
  district: string;
  state: string;
  farmerConsentDisplayName?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface PublicTraceBatchPayload {
  batchCode: string;
  crop: string;
  variety: string;
  district: string;
  state: string;
  harvestDate: string;
  qualityGrade: string;
  farmerDisplayName?: string;
  verifiedBy: string;
  traceTimestamp: string;
}

// ── Phase 38: Livestock & Mixed Farming Ledger ──

export type LivestockAnimalType = "cow" | "buffalo" | "goat" | "sheep" | "poultry" | "other";

export interface LivestockRecord {
  id: string;
  ownerId: string;
  animalType: LivestockAnimalType;
  breed: string;
  tagNameOrNumber: string;
  gender: "female" | "male";
  birthDate?: string;
  acquiredDate: string;
  status: "active" | "sold" | "deceased";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MilkYieldLog {
  id: string;
  ownerId: string;
  animalId: string;
  animalTag?: string;
  date: string;
  morningLitres: number;
  eveningLitres: number;
  totalLitres: number;
  sellingPricePerLitre?: number;
  revenueGeneratedRs?: number;
  createdAt: string;
}

export interface LivestockHealthEvent {
  id: string;
  ownerId: string;
  animalId: string;
  date: string;
  eventType: "vaccination" | "deworming" | "vet_visit" | "symptom_note";
  title: string;
  notes: string;
  veterinarianName?: string;
  costRs?: number;
}

// ── Phase 39: Regional Language Expansion ──

export type SupportedLanguage = "en" | "ta" | "te" | "kn" | "ml" | "hi";

export interface LanguagePackMeta {
  code: SupportedLanguage;
  nameEn: string;
  nameNative: string;
  status: "production" | "beta";
  coveragePercent: number;
}

// ── Phase 40: Sustainable Farming & Carbon Indicators ──

export type SustainabilityPracticeType =
  | "crop_rotation"
  | "mulching"
  | "organic_manure"
  | "reduced_tillage"
  | "drip_irrigation"
  | "cover_crop"
  | "residue_incorporation"
  | "agroforestry";

export interface SustainabilityPracticeRecord {
  id: string;
  ownerId: string;
  farmId: string;
  practiceType: SustainabilityPracticeType;
  dateAdopted: string;
  areaAcresCovered: number;
  notes?: string;
  createdAt: string;
}

export interface SustainabilityScoreSummary {
  overallScore: number; // 0-100
  rating: "Low" | "Developing" | "Strong";
  waterEfficiencyRating: "Low" | "Developing" | "Strong";
  soilImprovementRating: "Low" | "Developing" | "Strong";
  inputEfficiencyRating: "Low" | "Developing" | "Strong";
  residueManagementRating: "Low" | "Developing" | "Strong";
  biodiversityRating: "Low" | "Developing" | "Strong";
  practicesCount: number;
  latestSoilOrganicCarbonPercent?: number;
  disclaimer: string;
}

// ── Phase 41: Government Integration Readiness Layer ──

export type GovernmentConnectorStatus =
  | "NOT_CONFIGURED"
  | "SANDBOX_READY"
  | "CONNECTED"
  | "ERROR";

export interface GovernmentConnectorResponse<T = any> {
  status: GovernmentConnectorStatus;
  providerName: string;
  message: string;
  data?: T;
  timestamp: string;
}

// ─────────────────────────────────────────────
// BATCH 5 — FINAL ECOSYSTEM & PRODUCTION TYPES (Phases 42–61)
// ─────────────────────────────────────────────

// ── Phase 47: Crop Insurance & Loss Evidence ──

export interface CropInsuranceRecord {
  id: string;
  ownerId: string;
  cropId: string;
  cropName: string;
  scheme: string; // e.g., "PMFBY (Pradhan Mantri Fasal Bima Yojana)" | "WBCIS"
  season: string;
  policyReference: string;
  insuredAreaAcres: number;
  sumInsuredRs?: number;
  premiumPaidRs?: number;
  status: "active" | "claimed" | "expired";
  createdAt: string;
}

export type LossEventType =
  | "cyclone_heavy_rain"
  | "drought_dry_spell"
  | "pest_outbreak"
  | "hailstorm"
  | "flood_inundation"
  | "unseasonal_rain"
  | "frost_cold_wave"
  | "other";

export interface CropLossEvent {
  id: string;
  ownerId: string;
  farmId: string;
  farmName?: string;
  cropId: string;
  cropName: string;
  eventType: LossEventType;
  eventDate: string;
  estimatedAffectedAreaAcres: number;
  farmerNotes: string;
  photoUrls?: string[];
  weatherContext?: {
    temperatureC?: number;
    rainfallMm?: number;
    windKph?: number;
  };
  policyReference?: string;
  isEvidenceGenerated?: boolean;
  createdAt: string;
}

// ── Phase 48: Warehouse / Cold Storage Directory ──

export type StorageFacilityType =
  | "dry_warehouse"
  | "cold_storage"
  | "pack_house"
  | "silo"
  | "fpo_storage";

export interface WarehouseFacility {
  id: string;
  nameEn: string;
  nameTa: string;
  district: string;
  taluk: string;
  addressEn: string;
  addressTa: string;
  facilityType: StorageFacilityType;
  capacityMetricTonnes?: number;
  suitableCropsEn: string[];
  suitableCropsTa: string[];
  contactPhone: string;
  officialSource: string; // e.g. "WDRA / TNCSC"
  isWdraAccredited: boolean;
  googleMapsUrl?: string;
}

export interface WarehouseReceiptRecord {
  id: string;
  ownerId: string;
  facilityId: string;
  facilityName: string;
  receiptNumber: string;
  crop: string;
  quantityStored: number;
  unit: QuantityUnit;
  storageDate: string;
  expiryDate: string;
  rentPerMonthRs?: number;
  notes?: string;
  createdAt: string;
}

// ── Phase 49: Solar Pump & Micro-Irrigation ──

export interface SolarPumpEstimateInput {
  farmAreaAcres: number;
  waterSourceType: "borewell" | "open_well" | "canal" | "farm_pond";
  waterDepthFeet: number;
  dailyPumpingHoursNeeded: number;
  currentPowerSource: "grid_electricity" | "diesel" | "none";
  pumpHp?: number;
}

export interface SolarPumpEstimateResult {
  recommendedPumpHp: number;
  suggestedSolarArrayKwp: number;
  estimatedDailyWaterOutputLitres: number;
  annualDieselSavingsRs?: number;
  co2ReductionTonnesPerYear: number;
  pmKusumSubsidyTierEn: string;
  pmKusumSubsidyTierTa: string;
  disclaimer: string;
}

// ── Phase 50: Agricultural Research & Extension Feed ──

export interface AgriculturalAdvisoryItem {
  id: string;
  titleEn: string;
  titleTa: string;
  source: string; // e.g. "TNAU Agritech", "ICAR", "IMD Agromet"
  category: "pest_disease" | "weather_alert" | "crop_practice" | "market_trend" | "scheme_announcement";
  publishDate: string;
  targetCrops: string[];
  targetDistricts: string[];
  summaryEn: string;
  summaryTa: string;
  officialLink: string;
}

// ── Phase 53: Agriculture Content / Admin CMS ──

export type ContentCatalogType =
  | "scheme_definition"
  | "crop_template"
  | "directory_entry"
  | "research_advisory"
  | "help_article";

export type ContentStatus = "draft" | "review" | "published" | "archived";

export interface ContentCatalogItem {
  id: string;
  type: ContentCatalogType;
  titleEn: string;
  titleTa: string;
  contentEn: string;
  contentTa: string;
  status: ContentStatus;
  version: string;
  authorId: string;
  publishedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Phase 54: Feature Flags & Remote Config ──

export type FeatureFlagKey =
  | "ENABLE_SMS"
  | "ENABLE_WHATSAPP"
  | "ENABLE_ENAM"
  | "ENABLE_AGRISTACK"
  | "ENABLE_OFFICER_PORTAL"
  | "ENABLE_LIVESTOCK"
  | "ENABLE_FPO"
  | "ENABLE_SOLAR_ESTIMATOR"
  | "ENABLE_INSURANCE_EVIDENCE"
  | "ENABLE_BETA_LANGUAGES"
  | "ENABLE_PILOT_MODE"
  | "GOVERNMENT_PILOT_MODE";

export type FeatureFlagsState = Record<FeatureFlagKey, boolean>;

// ── Phase 57: Privacy-Safe Product Analytics ──

export type AnalyticsEventName =
  | "page_view"
  | "feature_opened"
  | "crop_doctor_scanned"
  | "soil_health_calculated"
  | "market_price_viewed"
  | "weather_checked"
  | "irrigation_calculated"
  | "scheme_screened"
  | "task_completed"
  | "export_downloaded";

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
}

// ─────────────────────────────────────────────
// BATCH 6 — FINAL FIELD DEPLOYMENT & SCALE TYPES (Phases 62–81)
// ─────────────────────────────────────────────

// ── Phase 62: Farmer Master Profile ──

export interface FarmerMasterProfile {
  uid: string;
  name: string;
  preferredLanguage: string;
  phone?: string;
  email?: string;
  village?: string;
  district: string;
  state: string;
  pinCode?: string;
  primaryFarmId?: string;
  farmerCategory?: "marginal" | "small" | "medium" | "large";
  landAreaSummary: {
    totalAcres: number;
    activeFarmsCount: number;
  };
  irrigationSummary: {
    primaryType: string;
    dripCoveredAcres: number;
  };
  profileCompletionPercent: number;
  updatedAt: string;
}

// ── Phase 63: Data Quality Validation ──

export type DataQualitySeverity = "INFO" | "WARNING" | "CRITICAL";

export interface DataQualityIssue {
  id: string;
  severity: DataQualitySeverity;
  category: "crop" | "harvest" | "sale" | "finance" | "soil" | "farm";
  issueEn: string;
  issueTa: string;
  suggestionEn: string;
  suggestionTa: string;
  entityId?: string;
}

// ── Phase 65: Dashboard Priority Engine ──

export type DashboardPriorityLevel = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface DashboardPriorityItem {
  id: string;
  titleEn: string;
  titleTa: string;
  category: "weather" | "task" | "crop_disease" | "market" | "scheme" | "irrigation";
  priority: DashboardPriorityLevel;
  whyImportantEn: string;
  whyImportantTa: string;
  actionRoute: string;
  timestamp: string;
}

// ── Phase 66: Crop Risk Score ──

export type CropRiskLevel = "Low" | "Moderate" | "High";

export interface CropRiskAssessment {
  cropId: string;
  cropName: string;
  riskLevel: CropRiskLevel;
  riskScore: number; // 0 - 100
  keyRiskFactorsEn: string[];
  keyRiskFactorsTa: string[];
  preventiveActionEn: string;
  preventiveActionTa: string;
}

// ── Phase 69: Farmer Support Ticket System ──

export type SupportTicketCategory =
  | "technical"
  | "crop_advisory"
  | "government_scheme"
  | "market_mandi"
  | "insurance_claim"
  | "other";

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_for_farmer"
  | "resolved"
  | "closed";

export interface SupportTicket {
  id: string;
  ownerId: string;
  farmerName: string;
  farmerDistrict: string;
  category: SupportTicketCategory;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  advisoryNotes?: {
    officerId: string;
    officerName: string;
    note: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ── Phase 71: FPO Procurement Workflow ──

export type FPOProcurementStatus = "open" | "under_review" | "closed" | "completed";

export interface FPOProcurementRound {
  id: string;
  fpoId: string;
  fpoName: string;
  crop: string;
  grade: string;
  requiredQuantityQuintals: number;
  minimumLotQuintals: number;
  targetDate: string;
  referencePricePerQuintal?: number;
  status: FPOProcurementStatus;
  cutoffDate: string;
  createdAt: string;
}

// ── Phase 72: Produce Quality Grading Records ──

export type QualityAssessmentSource = "farmer_self" | "officer" | "laboratory";

export interface ProduceQualityRecord {
  id: string;
  ownerId: string;
  harvestBatchId?: string;
  crop: string;
  variety?: string;
  grade: "Grade A / Premium" | "Grade B / Standard" | "Grade C / Fair";
  moisturePercent?: number;
  sizeCategory?: "Large" | "Medium" | "Small";
  visualQualityScore: number; // 1 - 10
  foreignMatterPercent?: number;
  assessmentType: QualityAssessmentSource;
  assessorName?: string;
  notes?: string;
  createdAt: string;
}

// ── Phase 73: Farm Input Inventory Tracker ──

export type InputCategory =
  | "seed"
  | "fertilizer"
  | "pesticide"
  | "bio_input"
  | "livestock_feed"
  | "fuel"
  | "other";

export interface FarmInputInventoryItem {
  id: string;
  ownerId: string;
  itemName: string;
  category: InputCategory;
  quantityOnHand: number;
  reorderLevel: number;
  unit: string;
  purchaseDate: string;
  expiryDate?: string;
  purchaseCostRs: number;
  supplierName?: string;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Phase 74: Agricultural Expense Budget Planner ──

export interface CropBudgetItem {
  category: "seeds" | "fertilizers" | "labour" | "irrigation" | "machinery_rental" | "pest_control" | "other";
  plannedCostRs: number;
  actualCostRs: number;
}

export interface CropBudgetPlan {
  id: string;
  ownerId: string;
  farmId: string;
  cropId: string;
  cropName: string;
  season: string;
  totalPlannedBudgetRs: number;
  totalActualExpensesRs: number;
  varianceRs: number; // positive = under budget, negative = over budget
  budgetItems: CropBudgetItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Phase 75: Season-End Performance Report ──

export interface SeasonPerformanceReport {
  cropName: string;
  farmName: string;
  season: string;
  durationDays: number;
  areaAcres: number;
  totalExpensesRs: number;
  totalYieldQuantity: number;
  yieldUnit: string;
  totalSalesRevenueRs: number;
  netProfitRs: number;
  roiPercent: number;
  totalIrrigationLitres: number;
  diseaseIncidentsCount: number;
  tasksCompletionRatePercent: number;
  disclaimer: string;
}

// ── Phase 77: Farmer Document Metadata Vault ──

export type VaultDocumentType =
  | "soil_health_card"
  | "crop_insurance_policy"
  | "bank_sanction_letter"
  | "land_record_patta_chitta"
  | "government_scheme_receipt"
  | "warehouse_receipt"
  | "other";

export interface FarmerDocumentMetadata {
  id: string;
  ownerId: string;
  docType: VaultDocumentType;
  title: string;
  referenceNumber?: string;
  issuingAuthority: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
}

// ── Phase 81: Final Field Pilot Mode ──

export interface PilotFeedbackEntry {
  id: string;
  ownerId: string;
  farmerName?: string;
  category: "ux_clarity" | "ai_accuracy" | "offline_sync" | "weather_accuracy" | "language" | "bug_report";
  rating: number; // 1 - 5
  message: string;
  pageRoute: string;
  connectivityStatus: "online" | "offline";
  appVersion: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// BATCH 7 — GOVERNMENT AGRICULTURE PLATFORM V2 (Phases 102–121)
// ─────────────────────────────────────────────

export type GovernmentUserRole =
  | "farmer"
  | "extension_officer"
  | "block_officer"
  | "district_officer"
  | "state_admin"
  | "system_admin";

// ── Phase 103: Administrative Geography ──
export type AdminRegionType = "state" | "district" | "block" | "village";

export interface AdministrativeRegion {
  id: string;
  code: string;
  stateCode: string;
  districtCode?: string;
  blockCode?: string;
  villageCode?: string;
  nameEn: string;
  nameTa: string;
  type: AdminRegionType;
  parentCode?: string;
  active: boolean;
  isInternalCode: boolean;
}

// ── Phase 104: Farmer Registry & Service Enrollment ──
export interface FarmerServiceEnrollment {
  id: string;
  farmerId: string;
  internalFarmerCode: string; // AG-FARMER-XXXXXX (Zero Aadhaar)
  farmerName: string;
  programId: string;
  programNameEn: string;
  programNameTa: string;
  enrolledAt: string;
  status: "enrolled" | "in_progress" | "completed" | "withdrawn";
  consentId?: string;
  district: string;
  block?: string;
  village?: string;
}

// ── Phase 105: Farmer Grievance Redressal ──
export type GrievanceCategory =
  | "Scheme"
  | "Subsidy"
  | "Crop Insurance"
  | "Soil Testing"
  | "Irrigation"
  | "Market"
  | "Input Supply"
  | "Officer Support"
  | "Disaster Damage"
  | "Other";

export type GrievanceStatus =
  | "Submitted"
  | "Acknowledged"
  | "Assigned"
  | "Under Review"
  | "Field Verification"
  | "Resolved"
  | "Closed"
  | "Escalated";

export interface GrievanceAuditEntry {
  timestamp: string;
  actorId: string;
  actorRole: GovernmentUserRole;
  action: string;
  note?: string;
}

export interface FarmerGrievance {
  id: string;
  grievanceRefNumber: string; // e.g. AG-GRV-CBE-2026-000123
  farmerId: string;
  farmerName: string;
  category: GrievanceCategory;
  title: string;
  description: string;
  status: GrievanceStatus;
  district: string;
  block?: string;
  village?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  submittedAt: string;
  acknowledgedAt?: string;
  assignedAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  escalationLevel?: "Officer" | "Block" | "District";
  auditLogs: GrievanceAuditEntry[];
}

// ── Phase 106: Scheme Lifecycle Management ──
export type SchemeCycleStatus =
  | "Draft"
  | "Published"
  | "Applications Open"
  | "Applications Closed"
  | "Under Review"
  | "Completed";

export interface GovernmentSchemeCycle {
  id: string;
  schemeId: string;
  schemeNameEn: string;
  schemeNameTa: string;
  financialYear: string;
  applicationStart: string;
  applicationEnd: string;
  districtAvailability: string[];
  eligibilityRules: string[];
  officialUrl: string;
  status: SchemeCycleStatus;
  budgetAllocatedRs?: number;
  publishedByOfficerId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Phase 107: Subsidy Evidence Workspace ──
export type SubsidyEvidenceCategory =
  | "drip_irrigation"
  | "farm_pond"
  | "solar_pump"
  | "machinery"
  | "greenhouse"
  | "micro_irrigation";

export interface SubsidyDocChecklistItem {
  docType: string;
  labelEn: string;
  labelTa: string;
  uploaded: boolean;
  fileRef?: string;
}

export interface SubsidyEvidence {
  id: string;
  farmerId: string;
  farmId: string;
  farmName: string;
  schemeId: string;
  schemeName: string;
  applicationReference: string;
  category: SubsidyEvidenceCategory;
  requiredDocsChecklist: SubsidyDocChecklistItem[];
  invoiceNumber?: string;
  installationDate?: string;
  inspectionStatus: "Pending" | "Verified" | "Needs Clarification" | "Rejected Evidence";
  officerNotes?: string;
  verifiedByOfficerId?: string;
  updatedAt: string;
}

// ── Phase 108: Digital Field Inspection ──
export interface FieldInspection {
  id: string;
  inspectionRef: string; // e.g. AG-INSP-2026-0001
  officerId: string;
  officerName: string;
  farmerId: string;
  farmerName: string;
  farmId: string;
  farmName: string;
  purpose: string;
  scheduledDate: string;
  inspectionDate?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  farmCentroidMismatch: boolean; // Computed by comparing GPS with farm polygon centroid
  cropName?: string;
  cropStage?: string;
  observations: string;
  recommendations: string;
  status: "Draft" | "Completed" | "Synced";
  photoUrls?: string[];
  followUpDate?: string;
  createdAt: string;
}

// ── Phase 109: Village Crop Census ──
export interface VillageCropCensus {
  district: string;
  block: string;
  village: string;
  cropName: string;
  participatingFarmsCount: number;
  totalAcreage: number;
  stageDistribution: Record<string, number>; // stage -> acres
  estimatedHarvestWindow: string;
  privacyCohortProtected: boolean; // True if >= 5 farms, else obscured to protect farmer privacy
}

// ── Phase 110: Pest & Disease Surveillance Network ──
export type DiseaseSignalLevel = "Normal" | "Watch" | "Elevated" | "Outbreak Signal";

export interface DiseaseSurveillanceSignal {
  id: string;
  district: string;
  block: string;
  cropName: string;
  pathogenOrIssue: string;
  detectionCount: number;
  signalLevel: DiseaseSignalLevel;
  officerVerified: boolean;
  verificationNotes?: string;
  disclaimer: string;
  updatedAt: string;
}

// ── Phase 111: Climate & Disaster Command ──
export interface DisasterCommandAssessment {
  hazardType: "heavy_rain" | "flood_risk" | "heat_wave" | "strong_wind" | "dry_spell" | "cold_frost";
  district: string;
  potentiallyAffectedFarmers: number;
  potentialAcreage: number;
  dominantCrops: string[];
  criticalGrowthStages: string[];
  preparednessAdvisoriesEn: string[];
  preparednessAdvisoriesTa: string[];
  assessmentDate: string;
}

// ── Phase 112: Government Advisory Broadcast ──
export type AdvisoryBroadcastStatus = "Draft" | "Review" | "Approved" | "Published" | "Archived";

export interface GovernmentAdvisory {
  id: string;
  titleEn: string;
  titleTa: string;
  contentEn: string;
  contentTa: string;
  category: "weather" | "pest" | "irrigation" | "scheme" | "market" | "training";
  targetDistrict: string;
  targetBlock?: string;
  targetCrop?: string;
  status: AdvisoryBroadcastStatus;
  channels: ("in_app" | "sms" | "whatsapp")[];
  createdByOfficerId: string;
  approvedByOfficerId?: string;
  publishedAt?: string;
  createdAt: string;
}

// ── Phase 113: Farmer Beneficiary Segmentation ──
export interface BeneficiarySegment {
  segmentKey: string;
  nameEn: string;
  nameTa: string;
  count: number;
  totalAcreage: number;
  criteria: string;
}

// ── Phase 114: Extension Officer Work Planner ──
export interface OfficerTask {
  id: string;
  officerId: string;
  farmerId?: string;
  farmerName?: string;
  farmId?: string;
  farmName?: string;
  village?: string;
  taskType: "inspection" | "grievance_followup" | "disease_check" | "scheme_assistance" | "general_visit";
  title: string;
  scheduledDate: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Rescheduled" | "Cancelled";
  notes?: string;
}

// ── Phase 115: Soil Health Campaign Management ──
export interface SoilHealthCampaign {
  id: string;
  name: string;
  district: string;
  block: string;
  startDate: string;
  endDate: string;
  targetSamples: number;
  samplesCollected: number;
  reportsCompleted: number;
  abnormalPhCount: number;
  lowOrganicCarbonCount: number;
  status: "Planning" | "Active" | "Concluded";
}

// ── Phase 116: Water Resource & Irrigation Planning ──
export interface WaterResourcePlanning {
  district: string;
  block: string;
  dripCoverageAcres: number;
  floodIrrigationAcres: number;
  highWaterDemandAcres: number;
  estimatedDemandMillionLitres: number;
  rainfallDeficitPercent?: number;
}

// ── Phase 117: Agricultural Production Forecast ──
export interface ProductionForecast {
  cropName: string;
  district: string;
  estimatedAcreage: number;
  minProductionTonnes: number;
  maxProductionTonnes: number;
  participatingFarmsCount: number;
  methodologyDisclaimer: string;
}

// ── Phase 118: Price Intelligence & Market Intervention ──
export interface MarketPriceIntelligence {
  commodity: string;
  district: string;
  market: string;
  modalPrice: number;
  change7DayPercent: number;
  change30DayPercent: number;
  volatilityRating: "Low" | "Moderate" | "High";
  reviewRecommended: boolean;
}

// ── Phase 119: FPO Governance ──
export interface FpoInstitutionalSummary {
  fpoId: string;
  name: string;
  district: string;
  activeMembersCount: number;
  activeProcurementRounds: number;
  pooledCommodities: { commodity: string; pooledQuintals: number }[];
}

// ── Phase 120: Government MIS / KPI Reporting ──
export interface GovernmentMisReport {
  reportId: string;
  reportType: string;
  generatedDate: string;
  district: string;
  block?: string;
  participatingFarmersCount: number;
  summaryData: Record<string, any>;
}

// ─────────────────────────────────────────────
// BATCH 8 — STATE AGRICULTURE INTELLIGENCE + FIELD OPERATIONS (Phases 122–141)
// ─────────────────────────────────────────────

// ── Phase 122: AgriStack Sandbox Connector ──
export interface AgriStackRegistryStatus {
  status: "NOT_CONFIGURED" | "SANDBOX_READY" | "CONNECTED";
  farmerRefId?: string;
  landHoldingsCount?: number;
  message: string;
  timestamp: string;
}

// ── Phase 123: Groundwater / Piezometer Telemetry ──
export interface GroundwaterStationTelemetry {
  stationId: string;
  district: string;
  block: string;
  timestamp: string;
  waterLevelMeters: number; // meters below ground level
  trend: "Declining" | "Stable" | "Recovering";
  qualityFlag: "Good" | "Saline" | "Caution";
  disclaimer: string;
}

// ── Phase 124: Automated Weather Station Ingestion ──
export interface AwsStationObservation {
  stationId: string;
  stationName: string;
  district: string;
  block: string;
  timestamp: string;
  source: "TNAU_AWS" | "IMD_AGROMET" | "OPEN_METEO_PROXY";
  temperatureC: number;
  humidityPercent: number;
  rainfallMm24h: number;
  windSpeedKph: number;
  solarRadiationWm2?: number;
  soilTemperatureC?: number;
  observationType: "station_live" | "forecast" | "cached_observation";
}

// ── Phase 125: Crop Cutting Experiment Digital Ledger ──
export interface CropCuttingExperiment {
  id: string;
  experimentId: string; // e.g. CCE-CBE-2026-001
  district: string;
  block: string;
  village: string;
  farmId: string;
  farmerName: string;
  crop: string;
  season: string;
  plotAreaSqMeters: number;
  sampleAreaSqMeters: number; // typically 25 sq.m (5m x 5m triangle/square)
  harvestWeightKg: number;
  moisturePercent: number;
  normalizedYieldKgPerHa: number;
  normalizedYieldQuintalPerHa: number;
  officerId: string;
  officerName: string;
  inspectionDate: string;
  gpsLocation: {
    lat: number;
    lng: number;
  };
  status: "Draft" | "Collected" | "Verified" | "Submitted";
  photoEvidenceUrls?: string[];
}

// ── Phase 126: BLE Soil Testing Device Gateway ──
export interface BleSoilDeviceReading {
  deviceId: string;
  modelName: string;
  calibrationDate: string;
  readingTimestamp: string;
  ph: number;
  ec: number;
  nitrogenMgKg: number;
  phosphorusMgKg: number;
  potassiumMgKg: number;
  moisturePercent: number;
  temperatureC: number;
  disclaimer: string;
}

// ── Phase 127: Drone & CHC Fleet Scheduler ──
export type EquipmentAssetType = "drone" | "sprayer" | "tractor" | "harvester" | "transplanter";

export interface EquipmentAsset {
  id: string;
  assetType: EquipmentAssetType;
  modelName: string;
  district: string;
  block: string;
  operatorName: string;
  operatorPhone: string;
  ratePerHourRs: number;
  maintenanceStatus: "Operational" | "Maintenance" | "Offline";
}

export interface EquipmentBooking {
  id: string;
  bookingRef: string;
  assetId: string;
  assetType: EquipmentAssetType;
  farmerId: string;
  farmerName: string;
  farmId: string;
  district: string;
  scheduledDate: string;
  durationHours: number;
  status: "Requested" | "Confirmed" | "Completed" | "Cancelled";
}

// ── Phase 128: e-NAM Lot Sync Adapter ──
export interface EnamLotSyncStatus {
  lotId: string;
  mandiName: string;
  commodity: string;
  quantityQuintals: number;
  qualityGrade: string;
  currentBidRs?: number;
  status: "LOT_REGISTERED" | "BIDDING" | "UNSOLD" | "NOT_CONFIGURED";
}

// ── Phase 129: Fertilizer Supply & Rake Movement ──
export interface FertilizerStockPoint {
  id: string;
  district: string;
  warehouseName: string;
  fertilizerType: "Urea" | "DAP" | "MOP" | "NPK_Complex";
  openingStockTonnes: number;
  receivedTonnes: number;
  distributedTonnes: number;
  closingStockTonnes: number;
  updatedAt: string;
}

export interface FertilizerMovement {
  id: string;
  rakeNumber: string;
  source: string;
  destinationDistrict: string;
  fertilizerType: string;
  quantityTonnes: number;
  dispatchDate: string;
  expectedArrivalDate: string;
  status: "In Transit" | "Arrived" | "Delayed";
}

// ── Phase 130: Seed Quality & Certification Tracking ──
export interface SeedLot {
  id: string;
  lotNumber: string;
  crop: string;
  variety: string;
  producerName: string;
  category: "Breeder" | "Foundation" | "Certified";
  germinationPercent: number;
  purityPercent: number;
  testDate: string;
  labName: string;
  certificationRef: string;
  status: "Pending Test" | "Passed" | "Failed" | "Expired";
}

// ── Phase 131: SDRF Disaster Loss Dossier ──
export interface SdrfDisasterDossier {
  dossierId: string;
  district: string;
  hazardEvent: string;
  eventDate: string;
  affectedVillagesCount: number;
  affectedFarmersCount: number;
  totalAcreageDamaged: number;
  dominantCropsAffected: string[];
  verifiedInspectionsCount: number;
  estimatedLossRs: number;
  generatedDate: string;
  officialDisclaimer: string;
}

// ── Phase 132: Remote Sensing / Satellite Intelligence ──
export interface RemoteSensingIndexData {
  district: string;
  block: string;
  ndviIndex: number;
  eviIndex: number;
  ndwiIndex: number;
  cloudCoverPercent: number;
  vegetationAnomaly: "Normal" | "Moderate Deficit" | "Severe Stress" | "High Biomass";
  timestamp: string;
  source: "PUBLIC_SATELLITE_PROXY" | "NOT_CONFIGURED";
}

// ── Phase 133: Crop Health GIS Heatmap ──
export interface CropHealthGisLayer {
  district: string;
  block: string;
  healthLevel: "Normal" | "Watch" | "Elevated" | "Critical Review";
  activeAcreage: number;
  diseaseSignalCount: number;
  weatherRiskLevel: string;
  cohortFarmsCount: number;
}

// ── Phase 134: District Yield Anomaly Detection ──
export interface DistrictYieldAnomaly {
  district: string;
  crop: string;
  historicalYieldQuintalPerHa: number;
  currentEstimatedYieldQuintalPerHa: number;
  anomalyStatus: "Below historical range" | "Within expected range" | "Above historical range";
  explanation: string;
}

// ── Phase 135: Pest Spread Risk Model ──
export interface PestSpreadRiskAssessment {
  targetDistrict: string;
  targetBlock: string;
  pathogen: string;
  riskLevel: "Low" | "Watch" | "Elevated";
  contributingFactorsEn: string[];
  contributingFactorsTa: string[];
}

// ── Phase 136: Reservoir & Canal Irrigation Planning ──
export interface ReservoirCanalStatus {
  reservoirName: string;
  district: string;
  currentStorageTmc: number;
  totalCapacityTmc: number;
  livePercentage: number;
  canalReleaseCusecs: number;
  commandAreaAcreage: number;
  statusDisclaimer: string;
}

// ── Phase 137: Input Demand Forecasting ──
export interface InputDemandForecast {
  district: string;
  season: string;
  forecastedDemand: {
    category: string;
    estimatedQuantity: number;
    unit: string;
    disclaimer: string;
  }[];
}

// ── Phase 138: State Market Arrival Forecast ──
export interface MarketArrivalForecast {
  district: string;
  commodity: string;
  peakArrivalWindow: string;
  estimatedArrivalQuintalsMin: number;
  estimatedArrivalQuintalsMax: number;
  coverageDisclaimer: string;
}

// ── Phase 139: Farmer Training & Capacity Building ──
export interface TrainingProgram {
  id: string;
  titleEn: string;
  titleTa: string;
  topic: string;
  district: string;
  block: string;
  scheduledDate: string;
  trainerName: string;
  capacity: number;
  enrolledCount: number;
  status: "Scheduled" | "Completed" | "Cancelled";
}

// ── Phase 140: Agriculture Asset Registry ──
export type AgricultureAssetType =
  | "soil_lab"
  | "seed_lab"
  | "warehouse"
  | "cold_storage"
  | "chc"
  | "drone_hub"
  | "weather_station"
  | "irrigation_structure"
  | "training_center";

export interface AgricultureAsset {
  id: string;
  assetType: AgricultureAssetType;
  nameEn: string;
  nameTa: string;
  district: string;
  block: string;
  capacityDesc: string;
  status: "Operational" | "Limited" | "Offline" | "Under Maintenance";
  operatorName: string;
}

// ─────────────────────────────────────────────
// BATCH 9 — STATE DIGITAL INFRASTRUCTURE + RURAL LOGISTICS + OPEN DATA (Phases 142–161)
// ─────────────────────────────────────────────

// ── Phase 142: Hyperspectral & Multispectral Remote Sensing ──
export interface AdvancedRemoteSensingIndices {
  district: string;
  block: string;
  saviIndex: number;
  redEdgeIndex: number;
  soilSalinityProxy: "Low" | "Moderate" | "Elevated";
  nitrogenStressProxy: "Normal" | "Watch" | "Deficient";
  cropStressLevel: "Normal" | "Watch" | "Elevated";
  timestamp: string;
  source: "SENTINEL_PROXY" | "LANDSAT_PROXY" | "NOT_CONFIGURED";
}

// ── Phase 143: IoT Solar Pump Telemetry ──
export interface SolarPumpAsset {
  pumpId: string;
  ownerId: string;
  district: string;
  block: string;
  hpRating: number;
  installationDate: string;
  schemeSource: "PM-KUSUM Component B" | "State Solar Scheme";
  status: "Active" | "Maintenance" | "Offline";
}

export interface SolarPumpTelemetry {
  pumpId: string;
  timestamp: string;
  rpm: number;
  flowRateLpm: number;
  powerKw: number;
  dailyRuntimeMinutes: number;
  energyGeneratedKwh: number;
  estimatedWaterDeliveredLitres: number;
  alerts: string[];
  isDemo: boolean;
}

// ── Phase 144: Automated Mandi Price Webhook ──
export interface MandiWebhookPayload {
  market: string;
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
  source: string;
  timestamp: string;
}

// ── Phase 145: State Cold Chain Telemetry ──
export interface ColdChainAsset {
  id: string;
  assetType: "cold_storage" | "refrigerated_truck" | "pack_house";
  name: string;
  district: string;
  capacityTonnes: number;
  temperatureSetPointC: number;
  status: "Operational" | "Maintenance" | "Offline";
}

export interface ColdChainTelemetry {
  assetId: string;
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  doorOpen: boolean;
  gpsLocation?: { lat: number; lng: number };
  excursionAlert: boolean;
}

// ── Phase 146: Pesticide Retailer & Product Verification ──
export interface AgriInputRetailer {
  dealerId: string;
  dealerName: string;
  licenseReference: string;
  district: string;
  block: string;
  licenseExpiry: string;
  status: "Verified from source" | "Unverified" | "Expired" | "NOT_CONFIGURED";
  verifiedSource: string;
}

export interface PesticideProduct {
  productId: string;
  productName: string;
  activeIngredient: string;
  cibRegistrationNo: string;
  manufacturer: string;
  approvedCrops: string[];
  dosageGuidance: string;
  verificationStatus: "Approved by CIB&RC" | "Under Review" | "Restricted";
}

// ── Phase 147: FPO Export Compliance Dossier ──
export interface ExportComplianceDossier {
  dossierId: string;
  fpoId: string;
  fpoName: string;
  commodity: string;
  targetCountry: string;
  apedaRegistrationRef: string;
  phytosanitaryChecklistCompleted: boolean;
  packHouseReference: string;
  mrlResidueLabCertificateRef: string;
  batchTraceabilityCode: string;
  generatedDate: string;
  officialDisclaimer: string;
}

// ── Phase 148: Tamil Voice IVR Alert System ──
export interface VoiceIvrBroadcast {
  broadcastId: string;
  titleEn: string;
  titleTa: string;
  targetDistrict: string;
  targetBlock: string;
  alertCategory: "heavy_rain" | "flood_warning" | "pest_alert" | "scheme_deadline";
  audioScriptTa: string;
  status: "NOT_CONFIGURED" | "QUEUED" | "SENT" | "FAILED";
  createdAt: string;
}

// ── Phase 149: University Research Extension Connector ──
export interface ResearchExtensionPublication {
  id: string;
  source: "TNAU" | "ICAR" | "KVK";
  category: "variety_release" | "crop_advisory" | "research_bulletin" | "pest_advisory";
  title: string;
  summary: string;
  publicationDate: string;
  officialUrl: string;
  applicableCrops: string[];
}

// ── Phase 150: Soil Micronutrient Spatial Intelligence ──
export interface SoilMicronutrientDeficiency {
  district: string;
  block: string;
  zincDeficiencyPercent: number;
  boronDeficiencyPercent: number;
  ironDeficiencyPercent: number;
  sulphurDeficiencyPercent: number;
  organicCarbonDeficitPercent: number;
  samplesCount: number;
  spatialEstimateStatus: "Valid Interpolation" | "Insufficient Samples (Low Density)";
  disclaimer: string;
}

// ── Phase 151: State Agriculture Open Data Exchange ──
export interface OpenDataFeedMeta {
  endpoint: string;
  version: string;
  generatedAt: string;
  coverageSummary: string;
  minimumCohortThreshold: number;
  disclaimer: string;
}

// ── Phase 152: Village Agriculture Digital Twin ──
export interface VillageDigitalTwin {
  villageId: string;
  villageName: string;
  district: string;
  block: string;
  totalCultivatedAcres: number;
  cropAcreageBreakdown: Record<string, number>;
  activeCropStages: string[];
  rainfallRiskLevel: "Low" | "Moderate" | "Severe";
  pestSignalLevel: "Normal" | "Watch" | "Elevated";
  harvestExpected14DaysAcres: number;
  farmerCohortCount: number;
}

// ── Phase 153: Farm Machinery Utilization Intelligence ──
export interface MachineryUtilizationSummary {
  assetId: string;
  assetType: string;
  district: string;
  block: string;
  utilizationRatePercent: number;
  idleHoursPerWeek: number;
  bookingBacklogCount: number;
  demandStatus: "Underutilized" | "Optimal" | "High Demand / Shortage";
}

// ── Phase 154: Crop Residue Management ──
export interface CropResidueRecord {
  id: string;
  ownerId: string;
  farmId: string;
  crop: string;
  residueType: string;
  estimatedQuantityQuintals: number;
  plannedPractice: "mulching" | "compost" | "biochar" | "animal_feed" | "baling" | "incorporation";
  burningRisk: "Low" | "Moderate" | "High";
  guidanceNotesEn: string;
  guidanceNotesTa: string;
  createdAt: string;
}

// ── Phase 155: Farmer Disaster SOS & Rapid Response ──
export interface AgriSosReport {
  id: string;
  ownerId: string;
  farmerName: string;
  farmerPhone: string;
  farmId: string;
  district: string;
  block: string;
  village: string;
  emergencyType: "flood_inundation" | "hail_wind_collapse" | "canal_breach" | "wildlife_crop_damage" | "other";
  description: string;
  severity: "moderate" | "severe" | "critical";
  status: "Submitted" | "Acknowledged" | "Officer Assigned" | "Verified" | "Closed";
  assignedOfficerName?: string;
  photoUrls?: string[];
  timestamp: string;
  disclaimer: string;
}

// ── Phase 156: Warehouse Capacity Intelligence ──
export interface WarehouseCapacityIntelligence {
  warehouseId: string;
  warehouseName: string;
  district: string;
  totalCapacityTonnes: number;
  usedCapacityTonnes: number;
  availableCapacityTonnes: number;
  utilizationPercent: number;
  coldStorageAvailable: boolean;
  lastUpdated: string;
  freshness: "LIVE" | "RECENT" | "STALE";
}

// ── Phase 157: Dairy Cooperative Integration ──
export interface DairyCooperativeRecord {
  recordId: string;
  farmerId: string;
  collectionCenterId: string;
  date: string;
  morningLitres: number;
  eveningLitres: number;
  fatPercent: number;
  snfPercent: number;
  ratePerLitreRs: number;
  totalEarningsRs: number;
  qualityStatus: "Standard" | "Substandard";
  source: "COOPERATIVE_GATEWAY" | "MANUAL_ENTRY";
}

// ── Phase 158: Farm Produce Transport & Logistics ──
export interface ProduceTransportRequest {
  requestId: string;
  farmerId: string;
  farmerName: string;
  pickupVillage: string;
  destinationMandi: string;
  commodity: string;
  quantityQuintals: number;
  preferredDate: string;
  vehicleType: "mini_truck" | "pickup" | "large_truck";
  status: "Requested" | "Assigned" | "In Transit" | "Delivered" | "Cancelled";
  assignedDriverPhone?: string;
  createdAt: string;
}

// ── Phase 159: Agri Input Dealer Compliance Registry ──
export interface AgriDealerComplianceEntry {
  dealerId: string;
  businessName: string;
  licenseNumber: string;
  category: "fertilizer" | "seed" | "pesticide";
  district: string;
  block: string;
  licenseExpiry: string;
  complianceStatus: "Active" | "Expired" | "Suspended" | "Unverified";
  verifiedSource: string;
}

// ── Phase 160: Rural Agriculture Knowledge Graph ──
export interface KnowledgeGraphNode {
  id: string;
  type: "Crop" | "Variety" | "Disease" | "Pest" | "Soil" | "Nutrient" | "WeatherHazard" | "Scheme" | "Market" | "IrrigationMethod";
  name: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  sourceId: string;
  targetId: string;
  relation: "susceptible_to" | "favored_by" | "requires" | "supports" | "alleviates" | "traded_at";
  evidenceNote: string;
}

// ── Phase 161: State Agriculture Decision Intelligence Engine ──
export type StatePriorityLevel = "INFO" | "WATCH" | "HIGH PRIORITY" | "CRITICAL REVIEW";

export interface StateDecisionPriority {
  id: string;
  priorityLevel: StatePriorityLevel;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  district: string;
  block?: string;
  reasonEn: string;
  dataSource: string;
  freshness: "LIVE" | "RECENT" | "STALE";
  coverage: string;
  recommendedActionEn: string;
  recommendedActionTa: string;
}

// ─────────────────────────────────────────────
// BATCH 10 — FINAL GOVERNMENT SUPER PLATFORM COMPLETION (Phases 162–181)
// ─────────────────────────────────────────────

// ── Phase 162: IoT Soil Salinity & Piezometer Grid ──
export type SalinityWatchLevel = "Normal" | "Watch" | "Elevated" | "Critical Review";

export interface SalinityStation {
  stationId: string;
  district: string;
  block: string;
  latitude: number;
  longitude: number;
  source: string;
  qualityFlag: "Good" | "Calibrating" | "Caution";
  ecValueDsM: number; // Electrical Conductivity dS/m
  groundwaterEcValueDsM: number;
  waterLevelMeters: number;
  temperatureC: number;
  salinityWatchLevel: SalinityWatchLevel;
  freshness: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NOT_CONFIGURED";
  disclaimer: string;
}

// ── Phase 163: Drone Mission Planning Export ──
export interface DroneMissionPlan {
  missionId: string;
  farmId: string;
  farmerName: string;
  crop: string;
  areaAcres: number;
  plannedAltitudeMeters: number;
  plannedSpeedMps: number;
  swathWidthMeters: number;
  overlapPercent: number;
  operationType: "spraying" | "survey" | "seeding";
  estimatedDurationMinutes: number;
  waypointCount: number;
  polygonCoordinates: { lat: number; lng: number }[];
  disclaimer: string;
}

// ── Phase 164: Pesticide Residue QR Traceability ──
export interface ResidueTestRecord {
  id: string;
  batchId: string;
  crop: string;
  labName: string;
  labReference: string;
  sampleDate: string;
  testDate: string;
  resultStatus: "Pass / Below MRL" | "Detected within Limits" | "Exceeds MRL";
  analyteSummary: {
    chemical: string;
    detectedPpm: number;
    mrlLimitPpm: number;
  }[];
  verificationStatus: "Farmer Entered" | "Lab Document Uploaded" | "Verified Reference" | "Authority Verified";
  isPublicQrSafe: boolean;
}

// ── Phase 165: WDRA / e-NWR Connector ──
export interface WarehouseReceiptStatus {
  receiptNumber: string;
  wdraWarehouseCode: string;
  warehouseName: string;
  commodity: string;
  quantityQuintals: number;
  grade: string;
  pledgeStatus: "Unencumbered" | "Pledged";
  status: "NOT_CONFIGURED" | "VERIFIED" | "EXPIRED";
  message: string;
}

// ── Phase 166: Smart Canal & Sluice Flow Telemetry ──
export interface CanalSensor {
  sensorId: string;
  canalName: string;
  district: string;
  commandAreaAcres: number;
  waterLevelMeters: number;
  flowRateCusecs: number;
  gatePositionPercent: number;
  dischargeTrend: "Rising" | "Stable" | "Falling";
  freshness: "LIVE" | "RECENT" | "STALE";
  disclaimer: string;
}

// ── Phase 168: SAR Crop Lodging & Storm Damage ──
export interface SarDamageAnalysis {
  regionId: string;
  district: string;
  eventDate: string;
  sarSensor: "Sentinel-1 SAR";
  polarization: "VV/VH";
  lodgingRiskLevel: "No signal" | "Review" | "Elevated review";
  estimatedDamagedAcres: number;
  disclaimer: string;
}

// ── Phase 169: Bio-Control Lab Management ──
export type BiocontrolOrganism =
  | "Trichogramma chilonis"
  | "Trichoderma viride"
  | "Pseudomonas fluorescens"
  | "Nuclear Polyhedrosis Virus (NPV)";

export interface BiocontrolBatch {
  batchId: string;
  organismName: BiocontrolOrganism;
  productionDate: string;
  expiryDate: string;
  quantityLitresOrCards: number;
  unit: string;
  labName: string;
  districtAllocation: string;
  qualityStatus: "In Production" | "Quality Certified" | "Dispatched";
}

// ── Phase 170: Kisan Drone Energy & Battery Stations ──
export interface DroneBatteryStation {
  stationId: string;
  name: string;
  district: string;
  block: string;
  batteryType: string;
  totalSlots: number;
  availableSlots: number;
  chargingSlots: number;
  operationalStatus: "Operational" | "Maintenance" | "Offline";
  operatorName: string;
}

// ── Phase 171: Climate / Carbon MRV Readiness ──
export interface CarbonMrvRecord {
  id: string;
  farmId: string;
  ownerId: string;
  practiceType: "drip_irrigation" | "soil_organic_carbon" | "agroforestry" | "biochar" | "reduced_tillage" | "cover_crops";
  startDate: string;
  areaAcres: number;
  estimatedCo2EquivalentTonnesPerYear: number;
  verificationStatus: "Self Reported" | "Officer Inspected" | "Pending Third Party";
  disclaimer: string;
}

// ── Phase 172: Farmer Unified Agriculture Passbook ──
export interface FarmerPassbookData {
  farmerId: string;
  farmerName: string;
  village: string;
  district: string;
  activeFarmsCount: number;
  totalAcres: number;
  activeCrops: string[];
  soilReportsCount: number;
  tasksCompletedCount: number;
  totalExpensesRs: number;
  totalHarvestQuintals: number;
  totalSalesRevenueRs: number;
  schemesEnrolledCount: number;
  trainingAttendedCount: number;
  lastUpdated: string;
}

// ── Phase 173: State Early Warning Center ──
export type EarlyWarningSeverity = "Advisory" | "Watch" | "High" | "Critical Review";

export interface EarlyWarningSignal {
  signalId: string;
  category: "Weather" | "Pest" | "Water" | "Market" | "Input" | "Storage" | "Logistics";
  severity: EarlyWarningSeverity;
  titleEn: string;
  titleTa: string;
  district: string;
  block: string;
  source: string;
  timestamp: string;
  reasonEn: string;
  reasonTa: string;
  recommendedHumanActionEn: string;
  recommendedHumanActionTa: string;
}

// ── Phase 174: Village Resource Planner ──
export interface VillageResourcePlan {
  villageName: string;
  district: string;
  cultivatedAcres: number;
  cropBreakdown: Record<string, number>;
  estimatedWaterDemandMillionLitres: number;
  seedRequirementKg: number;
  fertilizerRequirementTonnes: number;
  peakTractorHoursEstimated: number;
  likelyHarvestPeriod: string;
  disclaimer: string;
}

// ── Phase 175: Program Outcome Evaluation ──
export interface ProgramOutcomeEvaluation {
  programId: string;
  programName: string;
  enrolledParticipants: number;
  completionRatePercent: number;
  observedYieldChangePercent: number;
  observedWaterSavingPercent: number;
  evidenceCategory: "Observed change" | "Association" | "Insufficient evidence";
  disclaimer: string;
}

// ── Phase 178: Public Farmer Service Status ──
export interface PublicServiceLookupResult {
  referenceNumber: string;
  serviceType: "Grievance" | "Subsidy Evidence" | "Field Inspection" | "Agri SOS";
  status: string;
  lastUpdated: string;
  nextStepEn: string;
  nextStepTa: string;
  antiEnumerationVerified: boolean;
}

// ── Phase 179: Data Integrity & Anti-Fraud Signals ──
export interface DataIntegrityAnomaly {
  id: string;
  entityType: "inspection" | "cce" | "subsidy_evidence" | "harvest";
  entityId: string;
  anomalyType: string;
  reviewLevel: "Info" | "Review" | "High Review";
  description: string;
  timestamp: string;
}

// ── Phase 180: State NOC / Control Room ──
export interface NocSystemHealth {
  serviceName: string;
  category: "Infrastructure" | "Database" | "External Provider" | "API";
  status: "Operational" | "Degraded" | "Offline" | "Not Configured";
  latencyMs: number;
  errorRatePercent: number;
  lastSyncTimestamp: string;
}
