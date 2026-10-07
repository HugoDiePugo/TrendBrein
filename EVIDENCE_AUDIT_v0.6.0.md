# Evidence & polish audit — Trendbrein v0.6.0

## Bronmetadata
Bronnodes totaal: 70
Lege `date` velden na v0.6: 0
Bronnen met `z.d.`: 46

`z.d.` is bewust gebruikt wanneer de publicatiedatum niet betrouwbaar uit de beschikbare bron kon worden vastgesteld.
Externe URL-bronnen hebben een `accessedDate` gekregen.

Exact geverifieerde kernupdates:
- S04: 2026-09-17
- S38: campagne gestart 2024-09-10
- S39: campagne gestart 2026-02-10
- S41: NIST-publicatie 2024-07-26
- S47: campagne gestart 2026-04-28
- S37: FTC-publicatie 2025-01-17
- S52: documentdatum DSA 2022-10-19
- S55: OECD-publicatie 2025-10-03

## DESTEP
Drivers met directe evidenceRefs: 15
Drivers bewust zonder directe evidenceRefs: 3

Bewust zwak zonder sterke directe bron:
- D_EXP_DEMO
- D_EXP_ECO
- D_ALGO_ECO

Dat is geen ontbrekende datafout; deze dimensies worden juist als zwak gepresenteerd.

## Algoritmische hoofdtrend
Toegevoegd:
- C_ALGO_RECOMMEND
- C_ALGO_PRICING

Daarmee worden recommendations/selectie en pricing/commerciële personalisatie analytisch uit elkaar gehouden.

## UX-metadata
Toegevoegd:
- aanbevolen entry route;
- Kern/Alles presets;
- level-of-detail labelregels;
- tour/detail rolverdeling.

## Taal
Gerichte herziening van:
- T_EXPRESSIVE
- T_AI_TRUST
- T_ALGO_PERSONAL
- VS_CAPABILITY_TRUST
- VS_HIDDEN_CONTROL

Doel: minder glad/formeler, meer Hugo, zonder schoolmodellen weg te poetsen.
