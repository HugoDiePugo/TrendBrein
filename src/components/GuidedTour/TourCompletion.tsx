import { Map, Route } from "lucide-react";

export function TourCompletion({
  onChooseRoute,
  onViewOptions,
  onOpenReview,
}: {
  onChooseRoute: () => void;
  onViewOptions: () => void;
  onOpenReview?: () => void;
}) {
  return (
    <section
      className="tour-completion"
      aria-labelledby="tour-completion-title"
    >
      <span className="eyebrow">Mijn afronding</span>
      <h2 id="tour-completion-title">Wat ik uit deze opdracht meeneem</h2>
      <p>
        Ik begon vooral bij techniek en wat er technisch mogelijk is. Door
        signalen te vergelijken en verder te kijken naar de behoefte eronder,
        ging ik anders kijken.
      </p>
      <p>
        De rode draad werd regie: mensen willen niet alleen dat technologie iets
        kan, maar ook dat die begrijpelijk, eerlijk en beïnvloedbaar blijft.
      </p>
      <p>
        Van mijn 15 ideeën selecteerde ik 3 richtingen. Per richting verkende ik
        één voorbeeld. Uit die shortlist koos ik Embedded Expressie. Daar kan ik
        zelf hardware en software combineren tot een accessoire dat iemand
        draagt.
      </p>
      <p>
        Mijn belangrijkste inzicht is dat techniek voor mij nog steeds de ingang
        is, maar niet meer het eindpunt.
      </p>
      <p>
        Deze hoofdroute is nu afgerond. Je kunt verder met een van de vier
        verdiepende routes, of de drie kansrichtingen op de kaart bekijken.
      </p>
      <div className="tour-completion-actions">
        {onOpenReview && (
          <button className="primary-button" onClick={onOpenReview}>
            Hoe ik bij Embedded Expressie kwam <Route size={15} />
          </button>
        )}
        <button className="primary-button" onClick={onChooseRoute}>
          Kies een verdiepende route <Route size={15} />
        </button>
        <button className="secondary-button" onClick={onViewOptions}>
          Bekijk mijn drie kansrichtingen op de kaart <Map size={15} />
        </button>
      </div>
    </section>
  );
}
