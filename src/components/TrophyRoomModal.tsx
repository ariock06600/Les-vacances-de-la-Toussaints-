import React, { useState } from 'react';
import { getAllTrophiesWithStatus, Trophy, getPlayerStats } from '../utils/gamification';
import { playSound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { X, Award, Lock, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [inspectedTrophy, setInspectedTrophy] = useState<Trophy | null>(null);

  if (!isOpen) return null;

  const trophies = getAllTrophiesWithStatus();
  const stats = getPlayerStats();

  const categories = ['Tous', 'Histoire', 'Français', 'Géographie', 'Maths', 'Général'];

  const filteredTrophies = trophies.filter((t) => {
    if (selectedCategory !== 'Tous' && t.category !== selectedCategory) return false;
    if (filterUnlockedOnly === 'unlocked' && !t.unlocked) return false;
    if (filterUnlockedOnly === 'locked' && t.unlocked) return false;
    return true;
  });

  const handleInspect = (trophy: Trophy) => {
    setInspectedTrophy(trophy);
    if (trophy.unlocked) {
      playSound('fanfare');
      fireConfetti({ particleCount: 40, spread: 60 });
    } else {
      playSound('click');
    }
  };

  const getTierColor = (tier: Trophy['tier']) => {
    switch (tier) {
      case 'legendaire':
        return 'from-amber-400 via-purple-500 to-indigo-600 border-amber-300 text-purple-900';
      case 'or':
        return 'from-amber-300 to-yellow-500 border-amber-400 text-amber-900';
      case 'argent':
        return 'from-slate-200 to-slate-400 border-slate-300 text-slate-800';
      case 'bronze':
        return 'from-amber-700 to-amber-900 border-amber-800 text-amber-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FFFDF9] rounded-3xl border-3 border-amber-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 bg-white/20 rounded-2xl shadow-inner animate-pulse">
              🏆
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-fredoka leading-tight">
                La Grande Salle des Trophées
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm font-medium">
                Débloque des médailles légendaires en révisant et en relevant les défis CM1 !
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Stats Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-stone-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stats.levelMascot}</span>
            <div>
              <span className="text-stone-500 uppercase text-[10px] block">Niveau actuel</span>
              <span className="text-amber-900 font-extrabold text-sm">{stats.levelTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-stone-500 uppercase text-[10px] block">Points d'XP</span>
              <span className="text-orange-600 font-black text-sm">⚡ {stats.xp} XP</span>
            </div>
            <div className="h-6 w-px bg-amber-200" />
            <div>
              <span className="text-stone-500 uppercase text-[10px] block">Trophées obtenus</span>
              <span className="text-emerald-700 font-black text-sm">
                🎖️ {stats.unlockedTrophiesCount} / {stats.totalTrophiesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Header */}
        <div className="p-4 sm:px-6 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Unlocked toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterUnlockedOnly('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterUnlockedOnly === 'all' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterUnlockedOnly('unlocked')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterUnlockedOnly === 'unlocked' ? 'bg-white shadow-2xs text-emerald-800' : 'text-stone-500'
              }`}
            >
              Débloqués
            </button>
            <button
              onClick={() => setFilterUnlockedOnly('locked')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterUnlockedOnly === 'locked' ? 'bg-white shadow-2xs text-amber-800' : 'text-stone-500'
              }`}
            >
              À débloquer
            </button>
          </div>
        </div>

        {/* Trophies Grid (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredTrophies.map((trophy) => (
              <div
                key={trophy.id}
                onClick={() => handleInspect(trophy)}
                className={`group relative p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  trophy.unlocked
                    ? 'bg-gradient-to-b from-white to-amber-50/50 border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-1'
                    : 'bg-stone-100/80 border-stone-200/80 opacity-70 hover:opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`text-3xl p-3 rounded-2xl ${
                        trophy.unlocked
                          ? 'bg-amber-100 shadow-inner group-hover:scale-110 transition-transform'
                          : 'bg-stone-200 grayscale'
                      }`}
                    >
                      {trophy.unlocked ? trophy.icon : '🔒'}
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          trophy.tier === 'legendaire'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : trophy.tier === 'or'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : trophy.tier === 'argent'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-amber-900/10 text-amber-900'
                        }`}
                      >
                        {trophy.tier}
                      </span>
                      <span className="block text-[11px] font-bold text-orange-600 mt-0.5">
                        +{trophy.points} XP
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 font-fredoka text-base mb-1">
                    {trophy.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {trophy.unlocked ? trophy.description : trophy.hint}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-stone-400">{trophy.category}</span>
                  {trophy.unlocked ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Obtenu le {trophy.unlockedAt}
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Verrouillé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTrophies.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="font-bold text-sm">Aucun trophée ne correspond à ce filtre.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs">
          <p className="text-stone-500 font-medium hidden sm:block">
            💡 Astuce : Termine les quiz et les exercices pour faire briller toute ton armoire !
          </p>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition cursor-pointer active:scale-95 text-center"
          >
            Fermer l'armoire
          </button>
        </div>
      </div>
    </div>
  );
};
