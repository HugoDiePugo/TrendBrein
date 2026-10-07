import type { Tour } from "../types/graph";

export const TOUR_PROGRESS_STORAGE_KEY = "trendbreinTourProgress:v1";

export type TourProgressItem = {
  currentStep: number;
  started: boolean;
  completed: boolean;
};

export type TourProgress = Record<string, TourProgressItem>;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function clampStep(value: unknown, totalSteps: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) return 0;
  return Math.min(Math.max(value, 0), Math.max(totalSteps - 1, 0));
}

export function readTourProgress(
  tours: Tour[],
  storage: StorageLike | undefined = typeof window === "undefined"
    ? undefined
    : window.localStorage,
): TourProgress {
  if (!storage) return {};
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(TOUR_PROGRESS_STORAGE_KEY) ?? "{}",
    );
    if (!isRecord(parsed)) return {};

    return tours.reduce<TourProgress>((progress, tour) => {
      const entry = parsed[tour.id];
      if (!isRecord(entry)) return progress;
      const started = entry.started === true || entry.completed === true;
      if (!started) return progress;
      progress[tour.id] = {
        currentStep: clampStep(entry.currentStep, tour.steps.length),
        started,
        completed: entry.completed === true,
      };
      return progress;
    }, {});
  } catch {
    return {};
  }
}

export function writeTourProgress(
  progress: TourProgress,
  storage: StorageLike | undefined = typeof window === "undefined"
    ? undefined
    : window.localStorage,
) {
  if (!storage) return;
  try {
    storage.setItem(TOUR_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is a convenience; unavailable browser storage must not block tours.
  }
}

export function progressAtStep(
  progress: TourProgress,
  tour: Tour,
  step: number,
): TourProgress {
  return {
    ...progress,
    [tour.id]: {
      currentStep: clampStep(step, tour.steps.length),
      started: true,
      completed: false,
    },
  };
}

export function completeTour(progress: TourProgress, tour: Tour): TourProgress {
  return {
    ...progress,
    [tour.id]: {
      currentStep: Math.max(tour.steps.length - 1, 0),
      started: true,
      completed: true,
    },
  };
}

export function tourActionLabel(progress: TourProgressItem | undefined) {
  if (progress?.completed) return "Bekijk opnieuw";
  if (progress?.started) return "Hervat tour";
  return "Start tour";
}
