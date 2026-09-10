# AgroGuide Production Security Policy
**Version:** 2026.09-FINAL  

---

## 1. Core Security Guarantees
- **Zero Aadhaar Storage**: Hard architectural guarantee.
- **RBAC Matrix**: 6-tier institutional permission model (`farmer`, `extension_officer`, `block_officer`, `district_officer`, `state_admin`, `system_admin`).
- **Owner Isolation**: Farmers can only access their own farms, crops, expenses, and documents in Firestore.
- **Public API Privacy**: All Open Data API endpoints (`/api/open-data/v1/*`) enforce a minimum 5-farm cohort threshold and strip all personal identifiers.
- **Secret Redaction**: Structured loggers and NOC dashboards automatically redact email, phone, API keys, and sensitive tokens.

---

## 2. Webhook & Endpoint Security
- **Mandi Webhook (`/api/webhooks/mandi`)**: Requires HMAC signature verification header `x-mandi-signature`.
- **Public Status Portal (`/service-status`)**: Anti-enumeration protections with rate-limited sanitized responses.
- **State Control Room (`/state-control-room`)**: Strictly accessible only to authenticated `state_admin` and `system_admin` roles.
