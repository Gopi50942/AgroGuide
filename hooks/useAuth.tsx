"use client";

// ─────────────────────────────────────────────
// Authentication context.
//
// Genuinely supports real Firebase Auth when configured,
// and explicit Demo Mode when the user explicitly requests demo exploration.
// Auth failures never silently enter demo mode.
// ─────────────────────────────────────────────
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as fbSignOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { getFarmerProfile, saveFarmerProfile } from "@/lib/firebase/firestore";
import { DEMO_FARMER } from "@/data/demoData";
import type { FarmerProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: FarmerProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, name: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  sendOtp: (phoneNumber: string, containerId: string) => Promise<ConfirmationResult>;
  confirmOtp: (confirmation: ConfirmationResult, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (partial: Partial<FarmerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    if (typeof window === "undefined") return !isFirebaseConfigured;
    return localStorage.getItem("agroguide_demo_session") === "true";
  });

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(isDemo ? DEMO_FARMER : null);
  const [loading, setLoading] = useState<boolean>(!isDemo && isFirebaseConfigured);

  useEffect(() => {
    if (isDemo) {
      setProfile(DEMO_FARMER);
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        let p = await getFarmerProfile(fbUser.uid).catch(() => null);
        if (!p) {
          p = {
            uid: fbUser.uid,
            name: fbUser.displayName || "Farmer",
            ...(fbUser.email ? { email: fbUser.email } : {}),
            ...(fbUser.phoneNumber ? { phone: fbUser.phoneNumber } : {}),
            ...(fbUser.photoURL ? { photoURL: fbUser.photoURL } : {}),
            preferredLanguage: "en",
            state: "",
            district: "",
            createdAt: new Date().toISOString(),
          };
          await saveFarmerProfile(p).catch(() => null);
        }
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [isDemo]);

  const enterDemoMode = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agroguide_demo_session", "true");
    }
    setIsDemo(true);
    setProfile(DEMO_FARMER);
    setLoading(false);
  }, []);

  const exitDemoMode = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("agroguide_demo_session");
    }
    setIsDemo(false);
    setProfile(null);
  }, []);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        throw new Error("auth/not-configured");
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("agroguide_demo_session");
      }
      setIsDemo(false);
      await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const registerEmail = useCallback(
    async (email: string, password: string, name: string) => {
      if (!auth) {
        throw new Error("auth/not-configured");
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("agroguide_demo_session");
      }
      setIsDemo(false);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const p: FarmerProfile = {
        uid: cred.user.uid,
        name,
        email,
        preferredLanguage: "en",
        state: "",
        district: "",
        createdAt: new Date().toISOString(),
      };
      await saveFarmerProfile(p);
      setProfile(p);
    },
    []
  );

  const signInGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error("auth/not-configured");
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("agroguide_demo_session");
    }
    setIsDemo(false);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const sendOtp = useCallback(
    async (phoneNumber: string, containerId: string) => {
      if (!auth) {
        throw new Error("auth/not-configured");
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("agroguide_demo_session");
      }
      setIsDemo(false);
      const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
      return signInWithPhoneNumber(auth, phoneNumber, verifier);
    },
    []
  );

  const confirmOtp = useCallback(
    async (confirmation: ConfirmationResult, code: string) => {
      await confirmation.confirm(code);
    },
    []
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!auth) throw new Error("auth/not-configured");
      await sendPasswordResetEmail(auth, email);
    },
    []
  );

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("agroguide_demo_session");
    }
    setIsDemo(false);
    setProfile(null);
    if (auth) {
      await fbSignOut(auth).catch(() => null);
    }
  }, []);

  const updateProfileFn = useCallback(
    async (partial: Partial<FarmerProfile>) => {
      setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
      if (!isDemo && profile) {
        await saveFarmerProfile({ ...profile, ...partial } as FarmerProfile);
      }
    },
    [isDemo, profile]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isDemoMode: isDemo,
      enterDemoMode,
      exitDemoMode,
      signInEmail,
      registerEmail,
      signInGoogle,
      sendOtp,
      confirmOtp,
      resetPassword,
      signOut,
      updateProfile: updateProfileFn,
    }),
    [
      user,
      profile,
      loading,
      isDemo,
      enterDemoMode,
      exitDemoMode,
      signInEmail,
      registerEmail,
      signInGoogle,
      sendOtp,
      confirmOtp,
      resetPassword,
      signOut,
      updateProfileFn,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
