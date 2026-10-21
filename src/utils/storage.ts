// LocalStorage persistence for missions and module progress

const STORAGE_KEY = 'toussaint_cm1_progress';

export type MissionId =
  | 'autodictee1'
  | 'conjugaison'
  | 'histoire1'
  | 'histoire2'
  | 'geo1'
  | 'geo2'
  | 'tables'
  | 'multiplier';

export const ALL_MISSIONS: MissionId[] = [
  'autodictee1',
  'conjugaison',
  'histoire1',
  'histoire2',
  'geo1',
  'geo2',
  'tables',
  'multiplier',
];

export function getMissionsProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveMissionsProgress(progress: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

export function setMissionCompleted(id: MissionId, isCompleted = true): void {
  const current = getMissionsProgress();
  current[id] = isCompleted;
  saveMissionsProgress(current);
}

export function toggleMissionProgress(id: MissionId): Record<string, boolean> {
  const current = getMissionsProgress();
  current[id] = !current[id];
  saveMissionsProgress(current);
  return current;
}

export function resetAllMissionsProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}
