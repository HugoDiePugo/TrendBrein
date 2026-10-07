import { categories } from "../../graph/graphStyles";
import { nodeTypes, type GraphData, type NodeType } from "../../types/graph";
type Props = {
  data: GraphData;
  enabled: Set<NodeType>;
  onChange: (set: Set<NodeType>) => void;
};
export function Filters({ data, enabled, onChange }: Props) {
  return (
    <section className="filters">
      <div className="section-heading">
        <h2>Lagen van mijn denken</h2>
        <button
          onClick={() =>
            onChange(
              new Set(enabled.size === nodeTypes.length ? [] : nodeTypes),
            )
          }
        >
          {enabled.size === nodeTypes.length ? "Alles uit" : "Alles aan"}
        </button>
      </div>
      <div className="filter-list">
        {nodeTypes.map((type) => (
          <label key={type} className={!enabled.has(type) ? "disabled" : ""}>
            <input
              type="checkbox"
              checked={enabled.has(type)}
              onChange={() => {
                const next = new Set(enabled);
                if (next.has(type)) next.delete(type);
                else next.add(type);
                onChange(next);
              }}
            />
            <span
              className="type-dot"
              style={{ background: categories[type].color }}
            />
            <span>{categories[type].label}</span>
            <small>{data.nodes.filter((n) => n.type === type).length}</small>
          </label>
        ))}
      </div>
    </section>
  );
}
