import type Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
export function applyLayout(graph: Graph) {
  if (graph.order < 2) return;
  forceAtlas2.assign(graph, {
    iterations: 260,
    settings: {
      ...forceAtlas2.inferSettings(graph),
      gravity: 0.6,
      scalingRatio: 18,
      adjustSizes: true,
      slowDown: 4,
    },
    getEdgeWeight: "weight",
  });
}
