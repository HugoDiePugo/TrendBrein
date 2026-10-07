import { z } from "zod";
import { nodeTypes, edgeTypes } from "../types/graph";
// Validate without trimming or otherwise rewriting supplied content.
const id = z
  .string()
  .refine((value) => value.trim().length > 0, "Mag niet leeg zijn");
const unit = z.number().finite().min(0).max(1);
const referenceSchema = z.object({
  nodeId: id,
  displayId: id.optional(),
  title: id.optional(),
});
const sourceDate = z.union([
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (value) =>
        !isNaN(Date.parse(value)) &&
        new Date(value).toISOString().startsWith(value),
      "Ongeldige datum",
    ),
  z.string().regex(/^\d{4}$/, "Gebruik een jaartal of YYYY-MM-DD"),
  z.literal("z.d."),
  z.literal(""),
]);
const matrixVisualizationSchema = z.object({
  type: z.literal("matrix2x2"),
  title: id,
  xAxis: z.object({ label: id, low: id, high: id }),
  yAxis: z.object({ label: id, low: id, high: id }),
  quadrants: z
    .array(
      z.object({
        position: z.enum([
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ]),
        nodeId: id,
        title: id,
        short: id,
      }),
    )
    .length(4),
  interaction: z
    .object({
      quadrantsClickable: z.boolean().optional(),
      focusNodeOnClick: z.boolean().optional(),
      showOpportunityLinkFor: z.record(id).optional(),
    })
    .optional(),
});
const opportunityAssessmentSchema = z.object({
  problem: id,
  targetGroup: id,
  existingSolutions: z.array(z.object({ nodeId: id, overlap: id.optional() })),
  novelty: id,
  fitWithHugo: id,
  differentiation: id,
  biggestRisk: id,
  nextTests: z.array(id),
});
export const nodeSchema = z.object({
  id,
  displayId: id.optional(),
  aliases: z.array(id).optional(),
  type: z.enum(nodeTypes),
  title: id,
  summary: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(id).default([]),
  status: id.optional(),
  confidence: unit.optional(),
  importance: unit.default(0.5),
  references: z.array(referenceSchema).optional(),
  visualization: matrixVisualizationSchema.optional(),
  evidenceRefs: z.array(referenceSchema).optional(),
  counterEvidenceRefs: z.array(referenceSchema).optional(),
  evidenceStrength: id.optional(),
  evidenceNote: z.string().optional(),
  selectionRationale: z.string().optional(),
  visitorPresentation: z
    .object({
      showOpportunityAssessment: z.boolean().optional(),
      showLinkedTrendAndShift: z.boolean().optional(),
      badge: id.optional(),
      note: z.string().optional(),
    })
    .optional(),
  opportunityAssessment: opportunityAssessmentSchema.nullable().optional(),
  source: z
    .object({
      title: z.string().optional(),
      publisher: z.string().optional(),
      url: z
        .string()
        .url()
        .refine((v) => /^https?:\/\//i.test(v), "Gebruik een http(s)-URL")
        .or(z.literal(""))
        .optional(),
      date: sourceDate.optional(),
      accessedDate: sourceDate.nullable().optional(),
      dateStatus: id.optional(),
      dateType: id.optional(),
      dateNote: z.string().optional(),
      sourceType: z.string().optional(),
    })
    .optional(),
});
export const edgeSchema = z.object({
  id,
  source: id,
  target: id,
  type: z.enum(edgeTypes),
  strength: unit.default(0.5),
  label: z.string().optional(),
});
export const graphSchema = z
  .object({
    demo: z.boolean().default(false),
    meta: z.record(z.unknown()).optional(),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
  })
  .superRefine((data, ctx) => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    data.nodes.forEach((node, i) => {
      if (nodes.has(node.id))
        ctx.addIssue({
          code: "custom",
          path: ["nodes", i, "id"],
          message: "Dubbele node-id",
        });
      nodes.add(node.id);
    });
    data.nodes.forEach((node, i) => {
      const referencedIds = [
        ...(node.references?.map((reference) => reference.nodeId) ?? []),
        ...(node.evidenceRefs?.map((reference) => reference.nodeId) ?? []),
        ...(node.counterEvidenceRefs?.map((reference) => reference.nodeId) ??
          []),
        ...(node.visualization?.quadrants.map((quadrant) => quadrant.nodeId) ??
          []),
        ...Object.values(
          node.visualization?.interaction?.showOpportunityLinkFor ?? {},
        ),
        ...(node.opportunityAssessment?.existingSolutions.map(
          (solution) => solution.nodeId,
        ) ?? []),
      ];
      referencedIds.forEach((nodeId) => {
        if (!nodes.has(nodeId))
          ctx.addIssue({
            code: "custom",
            path: ["nodes", i],
            message: `Gerefereerde node ${nodeId} bestaat niet`,
          });
      });
    });
    data.edges.forEach((edge, i) => {
      if (edges.has(edge.id))
        ctx.addIssue({
          code: "custom",
          path: ["edges", i, "id"],
          message: "Dubbele edge-id",
        });
      edges.add(edge.id);
      for (const key of ["source", "target"] as const)
        if (!nodes.has(edge[key]))
          ctx.addIssue({
            code: "custom",
            path: ["edges", i, key],
            message: "Node bestaat niet",
          });
    });
  });
export const tourSchema = z.object({
  id,
  title: id,
  description: z.string().optional(),
  intro: z
    .object({
      title: id,
      text: z.string(),
    })
    .optional(),
  nextTourId: id.optional(),
  nextTourLabel: z.string().optional(),
  nextTourDescription: z.string().optional(),
  steps: z
    .array(
      z.object({
        nodeId: id,
        title: id,
        text: z.string(),
        phase: z.string().optional(),
      }),
    )
    .min(1),
});
export function validateData(graph: unknown, tours: unknown) {
  const data = graphSchema.parse(graph);
  // Both the original array and the supplied {meta, tours} envelope are supported.
  const tourDocument = z
    .union([
      z.array(tourSchema),
      z.object({
        meta: z.record(z.unknown()).optional(),
        tours: z.array(tourSchema),
      }),
    ])
    .parse(tours);
  const routes = Array.isArray(tourDocument)
    ? tourDocument
    : tourDocument.tours;
  const ids = new Set(data.nodes.map((n) => n.id));
  const routeIds = new Set<string>();
  for (const tour of routes) {
    if (routeIds.has(tour.id)) throw new Error(`Dubbele tour-id: ${tour.id}`);
    routeIds.add(tour.id);
    for (const step of tour.steps)
      if (!ids.has(step.nodeId))
        throw new Error(`Tour ${tour.id}: node ${step.nodeId} bestaat niet`);
    if (
      tour.nextTourId &&
      !routeIds.has(tour.nextTourId) &&
      !routes.some((item) => item.id === tour.nextTourId)
    )
      throw new Error(
        `Tour ${tour.id}: vervolgroute ${tour.nextTourId} bestaat niet`,
      );
  }
  return {
    data,
    tours: routes,
    tourMeta: Array.isArray(tourDocument) ? undefined : tourDocument.meta,
  };
}
