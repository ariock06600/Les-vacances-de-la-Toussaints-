// Gamification System: XP, Levels, Streaks, and Trophies for CM1
import { playSound } from './audio';
import { fireConfetti, fireGrandCelebration } from './confetti';

export interface Trophy {
  id: string;
  title: string;
  category: 'Général' | 'Français' | 'Histoire' | 'Géographie' | 'Maths';
  tier: 'bronze' | 'argent' | 'or' | 'legendaire';
  icon: string;
  description: string;
  hint: string;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

export interface PlayerStats {
  xp: number;
  level: number;
  levelTitle: string;
  levelMascot: string;
  nextLevelXP: number;
  currentLevelBaseXP: number;
  streak: number;
  unlockedTrophiesCount: number;
  totalTrophiesCount: number;
}

const XP_STORAGE_KEY = 'toussaint_cm1_xp';
const TROPHIES_STORAGE_KEY = 'toussaint_cm1_trophies';
const STREAK_STORAGE_KEY = 'toussaint_cm1_streak';

export const TROPHIES_CATALOG: Omit<Trophy, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'premier_pas',
    title: 'Premier Pas d’Automne',
    category: 'Général',
    tier: 'bronze',
    icon: '🍂',
    description: 'Tu as complété ta toute première mission du cahier !',
    hint: 'Termine ou coche une première mission sur le tableau de bord.',
    points: 50,
  },
  {
    id: 'champion_toussaint',
    title: 'Grand Champion de la Toussaint',
    category: 'Général',
    tier: 'legendaire',
    icon: '👑',
    description: 'Incroyable ! Tu as terminé toutes les 10 grandes missions de révision.',
    hint: 'Valide les 10 missions du programme de la Toussaint.',
    points: 300,
  },
  {
    id: 'plume_or',
    title: 'Plume d’Or & Mots Doux',
    category: 'Français',
    tier: 'or',
    icon: '🪶',
    description: 'Autodictée n°1 réussie avec brio et soin !',
    hint: 'Recopie sans faute ou réussis la dictée de l’autodictée.',
    points: 150,
  },
  {
    id: 'oreille_or',
    title: 'Oreille Attentive',
    category: 'Français',
    tier: 'bronze',
    icon: '🎧',
    description: 'Tu as écouté la lecture audio du texte de Claude Ponti.',
    hint: 'Lance la lecture audio dans l’autodictée n°1.',
    points: 30,
  },
  {
    id: 'maitre_verbes',
    title: 'Maître du Présent',
    category: 'Français',
    tier: 'or',
    icon: '⚡',
    description: 'Score parfait au grand quiz de conjugaison des 11 verbes CM1 !',
    hint: 'Réussis le quiz ou le marathon de conjugaison.',
    points: 150,
  },
  {
    id: 'as_dictionnaire',
    title: 'As du Dictionnaire',
    category: 'Français',
    tier: 'or',
    icon: '📖',
    description: 'Tu maîtrises l’ordre alphabétique, les mots-repères et les 11 abréviations !',
    hint: 'Réussis les exercices sur la leçon du dictionnaire.',
    points: 150,
  },
  {
    id: 'guerrier_gaulois',
    title: 'Héritier des Celtes & Gaulois',
    category: 'Histoire',
    tier: 'or',
    icon: '🏺',
    description: 'Tu connais parfaitement le peuplement de la Gaule, les Celtes, les Grecs et leurs 4 talents !',
    hint: 'Termine les 4 exercices de la leçon sur les Populations de la Gaule.',
    points: 150,
  },
  {
    id: 'heros_alesia',
    title: 'Vainqueur d’Alésia',
    category: 'Histoire',
    tier: 'or',
    icon: '⚔️',
    description: 'Tu maîtrises l’affrontement entre Jules César et Vercingétorix en 52 av. J.-C.',
    hint: 'Termine les 4 exercices de la Conquête de la Gaule.',
    points: 150,
  },
  {
    id: 'historien_antiquite',
    title: 'Grand Historien de l’Antiquité',
    category: 'Histoire',
    tier: 'legendaire',
    icon: '🏛️',
    description: 'Félicitations ! Tu es désormais incollable sur l’Antiquité en Gaule.',
    hint: 'Termine les 2 leçons d’Histoire (Populations & Conquête).',
    points: 250,
  },
  {
    id: 'globe_trotter',
    title: 'Explorateur des Continents',
    category: 'Géographie',
    tier: 'argent',
    icon: '🌍',
    description: 'Tu connais les habitudes alimentaires des 5 continents sur le bout des doigts.',
    hint: 'Explore la carte et réussis les exercices de Géo Leçon 1.',
    points: 100,
  },
  {
    id: 'detective_assiette',
    title: 'Détective de l’Assiette',
    category: 'Géographie',
    tier: 'argent',
    icon: '🍎',
    description: 'Tu sais décrypter les étiquettes et retracer le voyage de nos aliments.',
    hint: 'Termine les 6 défis de Géo Leçon 2.',
    points: 100,
  },
  {
    id: 'eclair_pythagore',
    title: 'Éclair de Pythagore',
    category: 'Maths',
    tier: 'or',
    icon: '⚡',
    description: 'Tu as dompté les tables de multiplication à la vitesse de l’éclair !',
    hint: 'Gagne un sprint ou réussis une série sans faute sur les tables.',
    points: 150,
  },
  {
    id: 'seigneur_zeros',
    title: 'Seigneur des Zéros',
    category: 'Maths',
    tier: 'or',
    icon: '🪄',
    description: 'Multiplier par 10, 100 ou 1000 n’a plus aucun secret pour toi !',
    hint: 'Maîtrise le décalage magique et trouve les facteurs mystères.',
    points: 150,
  },
  {
    id: 'maitre_angles',
    title: 'Maître des Angles & de l’Équerre',
    category: 'Maths',
    tier: 'or',
    icon: '📐',
    description: 'Tu sais reconnaître au premier coup d’œil les angles droits, aigus et obtus !',
    hint: 'Termine les 4 exercices de géométrie sur les angles.',
    points: 150,
  },
  {
    id: 'serie_feu',
    title: 'Flamme de l’Assiduité',
    category: 'Général',
    tier: 'argent',
    icon: '🔥',
    description: 'Une série remarquable de 5 réussites consécutives !',
    hint: 'Enchaîne 5 réussites sans aucune erreur dans n’importe quel module.',
    points: 75,
  },
  {
    id: 'savant_foret',
    title: 'Grand Hibou Savant',
    category: 'Général',
    tier: 'legendaire',
    icon: '🦉',
    description: 'Tu as atteint le niveau 4 de sagesse en accumulant 700 XP.',
    hint: 'Continue de t’entraîner pour accumuler 700 XP.',
    points: 250,
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  mascot: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Écureuil Curieux', mascot: '🐿️', minXP: 0, maxXP: 150 },
  { level: 2, title: 'Hérisson Malin', mascot: '🦔', minXP: 150, maxXP: 350 },
  { level: 3, title: 'Renard Astucieux', mascot: '🦊', minXP: 350, maxXP: 700 },
  { level: 4, title: 'Hibou Sage', mascot: '🦉', minXP: 700, maxXP: 1200 },
  { level: 5, title: 'Cerf Majestueux', mascot: '🦌', minXP: 1200, maxXP: 2500 },
];

