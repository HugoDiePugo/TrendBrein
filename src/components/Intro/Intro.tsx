import { ArrowRight, Route } from "lucide-react";
export function Intro({
  onExplore,
  onTour,
  onOpenReview,
  hasTour,
  demo,
  entry,
}: {
  onExplore: () => void;
  onTour: () => void;
  onOpenReview?: () => void;
  hasTour: boolean;
  demo: boolean;
  entry?: {
    title?: string;
    primaryAction?: { label?: string; description?: string };
    secondaryAction?: { label?: string; description?: string };
  };
}) {
  return (
    <div className="intro">
      <div className="intro-orbit orbit-one" />
      <div className="intro-orbit orbit-two" />
      <div className="intro-content">
        <span className="eyebrow">Mijn Trendbrein</span>
        <h1>
          Mijn <em>denkproces</em>
        </h1>
        <p className="intro-summary">
          Een interactieve verkenning van mijn denkproces.
        </p>
        <p className="intro-guide">
          Volg mijn reis van signalen naar trends en kansrichtingen, of verken
          het netwerk zelf.
        </p>
        {entry?.title && <h2 className="entry-title">{entry.title}</h2>}
        {onOpenReview && (
          <button
            className="primary-button reviewer-entry"
            onClick={onOpenReview}
          >
            Hoe ik bij Embedded Expressie kwam <ArrowRight size={17} />
          </button>
        )}
        <div className="intro-actions entry-actions">
          <button
            className="primary-button entry-action"
            onClick={onTour}
            disabled={!hasTour}
          >
            <span>
              <strong>{entry?.primaryAction?.label ?? "Volg mijn reis"}</strong>
              {entry?.primaryAction?.description && (
                <small>{entry.primaryAction.description}</small>
              )}
            </span>
            <Route size={17} />
          </button>
          <button className="secondary-button entry-action" onClick={onExplore}>
            <span>
              <strong>
                {entry?.secondaryAction?.label ?? "Vrij verkennen"}
              </strong>
              <small>
                Bekijk de kaart als overzicht van mijn verbanden. Klik op een
                node voor uitleg, bronnen en verdieping.
              </small>
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
        {demo && (
          <small>
            TECHNISCHE DEMO · Alle inhoud en verbanden zijn fictieve testdata.
          </small>
        )}
      </div>
    </div>
  );
}
