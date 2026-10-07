# Trendbrein · appversie 0.8.1

Een statische React/TypeScript-app waarin een Sigma.js-kaart de hoofdinterface is. De ongewijzigde v0.8.0-dataset bevat **152 nodes, 346 verbindingen en zes tours met samen 61 stappen**. De app ondersteunt de bijbehorende bronmetadata, selectieargumentatie, tourhandoff en lokaal opgeslagen tourvoortgang. De versie in Onderzoeksmodus komt rechtstreeks uit `graph.meta.version`. Zie ook `src/data/DATASET_NOTES.md`, `CHANGELOG_v0.8.1.md`, `CHANGELOG_v0.8.0.md` en de historische audit `EVIDENCE_AUDIT_v0.6.0.md`.

## Installatie en starten

Gebruik Node.js 22 LTS of nieuwer en npm. De eerste versie is ook getest met de lokaal aanwezige Node.js 18.16.

```sh
npm ci
npm run dev
```

Open de lokale URL die Vite toont, standaard http://127.0.0.1:5173. De ontwikkelserver luistert alleen op localhost.

```sh
npm test          # negentien controles op data, graph-opbouw en tourvoortgang
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

Beschikbare types: `signal`, `evidence`, `cluster`, `trend`, `value`, `driver`, `value_shift`, `countertrend`, `scenario`, `opportunity`, `reflection`. Een driver kan later bijvoorbeeld een DESTEP-tag krijgen; de demo doet geen inhoudelijke uitspraken daarover.

### Een edge toevoegen

Voeg aan `edges` toe, met bestaande node-ID's:

```json
{
  "id": "demo-edge-nieuw",
  "source": "demo-signaal-d",
  "target": "demo-6",
  "type": "part_of",
  "strength": 0.8,
  "label": "is onderdeel van"
}
```

`id`, `source`, `target` en `type` zijn verplicht. `strength` ligt tussen 0 en 1, met standaard `0.5`, en beïnvloedt lijndikte en aantrekkingskracht in de layout. `label` is optioneel; zonder label wordt de centrale Nederlandse relatienaam gebruikt. De richting loopt van source naar target. Het detailpanel vermeldt zowel richting als bron- en doelnode, zodat inkomende relaties niet verkeerd gelezen worden.

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
    "text": "Deze korte inleiding verschijnt voordat de eerste node wordt geselecteerd."
  },
  "nextTourId": "demo-vervolgroute",
  "nextTourLabel": "Ga door naar het vervolg",
  "nextTourDescription": "Een korte uitleg over de volgende route.",
  "steps": [
    {
      "nodeId": "demo-0",
      "title": "Demo · Beginpunt",
      "text": "DEMO — Uitleg bij deze stap.",
      "phase": "Oriëntatie"
    }
  ]
}
```

Elke tour heeft minimaal één stap. Bij meerdere tours opent `Volg mijn reis` eerst een routekeuze met titel, description, aantal stappen en voortgang. De aanbevolen ingang start rechtstreeks `main-story`. Een optionele `intro` verschijnt vóór de eerste stap, zonder nodefocus; `phase` groepeert stappen subtiel in het routepaneel. Vorige/volgende selecteert de bijbehorende node en centreert de camera. De persoonlijke `step.text` staat in het routepaneel, terwijl het detailpaneel de analyse en bronnen toont. Vanuit een tour mag je andere nodes openen: de actieve route en stap blijven bestaan, met `Terug naar tour` als directe terugkeeractie. Op mobiel opent `Bekijk verdieping` dezelfde inhoud in een dialoog en keert sluiten terug naar dezelfde tourstap. De laatste stap kan een primaire vervolgknop tonen; in v0.8.0 leidt `main-story` daarmee rechtstreeks naar `from-trends-to-options`. Afronden markeert de route als voltooid. Voortgang wordt per tour opgeslagen in `localStorage` onder `trendbreinTourProgress:v1`; onvoltooide routes tonen `Hervat tour` na herladen. De sluitknop verlaat alleen de actieve route, zonder opgeslagen voortgang te verwijderen. Pan en zoom blijven beschikbaar.

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
- De AI-scenarioanalyse toont een interactieve 2×2-matrix. Opportunity-nodes bevatten een Kanscheck met klikbare bestaande oplossingen en concrete volgende tests.
- Alle categorieën hebben een eigen kleur en basisgrootte in `graphStyles.ts`. `importance` geeft extra gewicht. Selectie krijgt een subtiele lichtende ring.
- De UI-basiskleuren staan bij `:root` in `styles.css`, de graphkleuren in `graphStyles.ts`; dit is een voorlopig palet. CSS verzorgt sterren, ornamenten en overgangen zonder extra animatiebibliotheek. De voorkeur voor minder beweging wordt gerespecteerd.
- Op een smal scherm zitten zoeken en lagen achter een knop. Tijdens tours opent de verdieping als dialoog. In `Kern` blijven de drie shortlist-richtingen via een compacte, aanklikbare lijst herkenbaar.
- Lettertypen worden via Google Fonts geladen met lokale systeemfonts als fallback. Voor volledig offline gebruik kun je de import bovenaan `styles.css` verwijderen of de fonts zelf hosten.

