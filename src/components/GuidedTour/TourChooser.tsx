import { useEffect } from "react";
import { ArrowRight, Check, RotateCcw, Route, X } from "lucide-react";
import type { Tour } from "../../types/graph";
import { tourActionLabel, type TourProgress } from "../../tours/tourProgress";

export function TourChooser({
  tours,
  progress,
  onSelect,
  onClose,
  onResetProgress,
}: {
  tours: Tour[];
  progress: TourProgress;
  onSelect: (tour: Tour) => void;
  onClose: () => void;
  onResetProgress: () => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="tour-chooser-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="tour-chooser"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-chooser-title"
      >
        <div className="tour-chooser-heading">
          <div>
            <span className="eyebrow">Mijn routes</span>
            <h2 id="tour-chooser-title">Welke route wil je volgen?</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Tourkeuze sluiten"
          >
            <X size={18} />
          </button>
        </div>
        <p className="tour-chooser-intro">
          Volg een route om mijn proces stap voor stap te bekijken.
        </p>
        <div className="tour-options">
          {tours.map((tour, index) => {
            const status = progress[tour.id];
            return (
              <button
                key={tour.id}
                autoFocus={index === 0}
                onClick={() => onSelect(tour)}
              >
                <span className="tour-option-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="tour-option-copy">
                  <strong>{tour.title}</strong>
                  {tour.description && <small>{tour.description}</small>}
                  <span className="tour-option-meta">
                    <Route size={13} /> {tour.steps.length} stappen
                  </span>
                  <span className="tour-option-status">
                    {status?.completed ? (
                      <>
                        <Check size={13} /> Voltooid
                      </>
                    ) : status?.started ? (
                      `Bezig · ${status.currentStep + 1}/${tour.steps.length}`
                    ) : (
                      "Nog niet gestart"
                    )}
                    <em>{tourActionLabel(status)}</em>
                  </span>
                </span>
                <ArrowRight size={17} />
              </button>
            );
          })}
        </div>
        {Object.keys(progress).length > 0 && (
          <button className="tour-progress-reset" onClick={onResetProgress}>
            <RotateCcw size={14} /> Reset tourvoortgang
          </button>
        )}
      </section>
    </div>
  );
}
