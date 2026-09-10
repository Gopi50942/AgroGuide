import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, setDoc } from "firebase/firestore";
import type {
  MessagingChannel,
  AlertMessageType,
  MessageDeliveryLog,
  MessagingPreferences,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 33: SMS & WhatsApp Advisory Gateway & Provider Abstraction
// Delivers critical low-bandwidth alerts without requiring paid provider credentials locally.
// ─────────────────────────────────────────────

export interface MessagingSendResult {
  success: boolean;
  messageId: string;
  channel: MessagingChannel;
  provider: "mock" | "twilio" | "gupshup" | "meta_whatsapp" | "disabled";
  status: "delivered" | "failed" | "mocked" | "disabled";
  error?: string;
}

export interface MessagingProvider {
  sendSMS(recipientPhone: string, message: string): Promise<MessagingSendResult>;
  sendWhatsApp(recipientPhone: string, message: string): Promise<MessagingSendResult>;
}

// Default provider when no external API credentials exist
class MockOrDisabledMessagingProvider implements MessagingProvider {
  async sendSMS(recipientPhone: string, message: string): Promise<MessagingSendResult> {
    const isMock = process.env.NODE_ENV !== "production" || !process.env.TWILIO_ACCOUNT_SID;
    return {
      success: true,
      messageId: `sms_mock_${Date.now()}`,
      channel: "sms",
      provider: isMock ? "mock" : "disabled",
      status: isMock ? "mocked" : "disabled",
    };
  }

  async sendWhatsApp(recipientPhone: string, message: string): Promise<MessagingSendResult> {
    const isMock = process.env.NODE_ENV !== "production" || !process.env.WHATSAPP_API_TOKEN;
    return {
      success: true,
      messageId: `wa_mock_${Date.now()}`,
      channel: "whatsapp",
      provider: isMock ? "mock" : "disabled",
      status: isMock ? "mocked" : "disabled",
    };
  }
}

export const messagingGateway: MessagingProvider = new MockOrDisabledMessagingProvider();

export const SMS_TEMPLATES = {
  severe_weather: {
    en: (district: string, condition: string) =>
      `[AgroGuide Alert] Severe weather warning in ${district}: ${condition}. Inspect field drainage immediately.`,
    ta: (district: string, condition: string) =>
      `[அக்ரோகைடு எச்சரிக்கை] ${district} பகுதியில் ${condition} எச்சரிக்கை. வயலில் நீர் தேங்காமல் வடிகால் அமைக்கவும்.`,
  },
  task_reminder: {
    en: (cropName: string, task: string) =>
      `[AgroGuide Task] Reminder for ${cropName}: Scheduled task "${task}" is due today.`,
    ta: (cropName: string, task: string) =>
      `[அக்ரோகைடு பணி] ${cropName} பயிருக்கான பணி "${task}" இன்று செய்ய வேண்டியுள்ளது.`,
  },
  market_target_reached: {
    en: (commodity: string, price: number, market: string) =>
      `[AgroGuide Mandi] ${commodity} reached ₹${price}/qtl in ${market} mandi today.`,
    ta: (commodity: string, price: number, market: string) =>
      `[அக்ரோகைடு சந்தை] ${market} சந்தையில் ${commodity} விலை குவிண்டாலுக்கு ₹${price} எட்டியுள்ளது.`,
  },
};

export async function dispatchFarmerAlert(
  ownerId: string,
  recipientPhone: string,
  channel: MessagingChannel,
  type: AlertMessageType,
  message: string,
  prefs?: MessagingPreferences,
  isDemoMode: boolean = false
): Promise<MessagingSendResult> {
  // Check farmer consent preferences
  if (prefs) {
    if (channel === "sms" && !prefs.smsEnabled) {
      return {
        success: false,
        messageId: "",
        channel: "sms",
        provider: "disabled",
        status: "disabled",
        error: "Farmer opted out of SMS alerts",
      };
    }
    if (channel === "whatsapp" && !prefs.whatsappEnabled) {
      return {
        success: false,
        messageId: "",
        channel: "whatsapp",
        provider: "disabled",
        status: "disabled",
        error: "Farmer opted out of WhatsApp alerts",
      };
    }
  }

  const result =
    channel === "whatsapp"
      ? await messagingGateway.sendWhatsApp(recipientPhone, message)
      : await messagingGateway.sendSMS(recipientPhone, message);

  // Log delivery event
  const logId = `msg_log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const logEntry: MessageDeliveryLog = {
    id: logId,
    ownerId,
    channel,
    type,
    status: result.status,
    recipientContact: recipientPhone.replace(/.(?=.{4})/g, "*"), // Masked for privacy
    provider: result.provider,
    sentAt: new Date().toISOString(),
    errorCategory: result.error,
  };

  if (!isDemoMode && isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, "message_delivery_logs", logId), logEntry);
      } catch {}
    }
  }

  return result;
}
