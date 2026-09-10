# AgroGuide Government Platform Pilot Architecture (V2)

## 1. Executive Summary & Purpose
The **AgroGuide Government Agriculture Digital Platform** provides a secure, privacy-preserving, hierarchical ecosystem linking farmers, village extension workers, block agricultural officers, district administrations, and state departments.

---

## 2. Institutional Role & Permission Hierarchy

| Role | Scope | Private Record Access | Scheme Authoring | Broadcast Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Own digitized farms & crops | Own data only | Read-only | None |
| **Extension Officer** | Assigned village / consented farmers | Consented cases only | Read-only | Draft only |
| **Block Officer** | Block-level aggregations | Assigned grievances | Read-only | Block broadcast |
| **District Officer** | District-wide surveillance & KPIs | Aggregates only | District cycles | District broadcast |
| **State Admin** | State-wide telemetry & policies | Aggregates only | Statewide publish | Statewide broadcast |
| **System Admin** | Infrastructure & audit governance | Aggregates only | Infrastructure only | Technical notices |

---

## 3. Strict Government Integration Principles

1. **Zero-Aadhaar Policy**:
   - AgroGuide does **NOT** collect, store, verify, or transit 12-digit Aadhaar numbers.
   - Farmers are referenced via transparent internal codes: `AG-FARMER-XXXXXX`.
2. **Explicit Consent Gates**:
   - Extension officers cannot inspect private farm data or financial records without an active digital consent grant (`farmer_consent_records`).
3. **No Fabricated System Approvals**:
   - AgroGuide provides digital evidence preparation workspaces for subsidies and schemes.
   - Actual fund disbursement (DBT), subsidy sanctions, and insurance payouts are strictly labeled `NOT_CONFIGURED` without live state treasury integration.
4. **AI Safeguard Guardrails**:
   - Government AI Assistant tools (`lib/ai/governmentAiTools.ts`) are **strictly read-only**.
   - AI is forbidden from approving subsidies, rejecting applicants, sanctioning funds, or broadcasting advisories without human officer confirmation.

---

## 4. Offline Government Field Operation
- Extension officers in low-connectivity rural revenue villages can record draft inspections, GPS coordinates, and task notes offline.
- Mutations are stored in encrypted client-side IndexedDB queues and synced automatically upon reconnecting to network connectivity.
- Dual-entry protection ensures duplicate inspection records are never created.
