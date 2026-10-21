import React, { useMemo } from 'react';

interface LeafData {
  id: number;
  char: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

export const FallingLeaves: React.FC = () => {
  const leaves = useMemo<LeafData[]>(() => {
    const chars = ['🍁', '🍂', '🍃', '🌰', '🎃'];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      char: chars[i % chars.length],
      left: `${(i * 7 + 4) % 95}vw`,
      duration: `${8 + (i % 6) * 1.5}s`,
      delay: `${(i * 1.2) % 8}s`,
      size: i % 2 === 0 ? 'text-2xl' : 'text-xl',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {leaves.map((l) => (
        <span
          key={l.id}
          className={`leaf select-none opacity-60 ${l.size}`}
          style={{
            left: l.left,
            animationDuration: l.duration,
            animationDelay: l.delay,
          }}
        >
          {l.char}
        </span>
      ))}
    </div>
  );
};
