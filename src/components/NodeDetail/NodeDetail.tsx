import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleHelp,
  ExternalLink,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { GraphData, GraphNode } from "../../types/graph";
import { categories, relationLabels } from "../../graph/graphStyles";
import { ScenarioMatrix } from "./ScenarioMatrix";
import { OpportunityAssessment } from "./OpportunityAssessment";

const opportunityStatuses: Record<string, string> = {
  candidate_needs_differentiation: "Nog onderscheid aanscherpen",
  candidate_requires_pivot: "Idee moet worden bijgesteld",
  candidate_weak_needs_reframe: "Zwakke kans / opnieuw kaderen",
};
const uncertainStatuses = new Set([
  "headline_based",
  "needs_legal_nuance",
  "needs_verification",
  "observed_partial",
  "observed_unquantified",
  "tentative",
  "uncertain",
  "unverified",
  "unverified_business_model",
  "unverified_content",
  "working",
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function LinkedBody({
  node,
  onSelect,
}: {
  node: GraphNode;
  onSelect: (id: string) => void;
}) {
  if (!node.body) return null;
  const references = node.references ?? [];
  const labels = references
    .flatMap((reference) => [reference.displayId, reference.nodeId])
    .filter((label): label is string => !!label)
    .filter((label, index, all) => all.indexOf(label) === index)
    .sort((a, b) => b.length - a.length);
  if (!labels.length) return <>{node.body}</>;
  const pattern = new RegExp(
    `\\b(${labels.map(escapeRegExp).join("|")})\\b`,
    "gi",
  );
  return (
    <>
      {node.body.split(pattern).map((part, index) => {
        const reference = references.find(
          (candidate) =>
            candidate.nodeId.toLocaleLowerCase("nl") ===
              part.toLocaleLowerCase("nl") ||
            candidate.displayId?.toLocaleLowerCase("nl") ===
              part.toLocaleLowerCase("nl"),
        );
        return reference ? (
          <button
            className="inline-reference"
            key={`${part}-${index}`}
            onClick={() => onSelect(reference.nodeId)}
          >
            {part}
          </button>
        ) : (
          part
        );
      })}
    </>
  );
}

function EvidenceLinks({
  title,
  references,
  note,
  strength,
  data,
  onSelect,
}: {
  title: string;
  references?: GraphNode["evidenceRefs"];
  note?: string;
  strength?: string;
  data: GraphData;
  onSelect: (id: string) => void;
}) {
  if (!references?.length && !note) return null;
  return (
    <section className="evidence-block">
      <div className="evidence-heading">
        <h3>{title}</h3>
        {strength && <span>{strength}</span>}
      </div>
      {!!references?.length && (
        <div className="evidence-links">
          {references.map((reference) => {
            const linked = data.nodes.find(
              (candidate) => candidate.id === reference.nodeId,
            );
            return (
              <button
                key={reference.nodeId}
                onClick={() => onSelect(reference.nodeId)}
              >
                <strong>{linked?.displayId ?? reference.nodeId}</strong>
                <span>
                  {reference.title ?? linked?.title ?? reference.nodeId}
                </span>
                <ArrowUpRight size={13} />
              </button>
            );
          })}
        </div>
      )}
      {note && <p className="evidence-note">{note}</p>}
    </section>
  );
}

const sourceDateLabels: Record<string, string> = {
  campaign_start: "Campagne gestart",
  document_date: "Documentdatum",
  publication: "Gepubliceerd",
  publication_or_event: "Publicatie/event",
  year: "Jaar",
};

export function NodeDetail({
  node,
  data,
  researchMode,
  tourActive,
  onSelect,
  onClose,
}: {
  node: GraphNode;
  data: GraphData;
  researchMode: boolean;
  tourActive: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
  }, [node.id]);
  const edges = data.edges.filter(
    (e) => e.source === node.id || e.target === node.id,
  );
  const researchHelp = (
    data.meta as
      | {
          presentation?: {
            modes?: { research?: { help?: Record<string, string> } };
          };
        }
      | undefined
  )?.presentation?.modes?.research?.help;
  const avoidTourSummary = !!(
    data.meta?.tourPresentation as
      { avoidDuplicateSummaryDuringTour?: boolean } | undefined
  )?.avoidDuplicateSummaryDuringTour;
  const algorithmBranches =
    node.id === "T_ALGO_PERSONAL"
      ? edges
          .filter((edge) => edge.type === "part_of" && edge.target === node.id)
          .map((edge) => data.nodes.find((item) => item.id === edge.source))
          .filter((item): item is GraphNode => !!item)
      : [];
  const linkedFoundations = node.visitorPresentation?.showLinkedTrendAndShift
    ? edges
        .map((edge) =>
          data.nodes.find(
            (item) =>
              item.id === (edge.source === node.id ? edge.target : edge.source),
          ),
        )
        .filter(
          (item): item is GraphNode =>
            !!item && (item.type === "trend" || item.type === "value_shift"),
        )
        .filter(
          (item, index, all) =>
            all.findIndex((candidate) => candidate.id === item.id) === index,
        )
    : [];
  return (
    <aside ref={panel} className="detail-panel" aria-label="Nodedetails">
      <div className="detail-top">
        <span className="eyebrow">Gedachte in focus</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Detailpanel sluiten"
        >
          <X size={18} />
        </button>
      </div>
      <span
        className="node-type"
        style={{ color: categories[node.type].color }}
      >
        <i style={{ background: categories[node.type].color }} />
        {categories[node.type].label}
      </span>
      {node.displayId && <span className="display-id">{node.displayId}</span>}
      <h2>{node.title}</h2>
      {node.visitorPresentation?.badge && (
        <p className="visitor-badge">{node.visitorPresentation.badge}</p>
      )}
      {node.status && opportunityStatuses[node.status] && (
        <p className="human-status">{opportunityStatuses[node.status]}</p>
      )}
      {node.status &&
        !opportunityStatuses[node.status] &&
        uncertainStatuses.has(node.status) && (
          <p className="uncertainty-note">Nog niet volledig bevestigd</p>
        )}
      {node.summary && !(tourActive && avoidTourSummary && node.body) && (
        <p className="summary">{node.summary}</p>
      )}
      {node.body && node.body !== node.summary && (
        <section className="node-body">
          <h3>Verdieping</h3>
          <p className="body-copy">
            <LinkedBody node={node} onSelect={onSelect} />
          </p>
        </section>
      )}
      {node.visitorPresentation?.note && (
        <p className="visitor-note">{node.visitorPresentation.note}</p>
      )}
      {!!algorithmBranches.length && (
        <section className="branch-cards">
          <h3>Twee analytische takken</h3>
          <div>
            {algorithmBranches.map((branch, index) => (
              <button key={branch.id} onClick={() => onSelect(branch.id)}>
                <small>Tak {index + 1}</small>
                <strong>{branch.title}</strong>
                <span>{branch.summary}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {!!linkedFoundations.length && (
        <section className="linked-foundations">
          <h3>Gekoppelde trend en waardeverschuiving</h3>
          <div>
            {linkedFoundations.map((foundation) => (
              <button
                key={foundation.id}
                onClick={() => onSelect(foundation.id)}
              >
                <span>{categories[foundation.type].label}</span>
                <strong>{foundation.title}</strong>
              </button>
            ))}
          </div>
        </section>
      )}
      {node.type === "driver" ? (
        <EvidenceLinks
          title="Onderbouwd door"
          references={node.evidenceRefs}
          note={node.evidenceNote}
          strength={node.evidenceStrength}
          data={data}
          onSelect={onSelect}
        />
      ) : (
        <EvidenceLinks
          title="Ondersteunend bewijs"
          references={node.evidenceRefs}
          note={node.evidenceNote}
          strength={node.evidenceStrength}
          data={data}
          onSelect={onSelect}
        />
      )}
      <EvidenceLinks
        title="Tegenspanning / tegenbewijs"
        references={node.counterEvidenceRefs}
        data={data}
        onSelect={onSelect}
      />
      {node.type === "opportunity" &&
        node.status === "shortlisted_direction" &&
        node.selectionRationale && (
          <section className="selection-rationale">
            <h3>Waarom deze richting bleef staan</h3>
            <p>{node.selectionRationale}</p>
          </section>
        )}
      <ScenarioMatrix node={node} data={data} onSelect={onSelect} />
      {(researchMode ||
        node.visitorPresentation?.showOpportunityAssessment !== false) && (
        <OpportunityAssessment node={node} data={data} onSelect={onSelect} />
      )}
      {!!node.references?.length && (
        <section className="mentioned-nodes">
          <h3>Genoemde nodes</h3>
          <div>
            {node.references.map((reference) => (
              <button
                key={reference.nodeId}
                onClick={() => onSelect(reference.nodeId)}
              >
                <strong>{reference.displayId ?? reference.nodeId}</strong>
                <span>{reference.title ?? reference.nodeId}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {researchMode && !!node.tags.length && (
        <div className="tags">
          {node.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
      {researchMode && (node.status || node.confidence !== undefined) && (
        <div className="metadata">
          {node.status && (
            <div>
              <small title={researchHelp?.status}>Status</small>
              <span>{node.status}</span>
            </div>
          )}
          {node.confidence !== undefined && (
            <div>
              <small className="metadata-help">
                Confidence
                <span
                  className="confidence-help"
                  title={researchHelp?.confidence}
                  aria-label="Uitleg confidence"
                >
                  <CircleHelp size={12} />
                </span>
              </small>
              <span>
                {Math.round(node.confidence * 100)}%{data.demo && " · demo"}
              </span>
            </div>
          )}
          <div>
            <small title={researchHelp?.nodeId}>Node-ID</small>
            <span>{node.id}</span>
          </div>
          <div>
            <small>Datasetversie</small>
            <span>
              {typeof data.meta?.version === "string"
                ? data.meta.version
                : "onbekend"}
            </span>
          </div>
        </div>
      )}
      {node.source && (
        <section className="source">
          <h3>Bronvermelding</h3>
          {node.source.url ? (
            <a href={node.source.url} target="_blank" rel="noopener noreferrer">
              {node.source.title || "Open bron"} <ExternalLink size={12} />
            </a>
          ) : (
            <p>{node.source.title}</p>
          )}
          <small
            className="source-meta"
            title={researchMode ? researchHelp?.sourceType : undefined}
          >
            {node.source.publisher && <span>{node.source.publisher}</span>}
            {node.source.date && (
              <span>
                {sourceDateLabels[node.source.dateType ?? ""] ?? "Datum"}:{" "}
                {node.source.date}
              </span>
            )}
            {node.source.dateNote && (
              <span className="source-note">{node.source.dateNote}</span>
            )}
            {node.source.accessedDate && (
              <span>Geraadpleegd: {node.source.accessedDate}</span>
            )}
            {researchMode && node.source.sourceType && (
              <span>Brontype: {node.source.sourceType}</span>
            )}
            {researchMode && node.source.dateStatus && (
              <span>Datumstatus: {node.source.dateStatus}</span>
            )}
          </small>
        </section>
      )}
      <section className="connections">
        <h3>
          Directe verbindingen <span>{edges.length}</span>
        </h3>
        {!edges.length && <p>Deze node heeft nog geen verbindingen.</p>}
        {edges.map((edge) => {
          const outgoing = edge.source === node.id;
          const other = data.nodes.find(
            (n) => n.id === (outgoing ? edge.target : edge.source),
          )!;
          return (
            <button key={edge.id} onClick={() => onSelect(other.id)}>
              {outgoing ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownLeft size={16} />
              )}
              <span>
                <small
                  title={researchMode ? researchHelp?.edgeType : undefined}
                >
                  {outgoing ? "Uitgaand" : "Inkomend"} ·{" "}
                  {edge.label || relationLabels[edge.type]}
                  {researchMode && ` · ${edge.type}`}
                </small>
                <strong>{other.title}</strong>
                <small className="relation-description">
                  {data.nodes.find((n) => n.id === edge.source)!.title} →{" "}
                  {data.nodes.find((n) => n.id === edge.target)!.title}
                </small>
              </span>
            </button>
          );
        })}
      </section>
    </aside>
  );
}
