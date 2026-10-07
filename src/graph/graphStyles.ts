import type { NodeType } from "../types/graph";
// Alle graphkleuren en categoriebehandelingen zijn hier configureerbaar.
export const palette = {
  background: "#080d12",
  edge: "#35434e",
  dimmedEdge: "#19232c",
  muted: "#25313a",
  active: "#d4e7db",
  text: "#a8bac7",
};
export const categories: Record<
  NodeType,
  { label: string; color: string; size: number }
> = {
  signal: { label: "Signaal", color: "#93b8bc", size: 5 },
  evidence: { label: "Bron / bewijs", color: "#8b9bb4", size: 4 },
  cluster: { label: "Cluster", color: "#b3bda2", size: 9 },
  trend: { label: "Trend", color: "#c8d9b1", size: 12 },
  value: { label: "Waarde / behoefte", color: "#b5a6c9", size: 7 },
  driver: { label: "DESTEP-driver", color: "#b8a98d", size: 7 },
  value_shift: { label: "Waardeverschuiving", color: "#c79ba8", size: 7 },
  countertrend: { label: "Tegentrend", color: "#c88f82", size: 8 },
  scenario: { label: "Scenario", color: "#89a6c4", size: 9 },
  opportunity: { label: "Kans / idee", color: "#a8c7ae", size: 10 },
  reflection: { label: "Reflectie", color: "#d4c39e", size: 6 },
};
export const relationLabels = {
  supports: "ondersteunt",
  contradicts: "spreekt tegen",
  example_of: "is een voorbeeld van",
  relates_to: "hangt samen met",
  driven_by: "wordt gedreven door",
  indicates_need: "wijst op behoefte",
  leads_to: "leidt tot",
  countertrend_of: "is een tegentrend van",
  part_of: "is onderdeel van",
  changed_my_view: "veranderde mijn kijk op",
};
