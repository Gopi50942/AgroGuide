import type { LoanProduct } from "@/types";

// ─────────────────────────────────────────────
// A curated catalog of well-established categories of agricultural
// credit available in India, described qualitatively.
//
// Deliberately NOT included: specific interest rates, specific loan
// limits, or specific subsidy percentages. These are set/revised by
// RBI, NABARD and individual lenders and change over time (e.g. RBI's
// Kisan Credit Card collateral-free threshold and interest-subvention
// terms have been under active revision) — hardcoding a number here
// would go stale and could mislead a farmer. Each entry instead points
// to the appropriate official source for current, authoritative terms.
//
// This is a general awareness catalog, not a live product feed from
// any specific bank. "lastVerified" reflects when this general
// description was last checked against public RBI/NABARD/government
// information — a farmer should always confirm current terms with
// their bank or the official source linked below.
// ─────────────────────────────────────────────

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    category: "kisan_credit_card",
    lenderType: "Commercial banks, Regional Rural Banks, cooperative banks",
    purpose: "Revolving working-capital credit for crop cultivation, post-harvest expenses, and allied farm needs — works like a farm overdraft rather than a one-time loan.",
    targetFarmer: "Owner cultivators, tenant farmers, oral lessees, and sharecroppers; also available to Self-Help Groups and Joint Liability Groups of farmers.",
    eligibility: [
      "Actively cultivating land (owned, leased, or as a recognized tenant/sharecropper)",
      "Valid land records or other proof of cultivation accepted by the bank",
      "No mandatory minimum land size, but the credit limit is based on cropping pattern and area",
    ],
    documents: [
      "Identity proof (Aadhaar / Voter ID / Driving Licence / Passport)",
      "Address proof",
      "Land record / proof of cultivation, certified by revenue authorities",
      "Details of crops grown and area under cultivation",
      "Passport-size photographs",
    ],
    howToApply: "Apply at any nearest bank branch (public, private, RRB or cooperative), or online via the Jan Samarth portal / individual bank net-banking portals.",
    officialSource: "NABARD & Reserve Bank of India (RBI)",
    officialUrl: "https://www.nabard.org/content1.aspx?id=591&catid=23&mid=530",
    lastVerified: "2026-08-01",
  },
  {
    id: "crop-loan",
    name: "Seasonal Agricultural (Crop) Loan",
    category: "crop_loan",
    lenderType: "Commercial banks, RRBs, Primary Agricultural Credit Societies (PACS)",
    purpose: "Short-term credit for a single cropping season's input costs — seeds, fertilizer, labour, and other operational expenses.",
    targetFarmer: "Farmers cultivating a specific crop/season who need working capital before harvest income arrives.",
    eligibility: [
      "Land under active cultivation for the season in question",
      "Typically covered under the KCC facility rather than as a standalone product at most banks",
    ],
    documents: [
      "Identity and address proof",
      "Land/cultivation record",
      "Cropping plan for the season",
    ],
    howToApply: "Usually issued as part of a Kisan Credit Card sanction; ask your bank whether a standalone seasonal loan or KCC drawdown suits your situation better.",
    officialSource: "NABARD — Priority Sector Lending guidelines",
    officialUrl: "https://www.nabard.org",
    lastVerified: "2026-08-01",
  },
  {
    id: "term-loan",
    name: "Agricultural Term Loan",
    category: "term_loan",
    lenderType: "Commercial banks, RRBs, cooperative banks, NBFCs",
    purpose: "Medium/long-term credit for capital investment — land development, farm structures, or other multi-year investments (distinct from machinery- or irrigation-specific finance below).",
    targetFarmer: "Farmers making a capital investment expected to generate returns over several seasons, not just the current one.",
    eligibility: [
      "Demonstrable repayment capacity from farm income over the loan tenure",
      "Land ownership or long-term lease documentation, as required by the lender",
    ],
    documents: [
      "Identity and address proof",
      "Land records",
      "A cost estimate / project plan for the investment",
      "Income/repayment-capacity documentation as requested by the lender",
    ],
    howToApply: "Apply directly at a bank branch offering agricultural term loans; a written investment plan strengthens the application.",
    officialSource: "NABARD",
    officialUrl: "https://www.nabard.org",
    lastVerified: "2026-08-01",
  },
  {
    id: "irrigation-finance",
    name: "Farm Mechanization & Irrigation Finance",
    category: "irrigation_finance",
    lenderType: "Commercial banks, RRBs, NABARD-refinanced schemes",
    purpose: "Investment credit for irrigation infrastructure (drip/sprinkler systems, bore wells, pump sets) or farm mechanization equipment.",
    targetFarmer: "Farmers investing in irrigation efficiency or mechanization, often alongside a state micro-irrigation subsidy scheme.",
    eligibility: [
      "Land ownership or documented right to install permanent irrigation infrastructure",
      "May be combined with a state government micro-irrigation subsidy — check with your district agriculture office",
    ],
    documents: [
      "Identity and address proof",
      "Land records",
      "Quotation/estimate for the irrigation equipment or work",
    ],
    howToApply: "Apply at a bank offering agricultural investment credit; ask about combining this with any state micro-irrigation subsidy scheme active in your district.",
    officialSource: "NABARD",
    officialUrl: "https://www.nabard.org",
    lastVerified: "2026-08-01",
  },
  {
    id: "livestock-dairy-finance",
    name: "Dairy & Livestock Finance",
    category: "livestock_dairy_finance",
    lenderType: "Commercial banks, RRBs, cooperative banks, NABARD-refinanced schemes",
    purpose: "Credit for purchasing milch animals, poultry, or other livestock, and related infrastructure like sheds or fodder storage.",
    targetFarmer: "Farmers and rural households engaged in or starting dairy, poultry, or livestock-rearing as a farm income activity.",
    eligibility: [
      "Basic infrastructure or plan for housing/feeding the livestock",
      "May be eligible for KCC extension to allied activities rather than a separate loan",
    ],
    documents: [
      "Identity and address proof",
      "Details of the livestock activity plan",
      "Land/shed documentation if applicable",
    ],
    howToApply: "Ask your bank whether this is available as an extension to your existing KCC, or as a standalone allied-activity loan.",
    officialSource: "NABARD",
    officialUrl: "https://www.nabard.org",
    lastVerified: "2026-08-01",
  },
  {
    id: "warehouse-finance",
    name: "Post-Harvest / Warehouse Receipt Finance",
    category: "warehouse_finance",
    lenderType: "Commercial banks, RRBs, cooperative banks",
    purpose: "Short-term credit against produce stored in an accredited warehouse (via electronic Negotiable Warehouse Receipts), letting a farmer avoid distress sale immediately after harvest.",
    targetFarmer: "Farmers who can store harvested produce in an accredited warehouse and wait for a better market price rather than selling immediately.",
    eligibility: [
      "Produce stored in a WDRA-accredited warehouse with a valid electronic Negotiable Warehouse Receipt (e-NWR)",
    ],
    documents: [
      "e-NWR for the stored produce",
      "Identity and address proof",
    ],
    howToApply: "Available through banks that finance against e-NWRs — ask at your nearest accredited warehouse or bank branch.",
    officialSource: "Warehousing Development and Regulatory Authority (WDRA) / NABARD",
    officialUrl: "https://wdra.gov.in",
    lastVerified: "2026-08-01",
  },
  {
    id: "fpo-finance",
    name: "Farmer Producer Organization (FPO) Business Finance",
    category: "fpo_finance",
    lenderType: "NABARD, SFAC, participating banks",
    purpose: "Working capital and equity-grant support for registered Farmer Producer Organizations for aggregation, processing, or marketing activities.",
    targetFarmer: "Groups of farmers organized as a registered FPO/FPC, not individual farmers.",
    eligibility: [
      "Registered as a Farmer Producer Company/Organization",
      "A viable business plan for the FPO's activity",
    ],
    documents: [
      "FPO registration certificate",
      "Business/project plan",
      "Member details",
    ],
    howToApply: "Through NABARD's FPO promotion scheme or SFAC-empanelled Cluster Based Business Organizations — contact your local NABARD district office.",
    officialSource: "NABARD — FPO Development",
    officialUrl: "https://www.nabard.org/content1.aspx?catid=6&id=17",
    lastVerified: "2026-08-01",
  },
];
