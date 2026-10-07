import { ArrowUpRight } from "lucide-react";
import type { GraphData, GraphNode } from "../../types/graph";

export function ScenarioMatrix({
  node,
  data,
  onSelect,
}: {
  node: GraphNode;
  data: GraphData;
  onSelect: (id: string) => void;
}) {
  const visualization = node.visualization;
  if (!visualization) return null;
  const opportunityLinks =
    visualization.interaction?.showOpportunityLinkFor ?? {};

  return (
    <section className="scenario-matrix" aria-label={visualization.title}>
      <h3>{visualization.title}</h3>
      <div className="matrix-y-label">
        <span>{visualization.yAxis.high}</span>
        <strong>{visualization.yAxis.label}</strong>
        <span>{visualization.yAxis.low}</span>
      </div>
      <div className="matrix-grid">
        {visualization.quadrants.map((quadrant) => {
          const opportunityId = opportunityLinks[quadrant.nodeId];
          const opportunity = opportunityId
            ? data.nodes.find((candidate) => candidate.id === opportunityId)
            : undefined;
          return (
            <article
              key={quadrant.position}
              className={`matrix-quadrant ${quadrant.position}`}
            >
              <button onClick={() => onSelect(quadrant.nodeId)}>
                <strong>{quadrant.title}</strong>
                <span>{quadrant.short}</span>
              </button>
              {opportunity && (
                <button
                  className="matrix-opportunity"
                  onClick={() => onSelect(opportunity.id)}
                >
                  Kans: {opportunity.title} <ArrowUpRight size={11} />
                </button>
              )}
            </article>
          );
        })}
      </div>
      <div className="matrix-x-axis">
        <span>{visualization.xAxis.low}</span>
        <strong>{visualization.xAxis.label}</strong>
        <span>{visualization.xAxis.high}</span>
      </div>
    </section>
  );
}
