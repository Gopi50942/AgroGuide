# AgroGuide — Backup & Disaster Recovery Runbook (Phase 96)

## 1. Overview & Architecture
AgroGuide operates on a cloud-native Firebase Firestore, Storage, and Next.js foundation. All collections are owner-isolated with zero retention of national identity numbers (Aadhaar).

---

## 2. Firestore Scheduled & Manual Backup Strategy

### Automated Cloud Firestore Export
Backups are orchestrated using Google Cloud Scheduled Jobs to a dedicated Cloud Storage bucket:

```bash
# Export all production collections to GCS bucket
gcloud firestore export gs://agroguide-prod-backups/$(date +%Y-%m-%d_%H%M%S) \
  --collection-ids='users,farms,crops,soil_reports,disease_reports,expenses,revenues,harvest_records,produce_sales,irrigation_logs,support_tickets,farm_input_inventory,crop_budgets,farmer_documents,pilot_feedback'
```

### Collection Inventory & Isolation
| Collection | Classification | Retention Policy | Backup Frequency |
|---|---|---|---|
| `users` | PII (Sanitized) | Lifetime of Account | Daily |
| `farms` | Spatial / Polygon | Lifetime of Account | Daily |
| `crops` | Agronomic | Concluded + 3 Seasons | Daily |
| `soil_reports` | Laboratory Records | 5 Years | Daily |
| `disease_reports` | AI Diagnostics | 2 Years | Daily |
| `expenses` / `revenues` | Financial Ledger | 7 Years | Daily |
| `harvest_records` / `produce_sales` | Market Ledger | 7 Years | Daily |
| `farmer_documents` | Metadata Vault | Lifetime of Policy | Daily |

---

## 3. Storage Media Backup Approach
- **Media Paths:** `/users/{uid}/...` and `/community-images/{uid}/...`
- **Bucket Replication:** Multi-region bucket replication (`asia-south1` to `asia-south2`).

---

## 4. Disaster Recovery & Restoration Sequence

1. **Verify Integrity of Export Payload:**
   Run internal JSON/Manifest validator via `simulateRestoreValidation()` in `lib/services/disasterRecoveryService.ts`.

2. **Execute Restore to Staging Firestore:**
   ```bash
   gcloud firestore import gs://agroguide-prod-backups/[BACKUP_TIMESTAMP]
   ```

3. **Validate Schema Migration:**
   Execute `verifySchemaIntegrity()` to confirm all documents adhere to schema version `2026.1`.

4. **DNS & Edge Traffic Cutover:**
   Switch production traffic via Vercel / Cloudflare DNS upon health verification at `/api/health`.
