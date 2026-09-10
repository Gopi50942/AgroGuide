# AgroGuide Data Governance & Privacy Architecture

## 1. Principles of Agricultural Data Protection
1. **Farmer Data Sovereignty**: Farmers retain full ownership of their crop records, soil reports, financial ledgers, and photographic evidence.
2. **Purpose Limitation**: Field data is collected exclusively for advisory generation, localized decision support, scheme assistance, and authorized extension services.
3. **Cohort Aggregation Thresholds**:
   - Village crop census and disease radar aggregate statistics enforce a minimum cohort size of **5 participating farms**.
   - If fewer than 5 farms cultivate a specific crop in a revenue village, exact acreage numbers are suppressed to prevent re-identification.
4. **Zero Demographic Profiling**:
   - Beneficiary segmentation is strictly operational (e.g. Marginal < 2.5 acres, Rainfed, Drip-irrigated).
   - Demographic attributes such as caste, religion, or political affiliation are never inferred or recorded.

---

## 2. Immutable Institutional Audit Logging
All sensitive institutional interactions produce structured audit records stored in `audit_logs`:
- Grievance status transitions and escalations
- Field inspection completions
- Subsidy evidence verifications
- Scheme cycle publications
- Advisory broadcast approvals
- MIS data exports

Logs store actor ID, role, action timestamp, and entity references while strictly excluding passwords, credentials, and private biometric data.
