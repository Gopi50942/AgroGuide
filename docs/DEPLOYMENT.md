# AgroGuide Production Deployment Guide
**Release:** 2026.09-FINAL (Firebase Spark Free Tier Certified)  

---

## Deployment Steps

### 1. Deploy Firestore Security Rules & Indexes (Free Spark Plan)
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
*(Note: `storage:rules` deployment is omitted because Firebase Storage is intentionally disabled on the free tier).*

### 2. Configure Production Environment Variables
Copy `.env.example` to `.env.production` and populate required Firebase credentials (and optional `CLOUDINARY_*` credentials if using cloud media storage).

### 3. Build & Deploy Web Application
```bash
npm run build
# Deploy to Vercel or cloud container
vercel --prod
```

### 4. Health Check Verification
Verify production deployment health by curling the health endpoint:
```bash
curl -I https://your-agroguide-domain.gov.in/api/health
```
