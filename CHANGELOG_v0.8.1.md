# Trendbrein app v0.8.1

Gerichte verbetering van guided-tournavigatie; de v0.8.0-dataset is ongewijzigd.

- Tourstap en geselecteerde node zijn losgekoppeld.
- Tijdelijk andere nodes bekijken behoudt de actieve tour en stap.
- `Terug naar tour` herstelt precies de huidige tournode en tekst.
- Routekeuze toont niet gestart, bezig, hervatbaar en voltooid.
- Tourvoortgang wordt lokaal opgeslagen onder `trendbreinTourProgress:v1`.
- Een afgeronde route wordt pas als voltooid gemarkeerd via `Afronden` of een `nextTourId`-handoff.
- De routeknop staat in een vaste footerzone van de sidebar.

Latere UX-polish binnen dezelfde appversie:

- Gewone leestekst in tours, detailpanelen en de sidebar is vergroot met ruimere regelafstand; de donkere vormgeving bleef behouden.
- Tijdens een actieve tour toont de kaart alleen de actieve node en directe relaties, zonder overlappende canvaslabels.
- De linkerzijbalk is tijdens tours en vrij verkennen inklapbaar.
- Mobiel gebruikt een duidelijkere knop `Bekijk analyse en bronnen`.
- Na de aanbevolen hoofdroute verschijnt een afsluitend persoonlijk overzicht met de drie kansrichtingen.
- Vrij verkennen legt kort uit dat de kaart een overzicht van verbanden is en dat details via nodes beschikbaar zijn.
