import type { KnowledgeGraphNode, KnowledgeGraphEdge } from "@/types";

// ─────────────────────────────────────────────
// Phase 160: Rural Agriculture Knowledge Graph Service
// Evidence-backed agronomic relationships. Read-only query layer.
// ─────────────────────────────────────────────

const MOCK_NODES: KnowledgeGraphNode[] = [
  { id: "crop_tomato", type: "Crop", name: "Tomato (Solanum lycopersicum)" },
  { id: "crop_paddy", type: "Crop", name: "Paddy / Rice (Oryza sativa)" },
  { id: "disease_early_blight", type: "Disease", name: "Early Blight (Alternaria solani)" },
  { id: "pest_fall_armyworm", type: "Pest", name: "Fall Armyworm (Spodoptera frugiperda)" },
  { id: "weather_high_humidity", type: "WeatherHazard", name: "High Relative Humidity (>80%)" },
  { id: "irrigation_drip", type: "IrrigationMethod", name: "Drip Fertigation" },
  { id: "scheme_pmksy", type: "Scheme", name: "PMKSY Per Drop More Crop (Micro Irrigation)" },
  { id: "nutrient_zinc", type: "Nutrient", name: "Zinc (Zn)" },
];

const MOCK_EDGES: KnowledgeGraphEdge[] = [
  {
    sourceId: "crop_tomato",
    targetId: "disease_early_blight",
    relation: "susceptible_to",
    evidenceNote: "TNAU Crop Protection Guide 2026: Foliar fungal attack favored by warm humid canopy.",
  },
  {
    sourceId: "disease_early_blight",
    targetId: "weather_high_humidity",
    relation: "favored_by",
    evidenceNote: "Prolonged leaf wetness accelerates conidial germination.",
  },
  {
    sourceId: "crop_tomato",
    targetId: "irrigation_drip",
    relation: "requires",
    evidenceNote: "Reduces foliar wetting and saves 40-50% irrigation water.",
  },
  {
    sourceId: "scheme_pmksy",
    targetId: "irrigation_drip",
    relation: "supports",
    evidenceNote: "Provides up to 100% subsidy for small/marginal farmers.",
  },
];

export async function queryKnowledgeGraph(entityId: string): Promise<{
  node: KnowledgeGraphNode | null;
  outgoing: { edge: KnowledgeGraphEdge; target: KnowledgeGraphNode | undefined }[];
  incoming: { edge: KnowledgeGraphEdge; source: KnowledgeGraphNode | undefined }[];
}> {
  const node = MOCK_NODES.find((n) => n.id.toLowerCase() === entityId.toLowerCase()) || null;
  if (!node) {
    return { node: null, outgoing: [], incoming: [] };
  }

  const outgoing = MOCK_EDGES.filter((e) => e.sourceId === node.id).map((e) => ({
    edge: e,
    target: MOCK_NODES.find((n) => n.id === e.targetId),
  }));

  const incoming = MOCK_EDGES.filter((e) => e.targetId === node.id).map((e) => ({
    edge: e,
    source: MOCK_NODES.find((n) => n.id === e.sourceId),
  }));

  return { node, outgoing, incoming };
}

export async function listAllKnowledgeNodes(): Promise<KnowledgeGraphNode[]> {
  return MOCK_NODES;
}
