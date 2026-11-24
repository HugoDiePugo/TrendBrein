import type { Tour } from "../types/graph";

const methodRoute = "signal-to-opportunity";
// Each numbered link shared with version 0.9.0 should still open its subject.
const previousMethodSteps = [
  "S12",
  "C_EXPRESSIVE",
  "C_EXPRESSIVE",
  "T_EXPRESSIVE",
  "D_SOCIAL_EXPRESSION",
  "VS_FUNCTION_EXPRESS",
  "VS_FUNCTION_EXPRESS",
  "SHORT_01",
];

export function readTourLink(search: string, tours: Tour[]) {
  const params = new URLSearchParams(search);
  const tour = tours.find((item) => item.id === params.get("route"));
  if (!tour) return undefined;
  const value = params.get("stap");
  const number = value && /^[1-9]\d*$/.test(value) ? Number(value) : 0;
  const nodeId =
    params.get("node") ??
    (tour.id === methodRoute ? previousMethodSteps[number - 1] : undefined);
  const index =
    nodeId !== undefined && nodeId !== null
      ? tour.steps.findIndex((step) => step.nodeId === nodeId)
      : number - 1;
  return {
    tour,
    index:
      index >= 0 && index < tour.steps.length ? index : tour.intro ? null : 0,
  };
}

export function writeTourLink(
  params: URLSearchParams,
  tour: Tour | undefined,
  index: number | null,
) {
  params.delete("node");
  params.delete("stap");
  if (!tour) {
    params.delete("route");
    return;
  }
  params.set("route", tour.id);
  if (index === null || !tour.steps[index]) return;
  if (tour.id === methodRoute) params.set("node", tour.steps[index].nodeId);
  else params.set("stap", String(index + 1));
}
