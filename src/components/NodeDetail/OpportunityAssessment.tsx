import { ArrowUpRight } from "lucide-react";
import type { GraphData, GraphNode } from "../../types/graph";

const labels = {
  problem: "Probleem",
  targetGroup: "Doelgroep",
  novelty: "Nieuwheid",
  fitWithHugo: "Fit met Hugo",
  differentiation: "Onderscheid",
  biggestRisk: "Grootste risico",
} as const;

export function OpportunityAssessment({
  node,
  data,
  onSelect,
}: {
  node: GraphNode;
  data: GraphData;
  onSelect: (id: string) => void;
}) {
  const assessment = node.opportunityAssessment;
  if (!assessment) return null;
  return (
    <section className="opportunity-assessment">
      <h3>Kanscheck</h3>
      <div className="assessment-grid">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
          <div key={key}>
            <small>{labels[key]}</small>
            <p>{assessment[key]}</p>
          </div>
        ))}
      </div>
      <div className="assessment-solutions">
        <small>Bestaande oplossingen</small>
        {assessment.existingSolutions.map((solution) => {
          const solutionNode = data.nodes.find(
            (candidate) => candidate.id === solution.nodeId,
          );
          return (
            <button
              key={solution.nodeId}
              onClick={() => onSelect(solution.nodeId)}
            >
              <span>
                <strong>{solutionNode?.title ?? solution.nodeId}</strong>
                {solution.overlap && <small>{solution.overlap}</small>}
              </span>
              <ArrowUpRight size={12} />
            </button>
          );
        })}
      </div>
      <div className="assessment-tests">
        <small>Volgende tests</small>
        <ol>
          {assessment.nextTests.map((test) => (
            <li key={test}>{test}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
