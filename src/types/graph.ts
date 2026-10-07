import type { z } from "zod";
import type {
  graphSchema,
  nodeSchema,
  edgeSchema,
  tourSchema,
} from "../schemas/graphSchema";
export const nodeTypes = [
  "signal",
  "evidence",
  "cluster",
  "trend",
  "value",
  "driver",
  "value_shift",
  "countertrend",
  "scenario",
  "opportunity",
  "reflection",
] as const;
export const edgeTypes = [
  "supports",
  "contradicts",
  "example_of",
  "relates_to",
  "driven_by",
  "indicates_need",
  "leads_to",
  "countertrend_of",
  "part_of",
  "changed_my_view",
] as const;
export type NodeType = (typeof nodeTypes)[number];
export type GraphPreset = "core" | "all";
export type GraphNode = z.infer<typeof nodeSchema>;
export type GraphEdge = z.infer<typeof edgeSchema>;
export type GraphData = z.infer<typeof graphSchema>;
export type Tour = z.infer<typeof tourSchema>;
