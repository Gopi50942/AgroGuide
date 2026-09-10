// ─────────────────────────────────────────────
// Firebase initialization with Persistent Offline Cache
//
// AgroGuide is configured for Firebase Spark (Free Tier).
// Firebase Auth and Firestore are active.
// Firebase Storage is intentionally disabled on the Spark plan.
// ─────────────────────────────────────────────
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isValidFirebaseKey = (key?: string): boolean =>
  Boolean(
    key &&
    !key.includes("YOUR_") &&
    !key.includes("Example") &&
    !key.includes("placeholder") &&
    key.length > 20
  );

const isValidProjectId = (id?: string): boolean =>
  Boolean(
    id &&
    !id.includes("YOUR_") &&
    !id.includes("example") &&
    !id.includes("placeholder") &&
    id.length > 3
  );

const isValidAppId = (id?: string): boolean =>
  Boolean(
    id &&
    !id.includes("YOUR_") &&
    !id.includes("example") &&
    !id.includes("placeholder") &&
    id.includes(":")
  );

export const isFirebaseConfigured = Boolean(
  isValidFirebaseKey(firebaseConfig.apiKey) &&
  isValidProjectId(firebaseConfig.projectId) &&
  isValidAppId(firebaseConfig.appId)
);

export function getFirebaseDiagnostics() {
  return {
    projectIdPresent: Boolean(firebaseConfig.projectId && isValidProjectId(firebaseConfig.projectId)),
    apiKeyPresent: Boolean(firebaseConfig.apiKey && isValidFirebaseKey(firebaseConfig.apiKey)),
    authDomainPresent: Boolean(
      firebaseConfig.authDomain &&
      !firebaseConfig.authDomain.includes("YOUR_") &&
      !firebaseConfig.authDomain.includes("example")
    ),
    appIdPresent: Boolean(firebaseConfig.appId && isValidAppId(firebaseConfig.appId)),
    isConfigured: isFirebaseConfigured,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);

    if (typeof window !== "undefined") {
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch (cacheErr) {
        // Fallback to standard Firestore instance if persistent multi-tab cache encounters IndexedDB/BloomFilter collision
        console.warn("Firestore persistent cache fallback:", cacheErr);
        db = getFirestore(app);
      }
    } else {
      db = getFirestore(app);
    }
  } catch (initErr) {
    console.warn("Firebase initialization warning (running in safe mode):", initErr);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };
export const getFirebaseDb = () => db;
