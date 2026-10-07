import { MultiDirectedGraph } from "graphology";
import type { GraphData } from "../types/graph";
import { categories, palette, relationLabels } from "./graphStyles";
import { applyLayout } from "./layout";
export function buildGraph(data: GraphData) {
  const graph = new MultiDirectedGraph();
  const priorityStatuses = new Set(
    (
      data.meta?.graphPresentation as
        | { presets?: { core?: { labelPriorityStatuses?: string[] } } }
        | undefined
    )?.presets?.core?.labelPriorityStatuses ?? ["selected_main_trend"],
  );
  data.nodes.forEach((node, i) => {
    const angle = i * 2.399963;
    const radius = Math.sqrt(i + 1) * 10;
    const priority =
      node.type === "reflection" ||
      node.type === "scenario" ||
      (!!node.status && priorityStatuses.has(node.status));
    const baseSize =
      categories[node.type].size + node.importance * 4 + (priority ? 3 : 0);
    graph.addNode(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      label: node.title,
      color: categories[node.type].color,
      size: baseSize,
      baseSize,
      category: node.type,
      status: node.status,
      priority,
    });
  });
  data.edges.forEach((edge) =>
    graph.addDirectedEdgeWithKey(edge.id, edge.source, edge.target, {
      type: "arrow",
      label: edge.label || relationLabels[edge.type],
      color: palette.edge,
      size: 0.6 + edge.strength,
      weight: edge.strength,
    }),
  );
  applyLayout(graph);
  return graph;
}

export function displayNodeSize(baseSize: number, active: boolean) {
  return active ? baseSize * 1.22 : baseSize;
}
