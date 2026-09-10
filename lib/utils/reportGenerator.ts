import type {
  Farm,
  Crop,
  SoilReport,
  HarvestRecord,
  ProduceSale,
  Expense,
  FarmerProfile,
  Language,
} from "@/types";

export interface FarmSummaryReportData {
  farmerName: string;
  phone?: string;
  district?: string;
  state?: string;
  farm: Farm;
  activeCrops: Crop[];
  latestSoilReport?: SoilReport;
  recentHarvests: HarvestRecord[];
  recentSales: ProduceSale[];
  totalExpenses: number;
  totalSalesRealization: number;
  netProfit: number;
  generatedAt: string;
}

export function buildFarmSummaryData(params: {
  profile: FarmerProfile;
  farm: Farm;
  crops: Crop[];
  soilReports?: SoilReport[];
  harvests?: HarvestRecord[];
  sales?: ProduceSale[];
  expenses?: Expense[];
}): FarmSummaryReportData {
  const { profile, farm, crops, soilReports = [], harvests = [], sales = [], expenses = [] } = params;

  const farmCrops = crops.filter((c) => c.farmId === farm.id);
  const farmSoil = soilReports.find((s) => s.farmId === farm.id) || soilReports[0];
  const farmHarvests = harvests.filter((h) => h.farmId === farm.id || farmCrops.some((c) => c.id === h.cropId));
  const farmSales = sales.filter((s) => s.farmId === farm.id || farmCrops.some((c) => c.id === s.cropId));
  const farmExpenses = expenses.filter((e) => farmCrops.some((c) => c.id === e.cropId));

  const totalExpenses = farmExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalSalesRealization = farmSales.reduce((acc, s) => acc + (s.netRealization || s.grossAmount || 0), 0);
  const netProfit = totalSalesRealization - totalExpenses;

  return {
    farmerName: profile.name || "Farmer",
    phone: profile.phone,
    district: profile.district,
    state: profile.state,
    farm,
    activeCrops: farmCrops,
    latestSoilReport: farmSoil,
    recentHarvests: farmHarvests.slice(0, 5),
    recentSales: farmSales.slice(0, 5),
    totalExpenses,
    totalSalesRealization,
    netProfit,
    generatedAt: new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };
}

export function openPrintDialog() {
  if (typeof window !== "undefined") {
    window.print();
  }
}
