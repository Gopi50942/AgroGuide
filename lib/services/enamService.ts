// ─────────────────────────────────────────────
// Phase 45: National e-NAM Electronic Market Integration Layer
// Prepares future connectivity to National Agriculture Market (e-NAM) trading data.
// Strictly advisory & read-only; does not perform trade execution or monetary bidding.
// ─────────────────────────────────────────────

export interface ENamListing {
  commodity: string;
  variety: string;
  mandiName: string;
  district: string;
  state: string;
  modalPricePerQuintal: number;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  tradeVolumeQuintals?: number;
  reportedDate: string;
}

export interface ENamResponse<T = any> {
  status: "NOT_CONFIGURED" | "SUCCESS" | "ERROR";
  providerName: string;
  messageEn: string;
  messageTa: string;
  officialPortalUrl: string;
  data?: T;
}

export interface ENamProvider {
  getMarketDirectory(state: string): Promise<ENamResponse<string[]>>;
  getCommodityListings(state: string, commodity: string): Promise<ENamResponse<ENamListing[]>>;
}

class UnavailableENamProvider implements ENamProvider {
  async getMarketDirectory(state: string): Promise<ENamResponse<string[]>> {
    return {
      status: "NOT_CONFIGURED",
      providerName: "National Agriculture Market (e-NAM) API",
      messageEn: "e-NAM direct integration is not currently configured.",
      messageTa: "e-NAM நேரடி சந்தை இணைப்பு தற்போது கட்டமைக்கப்படவில்லை.",
      officialPortalUrl: "https://enam.gov.in",
      data: [],
    };
  }

  async getCommodityListings(state: string, commodity: string): Promise<ENamResponse<ENamListing[]>> {
    return {
      status: "NOT_CONFIGURED",
      providerName: "National Agriculture Market (e-NAM) API",
      messageEn: `e-NAM live trading integration for ${commodity} is not configured. Real daily modal prices are available from AgroGuide local mandi feeds.`,
      messageTa: `${commodity} பயிருக்கான e-NAM நேரடி வர்த்தக இணைப்பு கட்டமைக்கப்படவில்லை. உள்ளூர் சந்தை விலைகள் அக்ரோகைடு மூலம் வழங்கப்படுகின்றன.`,
      officialPortalUrl: "https://enam.gov.in",
      data: [],
    };
  }
}

export const enamGateway: ENamProvider = new UnavailableENamProvider();
