// Comprehensive Multi-Profile and Backup / Restore Save System for CM1
import { getMissionsProgress, saveMissionsProgress } from './storage';
import { getPlayerXP, getUnlockedTrophies, getStreak } from './gamification';
import { playSound } from './audio';

export interface SaveProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  lastSavedAt: string;
  missions: Record<string, boolean>;
  xp: number;
  streak: number;
  trophies: Record<string, string>;
}

export interface SaveFileFormat {
  version: number;
  appName: string;
  exportedAt: string;
  activeProfileId: string;
  profiles: SaveProfile[];
}

const PROFILES_LIST_KEY = 'toussaint_cm1_profiles_list';
const ACTIVE_PROFILE_KEY = 'toussaint_cm1_active_profile_id';
const DEFAULT_AVATARS = ['🦊', '🐿️', '🦉', '🦌', '🦔', '🦁', '🐻', '🐼', '🐯', '🚀', '🌟', '🎒'];

export const AVAILABLE_AVATARS = DEFAULT_AVATARS;

function createDefaultProfile(): SaveProfile {
  const now = new Date().toISOString();
  return {
    id: 'profile_default',
    name: 'Élève CM1',
    avatar: '🦊',
    createdAt: now,
    lastSavedAt: now,
    missions: getMissionsProgress(),
    xp: getPlayerXP(),
    streak: getStreak(),
    trophies: getUnlockedTrophies(),
  };
}

export function getAllProfiles(): SaveProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_LIST_KEY);
    if (!raw) {
      const defaultProf = createDefaultProfile();
      localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify([defaultProf]));
      localStorage.setItem(ACTIVE_PROFILE_KEY, defaultProf.id);
      return [defaultProf];
    }
    const profiles: SaveProfile[] = JSON.parse(raw);
    return profiles.length > 0 ? profiles : [createDefaultProfile()];
  } catch {
    return [createDefaultProfile()];
  }
}

export function getActiveProfile(): SaveProfile {
  const profiles = getAllProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0];
}

export function saveCurrentStateToActiveProfile(): SaveProfile {
  const profiles = getAllProfiles();
  const active = getActiveProfile();

  const updated: SaveProfile = {
    ...active,
    lastSavedAt: new Date().toISOString(),
    missions: getMissionsProgress(),
    xp: getPlayerXP(),
    streak: getStreak(),
    trophies: getUnlockedTrophies(),
  };

  const updatedProfiles = profiles.map((p) => (p.id === updated.id ? updated : p));
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(updatedProfiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, updated.id);
  } catch {}

  return updated;
}

export function updateActiveProfileDetails(name: string, avatar: string): SaveProfile {
  const active = getActiveProfile();
  active.name = name.trim() || 'Élève CM1';
  active.avatar = avatar;
  active.lastSavedAt = new Date().toISOString();

  const profiles = getAllProfiles().map((p) => (p.id === active.id ? active : p));
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  } catch {}

  return active;
}

export function switchProfile(targetProfileId: string): SaveProfile | null {
  // First persist current state to current profile
  saveCurrentStateToActiveProfile();

  const profiles = getAllProfiles();
  const target = profiles.find((p) => p.id === targetProfileId);
  if (!target) return null;

  // Restore target's state into active localStorage keys
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, target.id);
    localStorage.setItem('toussaint_cm1_progress', JSON.stringify(target.missions || {}));
    localStorage.setItem('toussaint_cm1_xp', (target.xp || 0).toString());
    localStorage.setItem('toussaint_cm1_streak', (target.streak || 1).toString());
    localStorage.setItem('toussaint_cm1_trophies', JSON.stringify(target.trophies || {}));
  } catch {}

  return target;
}

export function createNewProfile(name: string, avatar: string): SaveProfile {
  // Save current active profile first
  saveCurrentStateToActiveProfile();

  const now = new Date().toISOString();
  const newProfile: SaveProfile = {
    id: 'prof_' + Date.now(),
    name: name.trim() || `Élève ${getAllProfiles().length + 1}`,
    avatar: avatar || '🐿️',
    createdAt: now,
    lastSavedAt: now,
    missions: {},
    xp: 0,
    streak: 1,
    trophies: {},
  };

  const profiles = [...getAllProfiles(), newProfile];
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  } catch {}

  // Switch to new profile
  switchProfile(newProfile.id);
  return newProfile;
}

export function deleteProfile(profileId: string): boolean {
  const profiles = getAllProfiles();
  if (profiles.length <= 1) return false; // Don't delete last profile

  const remaining = profiles.filter((p) => p.id !== profileId);
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(remaining));
    if (localStorage.getItem(ACTIVE_PROFILE_KEY) === profileId) {
      switchProfile(remaining[0].id);
    }
  } catch {}

  return true;
}

// ----------------------------------------------------
// EXPORT & IMPORT (JSON File and Text Code)
// ----------------------------------------------------

export function generateExportData(): SaveFileFormat {
  saveCurrentStateToActiveProfile();
  return {
    version: 1,
    appName: 'Les vacances de la Toussaint - CM1',
    exportedAt: new Date().toISOString(),
    activeProfileId: getActiveProfile().id,
    profiles: getAllProfiles(),
  };
}

export function downloadSaveFile(): void {
  const data = generateExportData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const dateTag = new Date().toISOString().slice(0, 10);
  const profileName = getActiveProfile().name.replace(/\s+/g, '_');
  link.download = `sauvegarde_toussaint_cm1_${profileName}_${dateTag}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsCode(): string {
  const data = generateExportData();
  const jsonStr = JSON.stringify(data);
  try {
    return btoa(encodeURIComponent(jsonStr));
  } catch {
    return jsonStr;
  }
}

export function importFromJSONString(jsonStr: string): { success: boolean; error?: string } {
  try {
    const parsed: SaveFileFormat = JSON.parse(jsonStr);
    if (!parsed.profiles || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return { success: false, error: 'Format de fichier de sauvegarde non reconnu.' };
    }

    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(parsed.profiles));
    const targetId = parsed.activeProfileId || parsed.profiles[0].id;
    switchProfile(targetId);

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Erreur lors de la lecture du fichier JSON.' };
  }
}

export function importFromCode(code: string): { success: boolean; error?: string } {
  const clean = code.trim();
  if (!clean) return { success: false, error: 'Le code fourni est vide.' };

  try {
    let jsonStr: string;
    try {
      jsonStr = decodeURIComponent(atob(clean));
    } catch {
      jsonStr = clean;
    }
    return importFromJSONString(jsonStr);
  } catch {
    return { success: false, error: 'Le code de sauvegarde est invalide ou corrompu.' };
  }
}
