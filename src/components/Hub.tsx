import React from 'react';
import { MissionId, ALL_MISSIONS, resetAllMissionsProgress } from '../utils/storage';
import { playSound } from '../utils/audio';
import { fireConfetti, fireGrandCelebration } from '../utils/confetti';
import { getPlayerStats, unlockTrophy, resetGamification, getAllTrophiesWithStatus } from '../utils/gamification';
import { getActiveProfile } from '../utils/saveSystem';
import { Award, BookOpen, Check, RotateCcw, Sparkles, Flame, Shield, ArrowRight, Compass, Save } from 'lucide-react';

interface HubProps {
  progress: Record<string, boolean>;
  onToggleMission: (id: MissionId) => void;
  onOpenModule: (id: MissionId) => void;
  onResetProgress: () => void;
  onOpenTrophies: () => void;
  onOpenSave: () => void;
}

export const Hub: React.FC<HubProps> = ({
  progress,
  onToggleMission,
  onOpenModule,
  onResetProgress,
  onOpenTrophies,
  onOpenSave,
}) => {
  const completedCount = ALL_MISSIONS.filter((id) => !!progress[id]).length;
  const total = ALL_MISSIONS.length;
  const percent = Math.round((completedCount / total) * 100);

  const stats = getPlayerStats();
  const allTrophies = getAllTrophiesWithStatus();

  // Find next mission recommendation
  const missionOrder: { id: MissionId; label: string; icon: string }[] = [
    { id: 'autodictee1', label: 'Autodictée n°1', icon: '✍️' },
    { id: 'conjugaison', label: 'Conjugaison au Présent', icon: '⚡' },
    { id: 'histoire1', label: 'Les Populations de la Gaule', icon: '🏺' },
    { id: 'histoire2', label: 'La Conquête de la Gaule', icon: '⚔️' },
    { id: 'geo1', label: 'Se nourrir dans le monde', icon: '🌍' },
    { id: 'geo2', label: 'D’où viennent nos aliments ?', icon: '🍎' },
    { id: 'tables', label: 'Les Tables de Multiplication', icon: '🧠' },
    { id: 'multiplier', label: 'Multiplier par 10, 100, 1000', icon: '🪄' },
  ];

  const nextMission = missionOrder.find((m) => !progress[m.id]) || missionOrder[0];

  const handleReset = () => {
    if (window.confirm('Veux-tu vraiment remettre toute ta progression et tes badges à zéro ?')) {
      playSound('error');
      onResetProgress();
      resetGamification();
    }
  };

  const handleToggle = (id: MissionId, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMission(id);
    const willBeDone = !progress[id];
    if (willBeDone) {
      playSound('success');
      fireConfetti({ particleCount: 50, spread: 60 });
      unlockTrophy('premier_pas');
      if (completedCount + 1 === total) {
        unlockTrophy('champion_toussaint');
        fireGrandCelebration();
      }
    } else {
      playSound('click');
    }
  };

  // XP percentage in current level
  const levelXPDiff = stats.nextLevelXP - stats.currentLevelBaseXP;
  const currentXPInLevel = Math.max(0, stats.xp - stats.currentLevelBaseXP);
  const xpPercent = Math.min(100, Math.round((currentXPInLevel / levelXPDiff) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 w-full flex-grow space-y-8 animate-fade-in">
      {/* ======================================================== */}
      {/* EN-TÊTE : HERO & BARRE DE JOUEUR                         */}
      {/* ======================================================== */}
      <header className="text-center relative pt-4 space-y-4">
        {/* Top gamified player status strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* Level Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-amber-300 shadow-sm text-stone-800 text-xs sm:text-sm font-bold">
            <span className="text-2xl animate-bounce">{stats.levelMascot}</span>
            <div className="text-left">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                Niveau {stats.level}
              </span>
              <span className="text-amber-900 font-extrabold">{stats.levelTitle}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border-2 border-orange-200 shadow-sm text-xs sm:text-sm">
            <span className="text-xl">⚡</span>
            <div className="text-left">
              <div className="flex justify-between gap-3 text-[11px] font-black text-stone-600 mb-1">
                <span>{stats.xp} XP</span>
                <span className="text-stone-400">Prochain : {stats.nextLevelXP} XP</span>
              </div>
              <div className="w-28 sm:w-36 bg-orange-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak Flame */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-red-200 shadow-sm text-xs sm:text-sm font-bold text-red-700">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>Série : {stats.streak} {stats.streak > 1 ? 'défis' : 'défi'}</span>
          </div>

          {/* Trophy Room Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenTrophies();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 border-2 border-amber-300 shadow-sm font-black text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            <span className="text-xl">🏆</span>
            <span>Trophées</span>
            <span className="bg-amber-950 text-amber-300 text-xs px-2 py-0.5 rounded-full font-black">
              {stats.unlockedTrophiesCount} / {stats.totalTrophiesCount}
            </span>
          </button>

          {/* Profile & Save Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenSave();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-emerald-300 hover:border-emerald-500 shadow-sm text-xs sm:text-sm font-bold text-emerald-900 transition active:scale-95 cursor-pointer"
            title="Ouvrir le menu de sauvegarde"
          >
            <span className="text-xl">{getActiveProfile().avatar}</span>
            <div className="text-left">
              <span className="text-[10px] text-emerald-700 uppercase tracking-wider block font-black leading-tight">
                {getActiveProfile().name}
              </span>
              <span className="text-stone-500 text-[11px] flex items-center gap-1 font-semibold leading-tight">
                <Save className="w-3 h-3 text-emerald-600" /> Sauvegarde
              </span>
            </div>
          </button>
        </div>

        {/* Titre Principal */}
        <div className="space-y-2 pt-2">
          <h1 className="font-fredoka text-4xl sm:text-5xl md:text-6xl font-black text-[#C85A32] tracking-wide drop-shadow-xs flex items-center justify-center flex-wrap gap-3">
            <span>🍁</span>
            <span>Les vacances de la Toussaint</span>
            <span>🍂</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-medium max-w-2xl mx-auto">
            Cahier interactif de révisions CM1 : relève tous les défis en Français, Histoire, Géographie et Mathématiques pour devenir le Grand Champion ! 🌟
          </p>
        </div>

        {/* Carte de Progression Globale */}
        <section className="bg-white border-2 border-dashed border-orange-200 rounded-3xl p-5 sm:p-6 shadow-sm max-w-2xl mx-auto mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 text-left">
              <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
                {completedCount === 0
                  ? '🐿️'
                  : completedCount < 4
                  ? '🦊'
                  : completedCount < 8
                  ? '🦉'
                  : '👑'}
              </span>
              <div>
                <h2 className="font-fredoka font-bold text-lg sm:text-xl text-stone-900">
                  {completedCount === total
                    ? '🎉 Toutes les missions sont accomplies !'
                    : 'Ta Mission de la Toussaint'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-semibold">
                  {completedCount === total
                    ? 'Tu es un véritable champion de CM1 !'
                    : `Prochaine étape : ${nextMission.icon} ${nextMission.label}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-fredoka text-2xl sm:text-3xl font-black text-orange-600">
                {completedCount} / {total}
              </span>
              <span className="text-[10px] block text-stone-400 font-bold uppercase tracking-wider">
                Missions validées ({percent}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-orange-100 rounded-full h-5 overflow-hidden p-1 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-stone-400">
              💡 Coche les missions au fur et à mesure de tes réussites
            </span>
            <button
              onClick={handleReset}
              className="text-stone-400 hover:text-stone-600 underline transition cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
        </section>
      </header>

      {/* ======================================================== */}
      {/* SECTION 1 : HISTOIRE DE FRANCE • L'ANTIQUITÉ (NEW!)      */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-700 to-rose-900 text-white p-2.5 rounded-2xl shadow-xs text-2xl">
              🏛️
            </div>
            <div>
              <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-amber-950">
                Histoire • L'Antiquité en Gaule
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                Les peuples celtes et grecs, Jules César, Vercingétorix et Alésia
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
            2 Leçons officielles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Histoire 1 : Les Populations de la Gaule */}
          <article
            onClick={() => onOpenModule('histoire1')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-emerald-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  🏺
                </span>
                <button
                  onClick={(e) => handleToggle('histoire1', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['histoire1']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-emerald-400'
                  }`}
                >
                  <span>{progress['histoire1'] ? '✅' : '⚪'}</span>
                  <span>{progress['histoire1'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider mb-1">
                Histoire Cycle 3 • Leçon 1
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-emerald-800 transition">
                1/ Les Populations de la Gaule
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Découvre le mélange des Celtes venus d'Europe centrale et des Grecs par la Méditerranée, les tribus gauloises et leurs 4 grands talents d'artisans et guerriers.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                  📜 Fiche de cours
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🧩 4 Défis
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🔊 Audio
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                Lancer l'entraînement <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">5-10 min</span>
            </div>
          </article>

          {/* Carte Histoire 2 : La Conquête de la Gaule */}
          <article
            onClick={() => onOpenModule('histoire2')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-rose-100 hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-bl-full -z-0" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-rose-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  ⚔️
                </span>
                <button
                  onClick={(e) => handleToggle('histoire2', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['histoire2']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-rose-400'
                  }`}
                >
                  <span>{progress['histoire2'] ? '✅' : '⚪'}</span>
                  <span>{progress['histoire2'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-rose-800 tracking-wider mb-1">
                Histoire Cycle 3 • Leçon 21
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-rose-800 transition">
                21. La Conquête de la Gaule
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Jules César face à Vercingétorix en 52 avant J.-C. Maîtrise le siège d'Alésia, les notions de conquête, d'indépendance et d'impôts de la Gaule romaine.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold">
                  📜 Fiche officielle
                </span>
                <span className="text-[11px] bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🏛️ Quiz Alésia
                </span>
                <span className="text-[11px] bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🛡️ Romains vs Gaulois
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span className="flex items-center gap-1">
                Lancer l'entraînement <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">5-10 min</span>
            </div>
          </article>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2 : FRANÇAIS & MOTS DOUX                         */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-white p-2.5 rounded-2xl shadow-xs text-2xl">
              📖
            </div>
            <div>
              <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-amber-900">
                Français & Mots doux
              </h2>
              <p className="text-xs sm:text-sm text-amber-700 font-medium">
                Orthographe, conjugaison au présent et texte de Claude Ponti
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
            2 Missions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Autodictée 1 */}
          <article
            onClick={() => onOpenModule('autodictee1')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-amber-100 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-amber-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  ✍️
                </span>
                <button
                  onClick={(e) => handleToggle('autodictee1', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['autodictee1']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-amber-400'
                  }`}
                >
                  <span>{progress['autodictee1'] ? '✅' : '⚪'}</span>
                  <span>{progress['autodictee1'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider mb-1">
                Orthographe & Vocabulaire
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-amber-800 transition">
                Autodictée n°1
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Texte poétique de Claude Ponti : écoute la lecture, mémorise les mots difficiles avec la loupe magique, recopie sans faute et relève le défi de la dictée à masques.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🎧 Lecture audio
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🔍 Mots difficiles
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  ✍️ Mode dictée
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span className="flex items-center gap-1">
                Ouvrir l'autodictée <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">10 min</span>
            </div>
          </article>

          {/* Conjugaison */}
          <article
            onClick={() => onOpenModule('conjugaison')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-orange-100 hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-orange-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  ⚡
                </span>
                <button
                  onClick={(e) => handleToggle('conjugaison', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['conjugaison']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-orange-400'
                  }`}
                >
                  <span>{progress['conjugaison'] ? '✅' : '⚪'}</span>
                  <span>{progress['conjugaison'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-orange-800 tracking-wider mb-1">
                Grammaire & Verbes
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-orange-800 transition">
                Conjugaison au Présent
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Les 11 verbes indispensables du CM1 (aimer, finir, aller, faire, dire, venir, pouvoir, voir, vouloir, prendre, être/avoir) avec fiches mémo et grand quiz marathon.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-lg font-bold">
                  📋 11 Verbes
                </span>
                <span className="text-[11px] bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🎯 Entraînement
                </span>
                <span className="text-[11px] bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🏆 Quiz Marathon
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-700">
              <span className="flex items-center gap-1">
                Conjuguer maintenant <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">8 min</span>
            </div>
          </article>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3 : GÉOGRAPHIE & ALIMENTATION                    */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-emerald-200 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-xs text-2xl">
              🌍
            </div>
            <div>
              <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-emerald-950">
                Géographie • L'Alimentation
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                Se nourrir dans le monde et comprendre l'origine de nos aliments
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
            2 Missions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Géo Leçon 1 */}
          <article
            onClick={() => onOpenModule('geo1')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-emerald-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  🗺️
                </span>
                <button
                  onClick={(e) => handleToggle('geo1', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['geo1']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-emerald-400'
                  }`}
                >
                  <span>{progress['geo1'] ? '✅' : '⚪'}</span>
                  <span>{progress['geo1'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider mb-1">
                Monde & Continents
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-emerald-800 transition">
                Géo 1 : Se nourrir dans le monde
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Carte du monde interactive, contrastes entre pays riches et en développement, zones de sous-alimentation et consommation mondiale de viande.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🌐 Carte interactive
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🧩 6 Défis
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +100 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                Explorer la carte <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">10 min</span>
            </div>
          </article>

          {/* Géo Leçon 2 */}
          <article
            onClick={() => onOpenModule('geo2')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-teal-100 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-teal-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  🍎
                </span>
                <button
                  onClick={(e) => handleToggle('geo2', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['geo2']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-teal-400'
                  }`}
                >
                  <span>{progress['geo2'] ? '✅' : '⚪'}</span>
                  <span>{progress['geo2'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-teal-800 tracking-wider mb-1">
                Consommation Responsable
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-teal-800 transition">
                Géo 2 : D’où viennent nos aliments ?
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Origines végétale, animale et minérale, fabrication agroalimentaire, décryptage d'étiquettes et différence entre circuits courts et longs.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🏷️ Étiquettes
                </span>
                <span className="text-[11px] bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🚜 Circuits courts
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +100 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span className="flex items-center gap-1">
                Mener l'enquête <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">8 min</span>
            </div>
          </article>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4 : MATHÉMATIQUES & CALCUL                       */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-xs text-2xl">
              🧮
            </div>
            <div>
              <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-indigo-950">
                Mathématiques & Calcul
              </h2>
              <p className="text-xs sm:text-sm text-indigo-800 font-medium">
                Maîtrise des tables de multiplication et la magie des zéros
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-300">
            2 Missions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tables de multiplication */}
          <article
            onClick={() => onOpenModule('tables')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-indigo-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  🧠
                </span>
                <button
                  onClick={(e) => handleToggle('tables', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['tables']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-indigo-400'
                  }`}
                >
                  <span>{progress['tables'] ? '✅' : '⚪'}</span>
                  <span>{progress['tables'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-indigo-800 tracking-wider mb-1">
                Calcul Mental Rapide
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-indigo-800 transition">
                Les Tables de Multiplication
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Tables de 1 à 10 sélectionnables, table de Pythagore interactive qui récite les opérations, défi Sprint 60s chrono et Facteur Mystère.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-lg font-bold">
                  📊 Table Pythagore
                </span>
                <span className="text-[11px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-lg font-bold">
                  ⏱️ Sprint 60s
                </span>
                <span className="text-[11px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-lg font-bold">
                  ❓ Facteur Mystère
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span className="flex items-center gap-1">
                Relever le défi calcul <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">5-10 min</span>
            </div>
          </article>

          {/* Multiplier par 10 100 1000 */}
          <article
            onClick={() => onOpenModule('multiplier')}
            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-4xl bg-purple-100/70 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  🪄
                </span>
                <button
                  onClick={(e) => handleToggle('multiplier', e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border-2 cursor-pointer ${
                    progress['multiplier']
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-dashed border-stone-300 text-stone-500 bg-stone-50 hover:border-purple-400'
                  }`}
                >
                  <span>{progress['multiplier'] ? '✅' : '⚪'}</span>
                  <span>{progress['multiplier'] ? 'Terminé !' : 'À faire'}</span>
                </button>
              </div>

              <div className="text-[11px] font-extrabold uppercase text-purple-800 tracking-wider mb-1">
                Numération & Puissances de 10
              </div>
              <h3 className="font-fredoka text-xl font-bold text-stone-900 group-hover:text-purple-800 transition">
                Multiplier par 10, 100 et 1000
              </h3>
              <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">
                Démonstrateur animé de la « Règle d'or des zéros », entraînement au décalage magique avec pavé tactile, opérations à trous et détective des pièges.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-lg font-bold">
                  ✨ Règle d'or
                </span>
                <span className="text-[11px] bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🔢 Pavé tactile
                </span>
                <span className="text-[11px] bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-lg font-bold">
                  🕵️ Détective des pièges
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                  +150 XP
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span className="flex items-center gap-1">
                Devenir le Maître des Zéros <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-stone-400">7 min</span>
            </div>
          </article>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5 : APERÇU DE LA SALLE DES TROPHÉES              */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 bg-white/20 rounded-2xl shadow-inner">
              🏆
            </span>
            <div>
              <h2 className="text-2xl font-black font-fredoka leading-tight">
                Ton Armoire à Trophées & Médailles
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm font-medium">
                Tu as débloqué <strong>{stats.unlockedTrophiesCount} sur {stats.totalTrophiesCount} trophées</strong>. Continue pour tous les collectionner !
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onOpenTrophies();
            }}
            className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-950 font-black font-fredoka text-sm rounded-2xl shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            Ouvrir la salle des trophées ➔
          </button>
        </div>

        {/* Mini showcase of 4 trophies */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {allTrophies.slice(0, 4).map((t) => (
            <div
              key={t.id}
              onClick={() => {
                playSound('click');
                onOpenTrophies();
              }}
              className={`p-3.5 rounded-2xl transition cursor-pointer flex items-center gap-3 ${
                t.unlocked
                  ? 'bg-white/20 border border-white/40 shadow-2xs hover:bg-white/30'
                  : 'bg-black/20 border border-white/10 opacity-70'
              }`}
            >
              <span className="text-3xl">{t.unlocked ? t.icon : '🔒'}</span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold block truncate">{t.title}</span>
                <span className="text-[10px] text-amber-200">
                  {t.unlocked ? 'Débloqué !' : 'À conquérir'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer informatif */}
      <footer className="text-center py-6 text-stone-400 text-xs border-t border-stone-200/60">
        <p>🎒 Cahier de révisions interactif CM1 • Conforme au programme officiel de l'Éducation Nationale</p>
      </footer>
    </div>
  );
};
