import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";
import type { Tour } from "../../types/graph";
export function GuidedTour({
  tour,
  index,
  onStep,
  onExit,
  onOpenDetail,
  onNextTour,
  showIntro,
  onStart,
}: {
  tour: Tour;
  index: number;
  onStep: (index: number) => void;
  onExit: () => void;
  onOpenDetail: () => void;
  onNextTour?: () => void;
  showIntro: boolean;
  onStart: () => void;
}) {
  const step = tour.steps[index];
  return (
    <section className="tour-panel" aria-label="Mijn route">
      <div className="tour-heading">
        <span className="eyebrow">{tour.title}</span>
        <button
          className="icon-button"
          aria-label="Tour verlaten"
          onClick={onExit}
        >
          <X size={17} />
        </button>
      </div>
      {showIntro && tour.intro ? (
        <div className="tour-story" aria-live="polite">
          <h2>{tour.intro.title}</h2>
          <p>{tour.intro.text}</p>
          <button className="primary-button tour-intro-start" onClick={onStart}>
            Start route <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="tour-story" aria-live="polite">
            {step.phase && <span className="tour-phase">{step.phase}</span>}
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </div>
          {index === tour.steps.length - 1 && onNextTour && (
            <div className="tour-handoff">
              {tour.nextTourDescription && <p>{tour.nextTourDescription}</p>}
              <button className="primary-button" onClick={onNextTour}>
                {tour.nextTourLabel ?? "Ga verder"} <ArrowRight size={15} />
              </button>
            </div>
          )}
          <div className="tour-navigation">
            <button disabled={index === 0} onClick={() => onStep(index - 1)}>
              <ArrowLeft size={15} /> Vorige
            </button>
            <span>
              {index + 1} <span className="muted">/ {tour.steps.length}</span>
            </span>
            {index === tour.steps.length - 1 ? (
              <button onClick={onExit}>
                Afronden <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={() => onStep(index + 1)}>
                Volgende <ArrowRight size={15} />
              </button>
            )}
          </div>
          <button className="tour-detail-button" onClick={onOpenDetail}>
            <BookOpen size={14} /> Bekijk verdieping
          </button>
          <div
            className="tour-progress"
            style={{ width: `${((index + 1) / tour.steps.length) * 100}%` }}
          />
        </>
      )}
    </section>
  );
}
