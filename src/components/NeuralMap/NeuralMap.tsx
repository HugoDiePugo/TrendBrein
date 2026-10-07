import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import type { GraphData, GraphPreset, NodeType } from "../../types/graph";
import { buildGraph, displayNodeSize } from "../../graph/buildGraph";
import { palette } from "../../graph/graphStyles";
import { Maximize, Minus, Plus } from "lucide-react";

type Props = {
  data: GraphData;
  selected: string | null;
  enabled: Set<NodeType>;
  preset: GraphPreset;
  onSelect: (id: string | null) => void;
  focusVersion: number;
};
export function NeuralMap({
  data,
  selected,
  enabled,
  preset,
  onSelect,
  focusVersion,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const renderer = useRef<Sigma | null>(null);
  const callback = useRef(onSelect);
  callback.current = onSelect;
  const [hovered, setHovered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailed, setDetailed] = useState(false);
  const [compact, setCompact] = useState(() => window.innerWidth <= 800);
  const duration = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
  useEffect(() => {
    if (!container.current) return;
    try {
      const sigma = new Sigma(buildGraph(data), container.current, {
        renderEdgeLabels: true,
        labelFont: "Inter, system-ui, sans-serif",
        labelSize: 12,
        labelWeight: "500",
        labelColor: { color: palette.text },
        edgeLabelColor: { color: palette.text },
        edgeLabelSize: 10,
        labelDensity: 0.45,
        labelGridCellSize: 150,
        labelRenderedSizeThreshold: 6,
        stagePadding: 40,
        minCameraRatio: 0.15,
        maxCameraRatio: 3,
        zIndex: true,
        defaultDrawNodeHover: (context, node) => {
          context.beginPath();
          context.arc(node.x, node.y, node.size + 7, 0, Math.PI * 2);
          context.strokeStyle = node.color;
          context.lineWidth = 1;
          context.shadowColor = node.color;
          context.shadowBlur = 15;
          context.stroke();
          context.shadowBlur = 0;
        },
      });
      renderer.current = sigma;
      setDetailed(false);
      sigma
        .getCamera()
        .on("updated", ({ ratio }) =>
          setDetailed(ratio < (window.innerWidth <= 800 ? 0.38 : 0.6)),
        );
      const resize = new ResizeObserver(() => {
        setCompact(window.innerWidth <= 800);
        sigma.refresh();
      });
      resize.observe(container.current);
      sigma.on("enterNode", ({ node }) => setHovered(node));
      sigma.on("leaveNode", () => setHovered(null));
      sigma.on("clickNode", ({ node }) => callback.current(node));
      sigma.on("clickStage", () => callback.current(null));
      return () => {
        resize.disconnect();
        sigma.kill();
        renderer.current = null;
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "De kaart kon niet starten.");
    }
  }, [data]);
  useEffect(() => {
    const sigma = renderer.current;
    if (!sigma) return;
    const graph = sigma.getGraph();
    const active =
      hovered && enabled.has(graph.getNodeAttribute(hovered, "category"))
        ? hovered
        : selected && graph.hasNode(selected)
          ? selected
          : null;
    const neighbors = new Set(active ? graph.neighbors(active) : []);
    const rules = (
      data.meta?.graphPresentation as
        | {
            labelRules?: {
              defaultHideLabelsForTypes?: string[];
              defaultHideLabelsForStatuses?: string[];
            };
          }
        | undefined
    )?.labelRules;
    const hiddenTypes = new Set(rules?.defaultHideLabelsForTypes ?? []);
    const hiddenStatuses = new Set(rules?.defaultHideLabelsForStatuses ?? []);
    sigma.setSetting("nodeReducer", (id, attrs) => {
      const relevant = !active || id === active || neighbors.has(id);
      const coreEmphasized =
        preset === "all" ||
        attrs.priority ||
        id === active ||
        neighbors.has(id);
      const overviewLabel =
        attrs.priority ||
        (compact &&
          preset === "core" &&
          attrs.status === "shortlisted_direction") ||
        (preset === "all" &&
          !compact &&
          !hiddenTypes.has(attrs.category) &&
          !hiddenStatuses.has(attrs.status));
      // Only shorten canvas labels; stored titles and the detail panel stay intact.
      const title = String(attrs.label);
      const mobileShortlist =
        compact &&
        preset === "core" &&
        attrs.status === "shortlisted_direction";
      const labelLimit = 36;
      const label =
        mobileShortlist && !active
          ? title.split(":")[0]
          : title.length > labelLimit
            ? title.slice(0, labelLimit - 1) + "…"
            : title;
      return {
        ...attrs,
        size:
          displayNodeSize(Number(attrs.baseSize), id === active) *
          (coreEmphasized ? 1 : 0.72),
        hidden: !enabled.has(attrs.category),
        color: relevant && coreEmphasized ? attrs.color : palette.muted,
        label: relevant && (active || detailed || overviewLabel) ? label : "",
        highlighted: id === active,
        zIndex: id === active ? 2 : 0,
        forceLabel: id === active || (!active && mobileShortlist),
      };
    });
    sigma.setSetting("edgeReducer", (id, attrs) => {
      const [source, target] = graph.extremities(id);
      const relevant = !!active && (source === active || target === active);
      const coreEdge =
        graph.getNodeAttribute(source, "priority") &&
        graph.getNodeAttribute(target, "priority");
      return {
        ...attrs,
        hidden:
          !enabled.has(graph.getNodeAttribute(source, "category")) ||
          !enabled.has(graph.getNodeAttribute(target, "category")),
        color: relevant
          ? palette.active
          : active
            ? palette.dimmedEdge
            : preset === "core" && !coreEdge
              ? palette.dimmedEdge
              : palette.edge,
        size: relevant ? 1.5 : preset === "core" && !coreEdge ? 0.4 : 0.65,
        label: relevant && (neighbors.size <= 6 || detailed) ? attrs.label : "",
        forceLabel: false,
        zIndex: relevant ? 1 : 0,
      };
    });
  }, [hovered, selected, enabled, data, detailed, compact, preset]);
  useEffect(() => {
    const sigma = renderer.current;
    if (!sigma || !selected || !sigma.getGraph().hasNode(selected)) return;
    // Reducer settings schedule processing. Finish it before reading normalized
    // display coordinates, otherwise the camera can receive raw layout positions.
    sigma.refresh();
    const point = sigma.getNodeDisplayData(selected);
    if (point)
      void sigma
        .getCamera()
        .animate(
          { x: point.x, y: point.y, ratio: 0.65 },
          { duration: duration() },
        );
  }, [selected, focusVersion, data]);
  return (
    <div className="map-wrap">
      <div
        ref={container}
        className="sigma-container"
        role="img"
        aria-label="Interactieve neurale kaart. Gebruik de zoekfunctie of nodelijst om met het toetsenbord te navigeren."
      />
      {error && (
        <div className="map-error" role="alert">
          <h2>De kaart kon niet starten</h2>
          <p>
            Controleer of WebGL en hardwareversnelling beschikbaar zijn. Je kunt
            nodes nog via de nodelijst bekijken.
          </p>
          <small>{error}</small>
        </div>
      )}
      <div className="map-controls">
        <button
          title="Inzoomen"
          aria-label="Inzoomen"
          onClick={() =>
            void renderer.current
              ?.getCamera()
              .animatedZoom({ duration: duration() })
          }
        >
          <Plus size={17} />
        </button>
        <button
          title="Uitzoomen"
          aria-label="Uitzoomen"
          onClick={() =>
            void renderer.current
              ?.getCamera()
              .animatedUnzoom({ duration: duration() })
          }
        >
          <Minus size={17} />
        </button>
        <span />
        <button
          title="Volledige kaart passend in beeld"
          aria-label="Volledige kaart passend in beeld"
          onClick={() =>
            void renderer.current
              ?.getCamera()
              .animatedReset({ duration: duration() })
          }
        >
          <Maximize size={17} />
        </button>
      </div>
      <div className="map-hint">
        Sleep om te verkennen <span>·</span> Zoom in voor meer labels
      </div>
    </div>
  );
}
