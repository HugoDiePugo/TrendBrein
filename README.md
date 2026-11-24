# Trendbrein · appversie 0.9.1

Trendbrein is een interactieve kaart van mijn trendonderzoek. De site bevat **152 nodes, 346 verbindingen en zes routes met samen 61 stappen**. De kaart is gebouwd met React, TypeScript en Sigma.js. [Open Trendbrein](https://hugodiepugo.github.io/TrendBrein/)

Voor de herkansing laat *Van één signaal naar een kans* in zeven stappen zien waarom ik voor Embedded Expressie koos. Ik begin bij een haarclip met een schermpje. In stap 4 pas ik DESTEP toe, in stap 6 vergelijk ik in het trendcanvas de grap van een maker met de buttons die mijn broertje draagt. In stap 7 leg ik mijn keuze en de open vraag aan dragers uit. [Lees de route vanaf het begin](https://hugodiepugo.github.io/TrendBrein/?route=signal-to-opportunity)

De oorspronkelijke inzending hoort bij versie 0.8.1. De wijzigingen voor de herkansing staan bij versie 0.9.1. [Oorspronkelijk inleverdocument (Word)](https://github.com/HugoDiePugo/TrendBrein/blob/37fa109175acd6bdec0445c3bbf7e3ef43dee2af/docs/Inleverdocument_Trendbrein_Hugo_Halfmouw.docx) · [Wijzigingen voor de herkansing](CHANGELOG_v0.9.1.md)

## Installatie en starten

Gebruik Node.js 22 en npm om dezelfde hoofdversie te draaien als de GitHub Pages-workflow.

```sh
npm ci
npm run dev
```

Open de lokale URL die Vite toont, standaard http://127.0.0.1:5173. De ontwikkelserver luistert alleen op localhost.

```sh
npm test          # controles op data, graph-opbouw en tourvoortgang
npm run build    # TypeScript strict-controle en statische productiebuild
npm run preview  # productiebuild lokaal bekijken
```

Bij een npm-cache-permissiefout kun je `npm ci --cache .npm-cache` gebruiken. De lokale cache staat in `.gitignore`.

## Architectuur

```text
src/
  components/       NeuralMap, NodeDetail, Filters, Search, GuidedTour, Intro
  data/graph.json   één dataset met nodes en edges
  data/tours.json   routes met geordende stappen
  graph/            graph-opbouw, ForceAtlas2-layout, categoriestijlen
  schemas/          Zod-validatie en integriteitstests
  types/graph.ts    types en uitbreidbare categorie-registers
  App.tsx           selectie, filters, tourstatus en navigatie
  styles.css        responsive interface en CSS-kleurvariabelen
```

De JSON-bestanden worden met de app gebundeld. Na wijzigingen moet je opnieuw bouwen en de build publiceren. Er zijn geen backend, database, authenticatie, opslag van bezoekersdata of netwerkverzoeken voor de dataset.

## Datasetstructuur

`src/data/graph.json` bevat `meta`, `nodes` en `edges`. De optionele vlag `demo` is standaard `false`; oudere demo-datasets met `demo: true` blijven ondersteund. Metadata blijft behouden.

### Een node toevoegen

Voeg een object toe aan `nodes`:

```json
{
  "id": "demo-signaal-d",
  "type": "signal",
  "title": "Demo Signaal D",
  "summary": "DEMO — Tijdelijke testinhoud.",
  "body": "DEMO — Vervang dit later door eigen onderzoek.",
  "tags": ["demo", "test"],
  "source": {
    "title": "Demo bron",
    "publisher": "Voorbeeld, geen onderzoeksbron",
    "url": "https://example.com",
    "date": "2026-01-01",
    "sourceType": "demo"
  },
  "status": "raw",
  "confidence": 0.5,
  "importance": 0.5
}
```

Alleen `id`, `type` en `title` zijn verplicht. `tags` krijgt standaard `[]`; `importance` standaard `0.5`. `confidence` en `importance` liggen tussen 0 en 1. Importance beïnvloedt de nodegrootte; confidence is uitsluitend metadata en wordt niet berekend. `status` is vrije tekst. Bronvelden zijn optioneel. Lege URL's worden behouden. Een datum mag een geldig `YYYY-MM-DD`, alleen `YYYY` of bewust `z.d.` zijn. `accessedDate` blijft apart van de publicatie- of campagnedatum; de app leidt nooit een publicatiedatum af uit de geraadpleegd-datum.

De beschikbare types zijn `signal`, `evidence`, `cluster`, `trend`, `value`, `driver`, `value_shift`, `countertrend`, `scenario`, `opportunity` en `reflection`. De technologische factor bij de expressieve accessoires heeft het type `driver` en de tag `DESTEP:T`.

### Een edge toevoegen

Voeg aan `edges` toe, met bestaande node-ID's:

```json
{
  "id": "demo-edge-nieuw",
  "source": "demo-signaal-d",
  "target": "C_EXPRESSIVE",
  "type": "part_of",
  "strength": 0.8,
  "label": "is onderdeel van"
}
```

`id`, `source`, `target` en `type` zijn verplicht. Dit voorbeeld verbindt de hierboven toegevoegde demonode met de bestaande cluster `C_EXPRESSIVE`. `strength` ligt tussen 0 en 1, is standaard `0.5` en telt als gewicht mee bij het berekenen van de layout. De zichtbare lijndikte hangt af van de selectie en de kaartweergave. `label` is optioneel. Bij een ontbrekend label verschijnt de Nederlandse relatienaam. In het detailpaneel staat of een verbinding inkomend of uitgaand is en welke node aan de andere kant ligt.

Relatietypes: `supports`, `contradicts`, `example_of`, `relates_to`, `driven_by`, `indicates_need`, `leads_to`, `countertrend_of`, `part_of`, `changed_my_view`.

Meerdere relaties tussen hetzelfde paar nodes zijn toegestaan. Ze kunnen op het canvas over elkaar vallen; het detailpanel toont ze afzonderlijk.

### Een guided tour toevoegen

Voeg in `src/data/tours.json` een object toe aan de `tours`-array binnen `{ "meta": { ... }, "tours": [ ... ] }`. De eerdere losse array wordt ook ondersteund. Tourmetadata en optionele `description` blijven behouden. Een tour kan met `nextTourId`, `nextTourLabel` en `nextTourDescription` een expliciete vervolgroute aanbieden:

```json
{
  "id": "demo-extra-route",
  "title": "Demo · Extra route",
  "intro": {
    "title": "Welkom bij deze route",
    "text": "Deze tekst verschijnt voordat de lezer de eerste stap opent."
  },
  "nextTourId": "signal-to-opportunity",
  "nextTourLabel": "Ga door naar het vervolg",
  "nextTourDescription": "Een korte uitleg over de volgende route.",
  "steps": [
    {
      "nodeId": "S12",
      "title": "Demo · Beginpunt",
      "text": "DEMO — Uitleg bij deze stap.",
      "phase": "Oriëntatie"
    }
  ]
}
```

Op het startscherm opent `Volg mijn reis` de aanbevolen route *Van techniek naar regie*. In de zijbalk opent dezelfde knop de routekeuze met titels, het aantal stappen en de voortgang. Elke route heeft minimaal één stap. Een optionele `intro` verschijnt vóór de eerste stap en `phase` geeft de fase aan.

Met `Vorige` en `Volgende` ga je naar de bijbehorende node. Het routepaneel toont `step.text`. In het detailpaneel lees je de analyse en bronnen. Op mobiel opent `Bekijk analyse en bronnen` die verdieping. Als je doorklikt naar een andere node, brengt `Terug naar tour` je terug naar dezelfde stap.

Vanuit de laatste stap van `main-story` kun je door naar `from-trends-to-options`. Na `Afronden` op die vervolgroute verschijnt een overzicht van de drie kansrichtingen. Per route bewaart `localStorage` de voortgang onder `trendbreinTourProgress:v1`. Via de routekeuze kun je een route hervatten of de voortgang resetten.

### Validatie en uitbreiden

Zod controleert types, verplichte velden, getallen, bron-URL's en kalenderdatums. Aanvullend worden dubbele node-, edge- en tour-ID's en ontbrekende edge-, tour-, evidence-, matrix- en Kanscheckreferenties gecontroleerd. Ongeldige inhoud levert een leesbaar foutscherm met paden naar de fout op. Een JSON-syntaxfout wordt al door Vite gemeld bij development of build.

Voeg nieuwe node-/edge-types toe in `src/types/graph.ts`. Voeg daarbij een categoriestijl of relatienaam toe in `src/graph/graphStyles.ts`; TypeScript helpt ontbrekende configuratie te vinden. Er hoeft geen inhoud in componenten te worden toegevoegd.

## Bediening en vormgeving

- Sleep de kaart om te pannen, scroll of gebruik de knoppen om te zoomen. De passend-in-beeld-knop herstelt de camera naar de volledige dataset.
- Hover benadrukt de directe buurt; klikken houdt een selectie vast en opent het rechterpanel. Alleen relevante relatielabels worden getoond.
- Zoek op titel of tag. De nodelijst en de verbonden-nodeknoppen bieden ook toetsenbordnavigatie zonder canvasinteractie.
- Zoeken herkent ook interne node-ID's, zichtbare S-ID's en aliases. Gestructureerde verwijzingen in analyses zijn inline klikbaar en staan daarnaast onder `Genoemde nodes`.
- `Onderzoeksmodus` toont de ruwe status, confidence met uitleg, sourceType, tags, relatietype, node-ID en datasetversie. Deze modus staat standaard uit.
- `Kern` is de rustige standaardweergave: alle data blijft aanwezig, terwijl hoofdonderdelen visueel voorrang krijgen. `Alles` geeft detailnodes meer nadruk. Hover, selectie en ver inzoomen maken detailnodelabels zichtbaar.
- Nodes met `evidenceRefs` of `counterEvidenceRefs` tonen die als klikbare bewijsblokken. Bij bewust zwakke DESTEP-dimensies blijft de aangeleverde evidence-note zichtbaar.
- De algoritmische hoofdtrend toont aanbevelingen en pricing als twee afzonderlijke, klikbare takken. Beide takken tonen hun eigen bewijs; de hoofdtrend toont ook de gekoppelde tegentrend.
- Shortlistnodes tonen hun gekoppelde trend, waardeverschuiving en het aangeleverde blok `Waarom deze richting bleef staan`.
- De AI-scenariomatrix is zichtbaar in de bezoekersweergave. Schakel `Onderzoeksmodus` in om bij de drie verkende voorbeelden de Kanscheck met bestaande oplossingen en voorgestelde toetsen te lezen.
- Alle categorieën hebben een eigen kleur en basisgrootte in `graphStyles.ts`. `importance` geeft extra gewicht. Selectie krijgt een subtiele lichtende ring.
- De UI-basiskleuren staan bij `:root` in `styles.css`, de graphkleuren in `graphStyles.ts`; dit is een voorlopig palet. CSS verzorgt sterren, ornamenten en overgangen zonder extra animatiebibliotheek. De voorkeur voor minder beweging wordt gerespecteerd.
- Op een smal scherm zitten zoeken en lagen achter een knop. Tijdens tours opent de verdieping als dialoog via `Bekijk analyse en bronnen`. In `Kern` blijven de drie shortlist-richtingen via een compacte, aanklikbare lijst herkenbaar. Voor de prettigste volledige ervaring is een laptop of groter scherm aanbevolen.
- Lettertypen worden via Google Fonts geladen met lokale systeemfonts als fallback. Voor volledig offline gebruik kun je de import bovenaan `styles.css` verwijderen of de fonts zelf hosten.

## Technische keuzes en grenzen van v0.9.1

- `MultiDirectedGraph` bewaart richting en meerdere betekenissen tussen hetzelfde paar nodes.
- Een deterministische spiraal geeft alle nodes een geldige startpositie. ForceAtlas2 rekent eenmalig 260 iteraties uit met overlappreventie; de kaart blijft daarna rustig. Dit is gecontroleerd met de huidige 152 nodes en 346 edges. Bij honderden/duizenden nodes moet deze berekening naar een worker en zijn aparte performancetests nodig.
- De Sigma-instantie wordt één keer per gemounte kaart aangemaakt en bij unmount opgeruimd; selectie en filters werken via reducers. Er is geen voortdurend draaiende layout.
- De permanente `baseSize` van iedere node blijft onveranderd. Selectie en tours berekenen tijdelijke rendergroottes telkens opnieuw, zodat routewissels geen groottegroei kunnen opstapelen.
- Node-onderscheid gebruikt kleur plus grootte en tekst, zonder custom WebGL-vormprogramma's. Dit houdt de basis eenvoudig uitbreidbaar.
- De ingebouwde Node-testrunner met `tsx` test de data en layout zonder extra browser- of UI-testserver.
- Een lege dataset is toegestaan. Ontbrekende WebGL geeft een zichtbare melding; de nodelijst en details blijven beschikbaar.
- De adresbalk bevat tijdens een route een deelbare link naar de actieve stap. *Van één signaal naar een kans* gebruikt `route` en `node`. De andere routes gebruiken `route` en `stap`. De voortgang wordt lokaal bewaard. Na herladen gebruikt de vrije kaart de standaardinstellingen.

## Statisch publiceren, bijvoorbeeld GitHub Pages

`npm run build` maakt `dist/`. Publiceer de **inhoud van dist**, inclusief `assets/` en `favicon.svg`, bij je statische host. Upload niet `src/` als website.

Vite gebruikt `base: './'`, zodat de bestanden ook vanuit het subpad van deze repository werken. GitHub Pages bouwt en publiceert de site via `.github/workflows/deploy-pages.yml` bij pushes naar `main`. [Open de gepubliceerde site](https://hugodiepugo.github.io/TrendBrein/)

## Validatie van deze versie

De 24 tests controleren onder meer datasetvelden, zoekresultaten, bronverwijzingen, matrix- en Kanscheckdata en kaartlayout. Ze controleren ook de zeven oorspronkelijke stappen, de modeluitwerkingen in de nodetekst, oude en nieuwe links naar routestappen en het hervatten van opgeslagen voortgang.

De kaart gebruikt Sigma.js 3 en de ForceAtlas2-layout van Graphology. [Levenscyclus van Sigma.js 3](https://v3.sigmajs.org/docs/advanced/lifecycle/) · [Camera in Sigma.js 3](https://v3.sigmajs.org/docs/typedoc/sigma/src/classes/Camera/) · [Graphology ForceAtlas2](https://graphology.github.io/standard-library/layout-forceatlas2.html)

## Integratie van de werkdataset

De graph behoudt alle nodes en edges. `graph.meta.graphPresentation` bepaalt de standaardpreset en labelprioriteiten. Het uitgezoomde overzicht geeft hoofdtrends, reflecties, geselecteerde waardeverschuivingen, scenario's en de shortlist voorrang; bij inzoomen volgen detailnodelabels. Selectie en hover benadrukken de directe buurt. Canvaslabels gebruiken zo nodig een visuele ellipsis; JSON, zoekresultaten en details behouden de volledige titel. Bij drukke nodes verschijnen relatielabels pas ingezoomd en blijven alle relaties altijd in het detailpanel beschikbaar. Dit verandert geen inhoud of onderzoeksgewicht.

De integriteitstests vergelijken de aangeleverde nodevelden, verbindingen, metadata en tourstappen met de ingelezen dataset. Ze controleren beide eindpunten van alle 346 verbindingen en de berekende kaartcoördinaten. Herladen begint een nieuwe kaartselectie. Eerder opgeslagen routevoortgang kun je wissen via `Reset tourvoortgang`.
