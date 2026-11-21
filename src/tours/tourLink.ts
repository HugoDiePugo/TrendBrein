import type { Tour } from "../types/graph";

// Handin links use one-based step numbers, just like the tour navigation.
export function readTourLink(search: string, tours: Tour[]) {
  const params = new URLSearchParams(search);
  const tour = tours.find((item) => item.id === params.get("route"));
  if (!tour) return undefined;
  const value = params.get("stap");
  const number = value && /^[1-9]\d*$/.test(value) ? Number(value) : 0;
  const index = number >= 1 && number <= tour.steps.length ? number - 1 : null;
  return { tour, index: index ?? (tour.intro ? null : 0) };
}
