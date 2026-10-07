# Trendbrein app v0.8.1

Gerichte verbetering van guided-tournavigatie; de v0.8.0-dataset is ongewijzigd.

- Tourstap en geselecteerde node zijn losgekoppeld.
- Tijdelijk andere nodes bekijken behoudt de actieve tour en stap.
- `Terug naar tour` herstelt precies de huidige tournode en tekst.
- Routekeuze toont niet gestart, bezig, hervatbaar en voltooid.
- Tourvoortgang wordt lokaal opgeslagen onder `trendbreinTourProgress:v1`.
- Een afgeronde route wordt pas als voltooid gemarkeerd via `Afronden` of een `nextTourId`-handoff.
- De routeknop staat in een vaste footerzone van de sidebar.
