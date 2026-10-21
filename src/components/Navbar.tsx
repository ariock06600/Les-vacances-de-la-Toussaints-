import React from 'react';
import { Volume2, VolumeX, ArrowLeft, Home, Save } from 'lucide-react';
import { playSound, toggleGlobalSound, isSoundEnabled } from '../utils/audio';
import { getPlayerStats } from '../utils/gamification';
import { getActiveProfile } from '../utils/saveSystem';

interface NavbarProps {
  title: string;
  badgeText: string;
  badgeBg?: string;
  onHome: () => void;
  onOpenTrophies?: () => void;
  onOpenSave?: () => void;
  rightExtra?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  badgeText,
  badgeBg = 'bg-black/20 text-white',
  onHome,
  onOpenTrophies,
  onOpenSave,
  rightExtra,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());
  const stats = getPlayerStats();
  const profile = getActiveProfile();

  const handleToggleSound = () => {
    const next = toggleGlobalSound();
    setSoundOn(next);
    if (next) playSound('click');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              playSound('click');
              onHome();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-2xs active:scale-95 cursor-pointer"
            title="Retour au cahier de vacances"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Cahier CM1</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeBg}`}>
                {badgeText}
              </span>
              <span className="text-[11px] font-bold text-amber-200 hidden md:inline">
                {profile.avatar} {profile.name} · {stats.levelMascot} {stats.levelTitle}
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-black font-fredoka tracking-tight leading-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {rightExtra}

          {onOpenSave && (
            <button
              onClick={() => {
                playSound('click');
                onOpenSave();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Gérer la sauvegarde"
            >
              <Save className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Sauvegarde</span>
            </button>
          )}

          {onOpenTrophies && (
            <button
              onClick={() => {
                playSound('click');
                onOpenTrophies();
              }}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 transition shadow-2xs active:scale-95 cursor-pointer"
              title="Voir mes trophées"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">Trophées</span>
              <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {stats.unlockedTrophiesCount}/{stats.totalTrophiesCount}
              </span>
            </button>
          )}

          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Couper le son' : 'Activer le son'}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              playSound('click');
              onHome();
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Accueil"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
        </div>
      </div>
    </header>
  );
};
