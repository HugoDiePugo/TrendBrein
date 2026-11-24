# Trendbrein dataset v0.9.1

- 152 nodes
- 346 edges
- 3 geselecteerde hoofdtrends. De 21 onderdelen bij ‘kansen’ bestaan uit 15 ideeën, 3 kansrichtingen op de shortlist en 1 verkend voorbeeld per richting.
- 6 guided tours met samen 61 stappen
- 7 stappen van de haarclip tot de keuze voor Embedded Expressie, met de vergelijking bij het cluster, de trendpiramide bij de trend, DESTEP bij de sociaal-culturele factor en het canvas bij de waardeverschuiving
- Doorzoekbare `displayId`- en aliasvelden en gestructureerde nodeverwijzingen
- De 2×2-scenariomatrix is zichtbaar bij de AI-scenarioanalyse. De 3 Kanschecks staan bij de verkende voorbeelden en worden zichtbaar in Onderzoeksmodus.
- Generieke evidence- en counterevidenceblokken, waaronder de twee algoritmetakken
- Brondata met publicatie-/campagnedatum, `z.d.`, datumtoelichting en afzonderlijke geraadpleegd-datum
- Metadata voor de aanbevolen hoofdroute en de kaartpresets `Kern` en `Alles`
- Een expliciete vervolgroute van `main-story` naar `from-trends-to-options`
- Een intro en fase-aanduidingen per tour voor een duidelijke vertelvolgorde
- Selectieargumentatie bij de 3 voorlopige kansrichtingen
- Korte summaries met uitgebreidere bodies voor verdieping
- Eigen observaties staan volledig in dezelfde signalenbank; er is geen aparte inhoudelijke categorie voor.

## Onderzoeksstatus

Dit is een werkdataset. `status` en `confidence` maken zichtbaar wat geobserveerd, onderbouwd, onzeker of nog te verifiëren is. Een edge betekent een relevante relatie, geen bewezen causaliteit.

## Implementatiestatus

Vite neemt `graph.json` en `tours.json` op in de productiebuild. De app valideert de data bij het starten. De versienummers in beide bestanden zijn gelijk aan de appversie 0.9.1. Onderzoeksmodus toont de versie uit `graph.meta.version`. [Wijzigingen in 0.9.1](../../CHANGELOG_v0.9.1.md)
