import { useEffect } from "react";
import { ArrowRight, Route, X } from "lucide-react";
import type { Tour } from "../../types/graph";

export function TourChooser({
  tours,
  onSelect,
  onClose,
}: {
  tours: Tour[];
  onSelect: (tour: Tour) => void;
  onClose: () => void;
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
          {tours.map((tour, index) => (
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
                <span>
                  <Route size={13} /> {tour.steps.length} stappen
                </span>
              </span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
