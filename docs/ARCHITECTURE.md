# AgroGuide System Architecture Document
**Version:** 2026.09-FINAL (Phases 1–181)  
**Classification:** State Agriculture Digital Infrastructure & Intelligence Platform  

---

## 1. Architectural Overview

AgroGuide is architected across six integrated tiers:
1. **Farmer Experience Layer (PWA / Mobile / Web / Speech)**: Multi-farm polygon mapping, bilingual Tamil/English UI, offline IndexedDB mutation sync, AI Crop Doctor, unified farmer passbook, and Tamil voice assistant.
2. **Field Operations Layer**: Offline CCE digital ledger, GPS inspection centroid mismatch detector, portable BLE soil kit ingestion, drone fleet scheduler, and rapid Agri SOS response queue.
3. **Institutional Logistics & Market Layer**: District TANFED fertilizer buffer & rake tracking, seed certification registry, cold chain excursion telemetry, APMC mandi webhook parser, and FPO export dossier compiler.
4. **State Intelligence & GIS Analytics Layer**: Village digital twins, Sentinel/Landsat spectral indices, spatial micronutrient deficiency interpolation, state groundwater piezometers, WRD canal flow sensors, and deterministic state decision priorities.
5. **Data Privacy, Governance & RBAC Layer**: Strict zero-Aadhaar compliance (`AG-FARMER-XXXXXX`), mandatory explicit digital consent gates, 5-farm privacy cohort masking, immutable audit logging, and role-gated access across 6 institutional tiers.
6. **Public Open Data & NOC Control Room Layer**: Anonymized public open data APIs (`/api/open-data/v1/*`), public service reference tracking (`/service-status`), and operational NOC telemetry (`/state-control-room`).

---

## 2. Free-Tier Media & Document Storage Architecture

- **Firebase Auth & Firestore**: Active on Firebase Spark (Free Tier).
- **Firebase Storage**: Intentionally disabled. Does not block application runtime or require paid Blaze upgrade.
- **Provider-Neutral Storage Layer (`lib/services/fileStorage/`)**:
  - **Public / Low-Sensitivity Media** (Community posts, Farm diary photos, Avatars): Managed via Cloudinary free-tier provider or local demo preview. Uses server-only credentials (`/api/media/upload`) to eliminate client secret leakage.
  - **Temporary AI Input** (Crop Doctor leaf scans): Processed in-memory and submitted directly to the vision diagnosis API; only structured diagnosis metadata is persisted to Firestore. No permanent file upload required.
  - **Private / Sensitive Government Evidence** (Subsidy evidence, land records, field inspections, SOS photos, export dossiers): Public cloud upload is strictly disabled. Persists structured document references and metadata (reference number, issuer, date, status, notes) with zero privacy degradation.

---

## 3. External Provider Integration Matrix

| Provider Category | Ingestion Method | Default State | Strict Boundary |
| :--- | :--- | :--- | :--- |
| **AgriStack Registry** | REST Sandbox Provider | `NOT_CONFIGURED` | Zero Aadhaar collection; internal ID isolation |
| **Weather (IMD/TNAU/Open-Meteo)** | Automated Webhook / REST | `LIVE` | Transparent live vs forecast vs cached tagging |
| **Mandi APMC Prices** | Signed Webhook Receiver | `LIVE` | Zero automated bid/fund settlement |
| **Groundwater / Salinity (CGWB)** | Piezometer Telemetry Ingestion | `LIVE` / `DEMO` | Regional watch only; non-extrapolated to farm wells |
| **Smart Canal / Sluice (WRD)** | Sensor Feed Ingestion | `LIVE` | Read-only; strictly zero remote gate actuation |
| **IoT Solar Pumps (PM-KUSUM)** | IoT Telemetry Gateway | `DEMO` | Monitoring only; strictly zero remote pump start/stop |
| **e-NWR Warehouse Receipts** | WDRA Registry Adapter | `NOT_CONFIGURED` | Receipt verification only; zero automated pledging |
| **Voice IVR Gateway** | Carrier Voice Adapter | `NOT_CONFIGURED` | Audio script generation; zero unauthorized robocalls |
| **Satellite (Sentinel-1 SAR / Sentinel-2)** | Public Sensor Abstraction | `NOT_CONFIGURED` | Non-synthetic proxy; zero fabricated spectral values |
| **Cloudinary Media** | Free-Tier REST Adapter | `OPTIONAL` | Public media only; private uploads disabled |

---

## 4. Security & Anti-Fraud Architecture

- **Zero Aadhaar Policy**: Confirmed via `assertNoAadhaarPayload()`. No 12-digit Indian national identity numbers are ever stored or processed.
- **Data Integrity Signals**: Flags GPS distance deviations (> 1500m), sample weight outliers, and photo reuse as `DATA REVIEW SIGNALS` for human extension verification without unilateral fraud condemnation.
- **Strict Read-Only AI Guardrails**: Government AI copilot and speech assistants are 100% read-only and strictly forbidden from autonomous financial sanctioning, subsidy approval, or status mutations.
