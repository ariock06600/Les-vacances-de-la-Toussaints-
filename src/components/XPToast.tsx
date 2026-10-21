import React, { useState, useEffect } from 'react';
import { subscribeToXP, subscribeToTrophy, Trophy } from '../utils/gamification';

interface ToastItem {
  id: string;
  amount?: number;
  reason: string;
  type: 'xp' | 'level' | 'trophy';
  title?: string;
  icon?: string;
}

export const XPToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubXP = subscribeToXP((info) => {
      if (info.leveledUp && info.newLevel) {
        const toastId = 'lvl_' + Date.now();
        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            type: 'level',
            title: `NIVEAU SUPÉRIEUR : ${info.newLevel?.title} !`,
            reason: `Tu as atteint le niveau ${info.newLevel?.level} ! 🌟`,
            icon: info.newLevel?.mascot,
          },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 5000);
      } else {
        const toastId = 'xp_' + Date.now();
        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            amount: info.amount,
            reason: info.reason,
            type: 'xp',
            icon: '⚡',
          },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 3000);
      }
    });

    const unsubTrophy = subscribeToTrophy((trophy: Trophy) => {
      const toastId = 'trophy_' + Date.now();
      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          type: 'trophy',
          title: `NOUVEAU TROPHÉE : ${trophy.title} !`,
          reason: trophy.description,
          icon: trophy.icon,
        },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5500);
    });

    return () => {
      unsubXP();
      unsubTrophy();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-2xl shadow-xl border-2 transform transition-all duration-300 animate-bounce flex items-center gap-3 pointer-events-auto ${
            toast.type === 'trophy'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-white text-amber-950'
              : toast.type === 'level'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-amber-300 text-white'
              : 'bg-white/95 backdrop-blur-xs border-amber-300 text-stone-900'
          }`}
        >
          <div className="text-3xl p-2 bg-white/30 rounded-xl shadow-xs shrink-0">
            {toast.icon || '⚡'}
          </div>
          <div className="flex-1">
            {toast.title && (
              <h5 className="font-black text-xs font-fredoka uppercase tracking-wider mb-0.5">
                {toast.title}
              </h5>
            )}
            <p className="text-xs font-bold leading-tight">{toast.reason}</p>
          </div>
          {toast.amount && (
            <span className="text-base font-black text-orange-600 font-fredoka bg-orange-100 px-2.5 py-1 rounded-xl">
              +{toast.amount} XP
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
