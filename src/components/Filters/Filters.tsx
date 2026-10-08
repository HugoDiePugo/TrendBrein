import { categories } from "../../graph/graphStyles";
import { ChevronDown, ChevronRight } from "lucide-react";
import { nodeTypes, type GraphData, type NodeType } from "../../types/graph";
type Props = {
  data: GraphData;
  enabled: Set<NodeType>;
  onChange: (set: Set<NodeType>) => void;
  collapsed?: boolean;
  onToggle?: () => void;
};
export function Filters({
  data,
  enabled,
  onChange,
  collapsed = false,
  onToggle,
}: Props) {
  return (
    <section className={`filters ${collapsed ? "is-collapsed" : ""}`}>
      {collapsed && onToggle ? (
        <button
          className="legend-collapsed-toggle"
          aria-expanded="false"
          onClick={onToggle}
        >
          <ChevronRight size={14} /> Legenda en lagen tonen
        </button>
      ) : (
        <>
          <div className="section-heading">
            <h2>Legenda en lagen</h2>
            {onToggle ? (
          <button
            className="legend-toggle"
            aria-expanded="true"
            onClick={onToggle}
          >
            <ChevronDown size={13} /> Legenda inklappen
          </button>
            ) : (
          <button
            onClick={() =>
              onChange(
                new Set(enabled.size === nodeTypes.length ? [] : nodeTypes),
              )
            }
          >
            {enabled.size === nodeTypes.length ? "Alles uit" : "Alles aan"}
          </button>
            )}
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
        </>
      )}
    </section>
  );
}
