# Trendbrein dataset v0.7.0

- 152 nodes
- 346 edges
- 3 geselecteerde hoofdtrends, 15 ideation-richtingen, 3 verkende voorbeelden en 3 voorlopige kansrichtingen
- 6 guided tours met samen 59 stappen
- Doorzoekbare `displayId`- en aliasvelden en gestructureerde nodeverwijzingen
- Eén configureerbare 2×2-scenariomatrix en 3 Kanschecks, standaard alleen zichtbaar in Onderzoeksmodus
- Generieke evidence- en counterevidenceblokken, waaronder de twee algoritmetakken
- Brondata met publicatie-/campagnedatum, `z.d.`, datumtoelichting en afzonderlijke geraadpleegd-datum
- Metadata voor de aanbevolen hoofdroute en de kaartpresets `Kern` en `Alles`
- Een expliciete vervolgroute van `main-story` naar `from-trends-to-options`
- Selectieargumentatie bij de 3 voorlopige kansrichtingen
- Korte summaries met uitgebreidere bodies voor verdieping
- Eigen observaties staan volledig in dezelfde signalenbank; er is geen aparte inhoudelijke categorie voor.

## Belangrijk
Dit is een werkdataset. `status` en `confidence` maken zichtbaar wat geobserveerd, onderbouwd, onzeker of nog te verifiëren is. Een edge betekent een relevante relatie, geen bewezen causaliteit.

## Implementatiestatus
De website laadt deze `graph.json` en `tours.json` rechtstreeks. De dataset is gevalideerd op dubbele of ontbrekende node-, edge-, tour- en vervolgroutereferenties. De productieversie wordt via GitHub Pages gepubliceerd.