## Technische keuzes en grenzen van v0.8.0

- `MultiDirectedGraph` bewaart richting en meerdere betekenissen tussen hetzelfde paar nodes.
- Een deterministische spiraal geeft alle nodes een geldige startpositie. ForceAtlas2 rekent eenmalig 180 iteraties uit; de kaart blijft daarna rustig. Dit is gecontroleerd met de huidige 152 nodes en 346 edges. Bij honderden/duizenden nodes moet deze berekening naar een worker en zijn aparte performancetests nodig.
- De Sigma-instantie wordt één keer per gemounte kaart aangemaakt en bij unmount opgeruimd; selectie en filters werken via reducers. Er is geen voortdurend draaiende layout.
- De permanente `baseSize` van iedere node blijft onveranderd. Selectie en tours berekenen tijdelijke rendergroottes telkens opnieuw, zodat routewissels geen groottegroei kunnen opstapelen.
- Node-onderscheid gebruikt kleur plus grootte en tekst, zonder custom WebGL-vormprogramma's. Dit houdt de basis eenvoudig uitbreidbaar.
- De ingebouwde Node-testrunner met `tsx` test de data en layout zonder extra browser- of UI-testserver.
- Een lege dataset is toegestaan. Ontbrekende WebGL geeft een zichtbare melding; de nodelijst en details blijven beschikbaar.
- Alleen tourvoortgang wordt lokaal opgeslagen bij herladen; selectie, filters en kaartweergave worden niet opgeslagen. Er is nog geen inhoudseditor, importfunctie of permanente link naar een geselecteerde node.

## Statisch publiceren, bijvoorbeeld GitHub Pages

`npm run build` maakt `dist/`. Publiceer de **inhoud van dist**, inclusief `assets/` en `favicon.svg`, bij je statische host. Upload niet `src/` als website.

Vite gebruikt `base: './'`, zodat assets ook vanuit een GitHub Pages-repositorysubpad werken. Er is geen router en dus geen server-side routefallback nodig. De workflow `.github/workflows/deploy-pages.yml` bouwt en publiceert iedere push naar `main`. De publieke versie staat op https://hugodiepugo.github.io/TrendBrein/.

## Validatie van deze versie

Productiebuild en integriteitstests controleren ongewijzigde datasetvelden, display-ID-zoeken, gestructureerde referenties, matrix- en Kanscheckdata, ontbrekende verwijzingen, ongeldige waarden/bronnen, ongeldige tours, permanente nodegroottes, eindige layoutposities/parallelle relaties en lege/losse nodes. Browsercontrole omvat de kaart, zoeken, filters, selectie, detailnavigatie, Onderzoeksmodus en alle 61 tourstappen.

Technische referenties: [Sigma lifecycle](https://www.sigmajs.org/docs/advanced/lifecycle/), [Sigma camera](https://www.sigmajs.org/docs/typedoc/sigma/src/classes/Camera/), [Graphology ForceAtlas2](https://graphology.github.io/standard-library/layout-forceatlas2.html).

## Integratie van de werkdataset

De graph behoudt alle nodes en edges. `graph.meta.graphPresentation` bepaalt de standaardpreset en labelprioriteiten. Het uitgezoomde overzicht geeft hoofdtrends, reflecties, geselecteerde waardeverschuivingen, scenario's en de shortlist voorrang; bij inzoomen volgen detailnodelabels. Selectie en hover benadrukken de directe buurt. Canvaslabels gebruiken zo nodig een visuele ellipsis; JSON, zoekresultaten en details behouden de volledige titel. Bij drukke nodes verschijnen relatielabels pas ingezoomd en blijven alle relaties altijd in het detailpanel beschikbaar. Dit verandert geen inhoud of onderzoeksgewicht.

De integriteitstests vergelijken alle aangeleverde nodevelden, edges, metadata en tourstappen met het loaderresultaat. Ze controleren ook alle 346 gerichte eindpunten en eindige ForceAtlas2-posities. Bij het vervangen van de dataset tijdens development: herlaad de pagina om eventuele oude selectie- of tourstatus te wissen.
