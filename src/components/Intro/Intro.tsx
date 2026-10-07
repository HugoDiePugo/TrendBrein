import { ArrowRight, Route } from "lucide-react";
export function Intro({
  onExplore,
  onTour,
  hasTour,
  demo,
  entry,
}: {
  onExplore: () => void;
  onTour: () => void;
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
        <span className="eyebrow">Een kaart van mijn gedachten</span>
        <h1>
          Hoe kijk ik
          <br />
          naar de <em>wereld?</em>
        </h1>
        <p>
          Van een losse observatie naar een nieuwe verbinding.
          <br />
          Verken de kaart, volg een gedachte en ontdek hoe
          <br className="desktop-break" /> alles met elkaar kan samenhangen.
        </p>
        {entry?.title && <h2 className="entry-title">{entry.title}</h2>}
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
              {entry?.secondaryAction?.description && (
                <small>{entry.secondaryAction.description}</small>
              )}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
        <small>
          {demo
            ? "TECHNISCHE DEMO · Alle inhoud en verbanden zijn fictieve testdata."
            : "Een interactieve verkenning van mijn denkproces."}
        </small>
      </div>
      <div className="intro-index">
        <span>01 — OBSERVEREN</span>
        <span>02 — VERBINDEN</span>
        <span>03 — VERBEELDEN</span>
      </div>
    </div>
  );
}
