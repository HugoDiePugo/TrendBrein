import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { GraphData, GraphNode } from "../../types/graph";

export function AnalysisPanels({
  node,
  data,
  activeId,
  onSelect,
}: {
  node: GraphNode;
  data: GraphData;
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  if (!node.analyses?.length) return null;
  const panels = activeId
    ? node.analyses.filter((item) => item.id === activeId)
    : node.analyses;
  return (
    <div className="analysis-panels">
      {panels.map((item) => (
        <details
          className="analysis-sheet"
          key={item.id}
          open={activeId === item.id || undefined}
        >
          <summary>{item.title}</summary>
          <div className="analysis-content">
            <p className="analysis-question">{item.question}</p>
            <p className="analysis-method">
              {item.method}{" "}
              {item.methodUrl && (
                <a href={item.methodUrl} target="_blank" rel="noreferrer">
                  Origineel werkblad <ExternalLink size={12} />
                </a>
              )}
            </p>
            <dl className="analysis-fields">
              {item.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    <p>{row.finding}</p>
                    {row.limit && <p className="analysis-limit">{row.limit}</p>}
                    {row.sources?.map((id) => {
                      const source = data.nodes.find(
                        (candidate) => candidate.id === id,
                      )!;
                      return (
                        <button
                          className="analysis-source"
                          key={id}
                          onClick={() => onSelect(id)}
                        >
                          {source.displayId ? source.displayId + " · " : ""}
                          {source.title} <ArrowUpRight size={12} />
                        </button>
                      );
                    })}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="analysis-result">
              <strong>Wat ik hieruit haal</strong>
              {item.conclusion}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
