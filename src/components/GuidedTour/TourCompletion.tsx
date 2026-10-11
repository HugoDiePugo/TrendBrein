import { Map, Route } from "lucide-react";

export function TourCompletion({
  onChooseRoute,
  onViewOptions,
}: {
  onChooseRoute: () => void;
  onViewOptions: () => void;
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
        Daaruit houd ik drie brede kansrichtingen over: expressieve embedded
        accessoires, menselijke regie over AI-autonomie en beïnvloedbare
        personalisatie. Dit zijn nog geen uitgewerkte producten, maar richtingen
        die ik in een volgende fase verder kan onderzoeken.
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
