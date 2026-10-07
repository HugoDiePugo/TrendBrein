import { useState } from "react";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import type { GraphData, NodeType } from "../../types/graph";
import { categories } from "../../graph/graphStyles";

export function matchesNodeQuery(
  node: GraphData["nodes"][number],
  query: string,
) {
  const term = query.trim().toLocaleLowerCase("nl");
  return [
    node.id,
    node.displayId,
    ...(node.aliases ?? []),
    node.title,
    ...node.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("nl")
    .includes(term);
}

export function Search({
  data,
  enabled,
  onSelect,
}: {
  data: GraphData;
  enabled: Set<NodeType>;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const term = query.trim().toLocaleLowerCase("nl");
  const matches = data.nodes.filter((node) => matchesNodeQuery(node, term));
  return (
    <section className="search">
      <label className="search-field">
        <SearchIcon size={16} />
        <input
          aria-label="Zoek op titel of tag"
          placeholder="Zoek een gedachte of tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="Zoekveld wissen" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </label>
      <button
        className="browse-button"
        aria-expanded={showAll}
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? "Nodelijst sluiten" : "Alle nodes bekijken"}{" "}
        <span>{data.nodes.length}</span>
      </button>
      {(term || showAll) && (
        <div className="search-results" aria-label="Zoekresultaten">
          {!matches.length && <p>Geen nodes gevonden.</p>}
          {matches.map((n) => (
            <button key={n.id} onClick={() => onSelect(n.id)}>
              <span
                className="type-dot"
                style={{ background: categories[n.type].color }}
              />
              <span>
                {n.displayId && (
                  <small className="result-id">{n.displayId}</small>
                )}
                {n.title}
                {!enabled.has(n.type) && (
                  <small>Verborgen laag · wordt geopend</small>
                )}
              </span>
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
