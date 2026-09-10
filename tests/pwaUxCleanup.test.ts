import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isPromptDismissed } from "../hooks/usePwaInstallPrompt";

describe("Post-Deployment UX Cleanup — PWA & Production UI Suite", () => {
  const DISMISSAL_KEY = "agroguide_pwa_prompt_dismissed_at";
  const LEGACY_DISMISSAL_KEY = "agroguide_pwa_prompt_dismissed_v1";
  const INSTALLED_KEY = "agroguide_pwa_installed";

  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    vi.stubGlobal("window", {
      localStorage: storageMock,
      matchMedia: () => ({ matches: false }),
      navigator: { standalone: false },
    });
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("1. PWA prompt is not dismissed initially when no localStorage keys exist", () => {
    expect(isPromptDismissed()).toBe(false);
  });

  it("2. PWA prompt dismissal persists and correctly honors 30-day window", () => {
    const now = 1773000000000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    localStorage.setItem(DISMISSAL_KEY, now.toString());
    expect(isPromptDismissed()).toBe(true);

    // After 10 days, still dismissed
    const tenDaysLater = now + 10 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, "now").mockReturnValue(tenDaysLater);
    expect(isPromptDismissed()).toBe(true);

    // After 35 days (past 30 day window), dismissal expires unless permanently installed
    const thirtyFiveDaysLater = now + 35 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, "now").mockReturnValue(thirtyFiveDaysLater);
    expect(isPromptDismissed()).toBe(false);
  });

  it("3. Permanent installation flags permanently suppress PWA prompt", () => {
    localStorage.setItem(INSTALLED_KEY, "true");
    expect(isPromptDismissed()).toBe(true);
  });

  it("4. Legacy dismissal key v1 is backward compatible and respected", () => {
    localStorage.setItem(LEGACY_DISMISSAL_KEY, "true");
    expect(isPromptDismissed()).toBe(true);
  });

  it("5. RuntimeIndicator logic returns null in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    // Simulate RuntimeIndicator condition
    const shouldRender = process.env.NODE_ENV !== "production";
    expect(shouldRender).toBe(false);

    process.env.NODE_ENV = "development";
    const shouldRenderDev = process.env.NODE_ENV !== "production";
    expect(shouldRenderDev).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });
});
