import confetti from 'canvas-confetti';

export function fireConfetti(options?: confetti.Options): void {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F4A261', '#E76F51', '#2A9D8F', '#E9C46A', '#3B82F6', '#8B5CF6'],
      ...options,
    });
  } catch (e) {
    // Graceful fallback
  }
}

export function fireGrandCelebration(): void {
  try {
    fireConfetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => {
      fireConfetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } });
    }, 250);
  } catch (e) {}
}
