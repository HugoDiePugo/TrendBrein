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
      <div className="section-heading">
        <h2>Legenda en lagen</h2>
        {onToggle ? (
          <button
            className="legend-toggle"
            aria-expanded={!collapsed}
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            {collapsed ? "Legenda tonen" : "Legenda verbergen"}
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
      {!collapsed && (
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
      )}
    </section>
  );
}