export function getPlayerXP(): number {
  try {
    const val = localStorage.getItem(XP_STORAGE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function getPlayerLevelInfo(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getUnlockedTrophies(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TROPHIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAllTrophiesWithStatus(): Trophy[] {
  const unlockedMap = getUnlockedTrophies();
  return TROPHIES_CATALOG.map((item) => ({
    ...item,
    unlocked: !!unlockedMap[item.id],
    unlockedAt: unlockedMap[item.id] || undefined,
  }));
}

export function getPlayerStats(): PlayerStats {
  const xp = getPlayerXP();
  const levelInfo = getPlayerLevelInfo(xp);
  const unlocked = getUnlockedTrophies();
  const streak = getStreak();

  return {
    xp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    levelMascot: levelInfo.mascot,
    nextLevelXP: levelInfo.maxXP,
    currentLevelBaseXP: levelInfo.minXP,
    streak,
    unlockedTrophiesCount: Object.keys(unlocked).length,
    totalTrophiesCount: TROPHIES_CATALOG.length,
  };
}

// XP Notification callback listeners
type XPListener = (info: { amount: number; reason: string; totalXP: number; leveledUp: boolean; newLevel?: LevelInfo }) => void;
type TrophyListener = (trophy: Trophy) => void;

const xpListeners: XPListener[] = [];
const trophyListeners: TrophyListener[] = [];

export function subscribeToXP(listener: XPListener): () => void {
  xpListeners.push(listener);
  return () => {
    const idx = xpListeners.indexOf(listener);
    if (idx !== -1) xpListeners.splice(idx, 1);
  };
}

export function subscribeToTrophy(listener: TrophyListener): () => void {
  trophyListeners.push(listener);
  return () => {
    const idx = trophyListeners.indexOf(listener);
    if (idx !== -1) trophyListeners.splice(idx, 1);
  };
}

export function addXP(amount: number, reason: string): { newXP: number; leveledUp: boolean; newLevel?: LevelInfo } {
  const oldXP = getPlayerXP();
  const oldLevel = getPlayerLevelInfo(oldXP);
  const newXP = oldXP + amount;

  try {
    localStorage.setItem(XP_STORAGE_KEY, newXP.toString());
  } catch {}

  const newLevel = getPlayerLevelInfo(newXP);
  const leveledUp = newLevel.level > oldLevel.level;

  if (leveledUp) {
    playSound('fanfare');
    fireGrandCelebration();
    if (newLevel.level >= 4) {
      unlockTrophy('savant_foret');
    }
  } else {
    playSound('success');
  }

  xpListeners.forEach((l) => l({ amount, reason, totalXP: newXP, leveledUp, newLevel: leveledUp ? newLevel : undefined }));

  return { newXP, leveledUp, newLevel: leveledUp ? newLevel : undefined };
}

export function unlockTrophy(trophyId: string): boolean {
  const unlockedMap = getUnlockedTrophies();
  if (unlockedMap[trophyId]) {
    return false;
  }

  const trophyMeta = TROPHIES_CATALOG.find((t) => t.id === trophyId);
  if (!trophyMeta) return false;

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  unlockedMap[trophyId] = dateStr;
  try {
    localStorage.setItem(TROPHIES_STORAGE_KEY, JSON.stringify(unlockedMap));
  } catch {}

  if (trophyMeta.points > 0) {
    addXP(trophyMeta.points, `Trophée débloqué : ${trophyMeta.title} !`);
  }

  playSound('fanfare');
  fireConfetti({ particleCount: 100, spread: 80 });

  const fullTrophy: Trophy = {
    ...trophyMeta,
    unlocked: true,
    unlockedAt: dateStr,
  };

  trophyListeners.forEach((l) => l(fullTrophy));
  return true;
}

export function getStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    return raw ? parseInt(raw, 10) || 1 : 1;
  } catch {
    return 1;
  }
}

export function incrementStreak(): number {
  const current = getStreak();
  const next = current + 1;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, next.toString());
  } catch {}
  if (next >= 5) {
    unlockTrophy('serie_feu');
  }
  return next;
}

export function resetGamification(): void {
  try {
    localStorage.removeItem(XP_STORAGE_KEY);
    localStorage.removeItem(TROPHIES_STORAGE_KEY);
    localStorage.removeItem(STREAK_STORAGE_KEY);
  } catch {}
}
