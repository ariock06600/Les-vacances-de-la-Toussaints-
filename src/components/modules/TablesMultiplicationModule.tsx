import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Volume2, RotateCcw, Clock, Zap, Check, X, ShieldAlert } from 'lucide-react';

interface TablesMultiplicationModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

interface MathQuestion {
  factorA: number;
  factorB: number;
  product: number;
  displayPrompt: React.ReactNode;
  expectedAnswer: number | boolean;
  type: 'direct' | 'missing' | 'detective';
  explanation?: string;
}

interface MistakeItem {
  promptText: string;
  expected: string;
  userTyped: string;
}

export const TablesMultiplicationModule: React.FC<TablesMultiplicationModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [screen, setScreen] = useState<'home' | 'pythagore' | 'game' | 'results' | 'trophies'>('home');

  // Config
  const [selectedTables, setSelectedTables] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [questionsCount, setQuestionsCount] = useState<number>(10);
  const [currentMode, setCurrentMode] = useState<number>(1); // 1: Flash, 2: Manquant, 3: Sprint, 4: Détective

  // Game state
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [userTyped, setUserTyped] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [feedback, setFeedback] = useState<{ isOk: boolean; text: string } | null>(null);

  // Sprint timer
  const [sprintSeconds, setSprintSeconds] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pythagore hover
  const [pythHover, setPythHover] = useState<{ row: number; col: number } | null>(null);
  const [pythFormula, setPythFormula] = useState<string>('Clique sur une case de la table pour voir le calcul détaillé !');

  // Trophies stats stored in localStorage
  const [stats, setStats] = useState<{
    totalSolved: number;
    totalCorrect: number;
    bestSprint: number;
    bestStreak: number;
    perfectTens: number;
  }>(() => {
    try {
      const raw = localStorage.getItem('tables_mult_stats');
      return raw
        ? JSON.parse(raw)
        : { totalSolved: 0, totalCorrect: 0, bestSprint: 0, bestStreak: 0, perfectTens: 0 };
    } catch (e) {
      return { totalSolved: 0, totalCorrect: 0, bestSprint: 0, bestStreak: 0, perfectTens: 0 };
    }
  });

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats);
    try {
      localStorage.setItem('tables_mult_stats', JSON.stringify(newStats));
    } catch (e) {}
  };

  const toggleTable = (num: number) => {
    playSound('click');
    setSelectedTables((prev) =>
      prev.includes(num) ? (prev.length > 1 ? prev.filter((n) => n !== num) : prev) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const setTablesPreset = (preset: 'all' | 'easy' | 'hard' | 'reset') => {
    playSound('click');
    if (preset === 'all') setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    else if (preset === 'easy') setSelectedTables([1, 2, 5, 10]);
    else if (preset === 'hard') setSelectedTables([6, 7, 8, 9]);
    else setSelectedTables([2, 3, 4, 5]);
  };

  // Generate Questions
  const generateQuestions = (mode: number, count: number): MathQuestion[] => {
    const list: MathQuestion[] = [];
    const tables = selectedTables.length > 0 ? selectedTables : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (let i = 0; i < count; i++) {
      const a = tables[Math.floor(Math.random() * tables.length)];
      const b = Math.floor(Math.random() * 10) + 1;
      const product = a * b;

      if (mode === 1) {
        // Flash direct
        list.push({
          factorA: a,
          factorB: b,
          product,
          type: 'direct',
          expectedAnswer: product,
          displayPrompt: (
            <span>
              {a} × {b} = <span className="text-indigo-600 underline">?</span>
            </span>
          ),
        });
      } else if (mode === 2) {
        // Missing factor
        const hideA = Math.random() > 0.5;
        list.push({
          factorA: a,
          factorB: b,
          product,
          type: 'missing',
          expectedAnswer: hideA ? a : b,
          displayPrompt: hideA ? (
            <span>
              <span className="text-indigo-600 underline">?</span> × {b} = {product}
            </span>
          ) : (
            <span>
              {a} × <span className="text-indigo-600 underline">?</span> = {product}
            </span>
          ),
        });
      } else if (mode === 3) {
        // Sprint (mix of direct questions)
        list.push({
          factorA: a,
          factorB: b,
          product,
          type: 'direct',
          expectedAnswer: product,
          displayPrompt: (
            <span>
              {a} × {b} = <span className="text-rose-600 underline">?</span>
            </span>
          ),
        });
      } else if (mode === 4) {
        // Detective Vrai / Faux & Pièges
        const isTrue = Math.random() > 0.5;
        const fakeOffsets = [-2, -1, 1, 2, -10, 10];
        const fakeProduct = isTrue
          ? product
          : Math.max(1, product + fakeOffsets[Math.floor(Math.random() * fakeOffsets.length)]);

        list.push({
          factorA: a,
          factorB: b,
          product,
          type: 'detective',
          expectedAnswer: isTrue,
          explanation: isTrue ? `Exact ! ${a} × ${b} = ${product}.` : `Faux ! ${a} × ${b} = ${product} (et non ${fakeProduct}) !`,
          displayPrompt: (
            <span>
              {a} × {b} = <span className="text-emerald-700 font-black">{fakeProduct}</span> ?
            </span>
          ),
        });
      }
    }
    return list;
  };

  const startGame = (mode: number) => {
    playSound('click');
    setCurrentMode(mode);
    const count = mode === 3 ? 999 : questionsCount;
    const qList = generateQuestions(mode, count);

    setQuestions(qList);
    setQIndex(0);
    setUserTyped('');
    setScore(0);
    setStreak(0);
    setCombo(1);
    setIsLocked(false);
    setMistakes([]);
    setFeedback(null);
    setScreen('game');

    if (mode === 3) {
      setSprintSeconds(60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSprintSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleKeyPress = (numStr: string) => {
    if (isLocked) return;
    playSound('click');
    setUserTyped((prev) => (prev.length < 5 ? prev + numStr : prev));
  };

  const handleBackspace = () => {
    if (isLocked) return;
    playSound('click');
    setUserTyped((prev) => prev.slice(0, -1));
  };

  const submitAnswer = (overrideAnswer?: boolean) => {
    if (isLocked || qIndex >= questions.length) return;

    const currentQ = questions[qIndex];
    let isCorrect = false;

    if (currentQ.type === 'detective') {
      isCorrect = overrideAnswer === currentQ.expectedAnswer;
    } else {
      const parsed = parseInt(userTyped, 10);
      isCorrect = parsed === currentQ.expectedAnswer;
    }

    setIsLocked(true);

    if (isCorrect) {
      playSound('correct');
      const addPts = currentMode === 3 ? combo : 1;
      setScore((s) => s + addPts);
      setStreak((st) => st + 1);
      if (currentMode === 3) {
        setCombo((c) => Math.min(5, c + 1));
      }
      setFeedback({
        isOk: true,
        text: currentQ.type === 'detective' ? `Bravo ! ${currentQ.explanation}` : '🎉 Parfait ! Bonne réponse !',
      });
    } else {
      playSound('wrong');
      setStreak(0);
      setCombo(1);
      const expectedText =
        currentQ.type === 'detective'
          ? currentQ.expectedAnswer ? 'VRAI' : 'FAUX'
          : String(currentQ.expectedAnswer);

      setMistakes((prev) => [
        ...prev,
        {
          promptText: `${currentQ.factorA} × ${currentQ.factorB}`,
          expected: expectedText,
          userTyped: currentQ.type === 'detective' ? (overrideAnswer ? 'VRAI' : 'FAUX') : userTyped,
        },
      ]);
      setFeedback({
        isOk: false,
        text: currentQ.type === 'detective' ? `Erreur ! ${currentQ.explanation}` : `Attendu : ${expectedText}`,
      });
    }

    setTimeout(() => {
      nextStep(isCorrect);
    }, currentMode === 3 ? 350 : 750);
  };

  const nextStep = (wasCorrect: boolean) => {
    setUserTyped('');
    setFeedback(null);
    setIsLocked(false);

    if (currentMode === 3) {
      // In sprint, continue until timer hits 0
      setQIndex((idx) => idx + 1);
    } else {
      if (qIndex + 1 < questions.length) {
        setQIndex((idx) => idx + 1);
      } else {
        finishGame();
      }
    }
  };

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('results');

    // Update stats
    const correctCount = score;
    const isPerfect = mistakes.length === 0 && currentMode !== 3;

    saveStats({
      totalSolved: stats.totalSolved + (currentMode === 3 ? qIndex : questions.length),
      totalCorrect: stats.totalCorrect + correctCount,
      bestSprint: currentMode === 3 ? Math.max(stats.bestSprint, correctCount) : stats.bestSprint,
      bestStreak: Math.max(stats.bestStreak, streak),
      perfectTens: isPerfect ? stats.perfectTens + 1 : stats.perfectTens,
    });

    if (currentMode === 3 && correctCount >= 15) {
      playSound('fanfare');
      fireGrandCelebration();
      setMissionCompleted('tables');
      if (onComplete) onComplete();
    } else if (currentMode !== 3 && mistakes.length === 0) {
      playSound('fanfare');
      fireGrandCelebration();
      setMissionCompleted('tables');
      if (onComplete) onComplete();
    } else {
      fireConfetti();
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game') return;
      if (currentMode === 4) {
        if (e.key === 'v' || e.key === 'V') submitAnswer(true);
        if (e.key === 'f' || e.key === 'F') submitAnswer(false);
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        submitAnswer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isLocked, userTyped, qIndex, questions, currentMode]);

  const currentQ = questions[qIndex];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar
        title="Master Multiplication (Tables 1 à 10)"
        badgeText="Calcul Mental • CM1"
        badgeBg="bg-indigo-700 text-white"
        onHome={onHome}
        rightExtra={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound('click');
                setScreen('pythagore');
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs transition"
            >
              📐 Pythagore
            </button>
            <button
              onClick={() => {
                playSound('click');
                setScreen('trophies');
              }}
              className="px-3 py-1 bg-amber-400 text-amber-950 font-black rounded-xl text-xs transition"
            >
              🏆 Trophées
            </button>
          </div>
        }
      />

      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* SCREEN 1: HOME & CONFIG */}
        {screen === 'home' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide text-amber-200">
                🎯 ENTRAÎNEMENT DU CALCUL MENTAL
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka leading-tight mt-2">
                Maîtrise toutes tes tables du bout des doigts !
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base font-medium mt-1">
                Sélectionne les tables que tu souhaites réviser, puis choisis parmi les 4 modes de jeu.
              </p>
            </div>

            {/* Tables selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black font-fredoka text-slate-800 flex items-center gap-2">
                    <span>⚙️</span> Étape 1 : Choisis tes tables (1 à 10)
                  </h3>
                  <p className="text-xs text-slate-500">Clique sur chaque bouton pour activer ou désactiver la table.</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <button onClick={() => setTablesPreset('all')} className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 rounded-xl transition">
                    Toutes (1-10)
                  </button>
                  <button onClick={() => setTablesPreset('easy')} className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-xl transition">
                    Faciles (1, 2, 5, 10)
                  </button>
                  <button onClick={() => setTablesPreset('hard')} className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-900 rounded-xl transition">
                    Difficiles (6, 7, 8, 9)
                  </button>
                </div>
              </div>

              {/* 10 Toggle buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSel = selectedTables.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleTable(num)}
                      className={`py-3 px-2 rounded-2xl border-2 font-black text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-normal opacity-75">Table</span>
                      <span>× {num}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span>Questions par série :</span>
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                    {[10, 15, 20].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => {
                          playSound('click');
                          setQuestionsCount(cnt);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          questionsCount === cnt ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:text-indigo-600'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                  Tables actives : {selectedTables.join(', ')}
                </div>
              </div>
            </div>

            {/* 4 Game Modes */}
            <div className="space-y-4">
              <h3 className="text-lg font-black font-fredoka text-slate-800 flex items-center gap-2">
                <span>🎮</span> Étape 2 : Lance ton mode de jeu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">⚡</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Mode 1 : Flash Réflexe
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Calcul direct en grand format (ex: <strong>7 × 8 = ?</strong>). Pavé tactile interactif ou clavier physique.
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(1)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer Flash Réflexe ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">🧩</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Mode 2 : Facteur Manquant
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Trouve le facteur caché (ex: <strong>6 × ? = 42</strong>). Développe l'esprit logique et prépare à la division.
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(2)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer Facteur Manquant ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">⏱️</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Mode 3 : Défi Sprint Chrono (60s)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      60 secondes pour enchaîner un maximum de bonnes réponses ! Système de combos et multiplicateurs.
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(3)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer le Sprint 60s ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">🕵️‍♂️</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Mode 4 : Vrai ou Faux & Pièges
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Détecte les égalités piégées (ex: <em>8 × 7 = 54 ?</em>) avec explication mathématique immédiate.
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(4)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer la Chasse aux Pièges ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: PYTHAGORE TABLE */}
        {screen === 'pythagore' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  Mémo & Révision
                </span>
                <h2 className="text-2xl font-black font-fredoka text-slate-800 mt-1">
                  La Table de Pythagore (1 à 10)
                </h2>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setScreen('home');
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition"
              >
                ← Retour à l'accueil
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Survole ou clique sur n'importe quelle case pour illuminer la ligne, la colonne et écouter la formule !
            </p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center font-fredoka text-lg sm:text-xl font-bold text-amber-950 flex items-center justify-center gap-2">
              <span>{pythFormula}</span>
            </div>

            {/* 11x11 Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-block min-w-full p-2 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-11 gap-1 text-center font-bold text-xs sm:text-sm select-none">
                  {/* Row 0: Headers */}
                  <div className="p-2 bg-indigo-700 text-white rounded-lg font-black">×</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <div
                      key={`h-${c}`}
                      className={`p-2 rounded-lg font-black ${
                        pythHover?.col === c ? 'bg-amber-400 text-amber-950 font-black' : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {c}
                    </div>
                  ))}

                  {/* Rows 1 to 10 */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                    <React.Fragment key={`row-${r}`}>
                      <div
                        className={`p-2 rounded-lg font-black ${
                          pythHover?.row === r ? 'bg-amber-400 text-amber-950 font-black' : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {r}
                      </div>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
                        const val = r * c;
                        const isHoveredCell = pythHover?.row === r && pythHover?.col === c;
                        const isInAxis = pythHover?.row === r || pythHover?.col === c;

                        return (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            onMouseEnter={() => setPythHover({ row: r, col: c })}
                            onClick={() => {
                              playSound('click');
                              setPythFormula(`${r} fois ${c} égale ${val}`);
                              speakText(`${r} fois ${c} égale ${val}`);
                            }}
                            className={`p-2 rounded-lg transition text-xs sm:text-sm ${
                              isHoveredCell
                                ? 'bg-amber-300 text-amber-950 font-black scale-110 shadow-md'
                                : isInAxis
                                ? 'bg-amber-100 text-slate-800 font-bold'
                                : r === c
                                ? 'bg-indigo-50 text-indigo-900 font-black'
                                : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: GAMEPLAY */}
        {screen === 'game' && currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 max-w-2xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm('Quitter cette partie ?')) {
                      if (timerRef.current) clearInterval(timerRef.current);
                      setScreen('home');
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs transition"
                >
                  ✕ Quitter
                </button>
                <div>
                  <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {currentMode === 1
                      ? 'Flash Réflexe'
                      : currentMode === 2
                      ? 'Facteur Manquant'
                      : currentMode === 3
                      ? 'Sprint 60s'
                      : 'Vrai ou Faux'}
                  </span>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">
                    {currentMode === 3 ? `Calcul n° ${qIndex + 1}` : `Calcul ${qIndex + 1} / ${questions.length}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentMode === 3 && (
                  <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 font-mono font-black text-base">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{sprintSeconds}s</span>
                  </div>
                )}
                {currentMode === 3 && combo > 1 && (
                  <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black">
                    🔥 Combo x{combo}
                  </div>
                )}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-black block leading-none">Score</span>
                  <span className="text-xl font-black font-fredoka text-indigo-600">{score}</span>
                </div>
              </div>
            </div>

            {/* Prompt Box */}
            <div className="text-center py-5 sm:py-7 bg-slate-50 rounded-3xl border-2 border-slate-200 px-4 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trouve le résultat :</span>

              <div className="text-3xl sm:text-5xl font-black font-fredoka text-slate-800 tracking-tight leading-tight">
                {currentQ.displayPrompt}
              </div>

              {currentMode !== 4 && (
                <div className="max-w-xs mx-auto">
                  <div className="w-full py-2.5 px-4 bg-white border-2 border-indigo-400 rounded-2xl text-2xl sm:text-3xl font-black text-indigo-900 text-center shadow-inner tracking-widest min-h-[52px] flex items-center justify-center">
                    {userTyped ? userTyped : <span className="text-slate-300 font-normal">...</span>}
                  </div>
                </div>
              )}

              {feedback && (
                <div
                  className={`text-sm sm:text-base font-black py-2.5 px-4 rounded-xl ${
                    feedback.isOk ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Interaction: Numpad for Modes 1, 2, 3 */}
            {currentMode !== 4 ? (
              <div className="space-y-2 max-w-sm mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleKeyPress(n)}
                      className="p-3 bg-white border-2 border-slate-200 hover:border-indigo-400 active:bg-indigo-50 rounded-2xl font-black text-xl text-slate-800 shadow-xs transition active:scale-95"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-xs transition active:scale-95"
                  >
                    ⌫ Effacer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="p-3 bg-white border-2 border-slate-200 hover:border-indigo-400 active:bg-indigo-50 rounded-2xl font-black text-xl text-slate-800 shadow-xs transition active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => submitAnswer()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow transition active:scale-95"
                  >
                    OK ↵
                  </button>
                </div>
              </div>
            ) : (
              /* Mode 4 Detective Vrai / Faux */
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => submitAnswer(true)}
                  className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>✅</span> <span>C'est VRAI</span>
                </button>
                <button
                  type="button"
                  onClick={() => submitAnswer(false)}
                  className="p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-950 font-black text-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>❌</span> <span>C'est FAUX</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 4: RESULTS */}
        {screen === 'results' && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl space-y-7 max-w-2xl mx-auto">
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <div className="text-6xl">{score >= 10 ? '👑' : '⭐'}</div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Session Terminée !
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka text-slate-900 mt-2">
                Superbe Performance !
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="text-[11px] font-bold text-indigo-700 uppercase">Score Obtenu</div>
                <div className="text-2xl sm:text-3xl font-black font-fredoka text-indigo-900 mt-1">{score} pts</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-700 uppercase">Calculs faits</div>
                <div className="text-2xl sm:text-3xl font-black font-fredoka text-emerald-900 mt-1">
                  {currentMode === 3 ? qIndex : questions.length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-bold text-amber-700 uppercase">Erreurs</div>
                <div className="text-2xl sm:text-3xl font-black font-fredoka text-amber-900 mt-1">{mistakes.length}</div>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm font-fredoka flex items-center gap-1.5">
                  <span>🔍</span> Calculs à revoir ({mistakes.length}) :
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mistakes.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border flex justify-between text-xs sm:text-sm">
                      <span className="font-bold">{m.promptText}</span>
                      <span>
                        Attendu : <strong className="text-emerald-700">{m.expected}</strong> (tu avais écrit : "{m.userTyped}")
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => startGame(currentMode)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow transition"
              >
                🔄 Rejouer ce mode
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setScreen('home');
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition"
              >
                🏠 Changer de tables
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: TROPHIES */}
        {screen === 'trophies' && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-9 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Palmarès
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka mt-2">🏆 Galerie des 10 Trophées</h2>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setScreen('home');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition"
              >
                ← Retour
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                { id: 1, title: 'Premier calcul réussi', desc: 'Résoudre un calcul avec succès.', icon: '🌱', un: stats.totalCorrect >= 1 },
                { id: 2, title: 'Maître de la table de 5', desc: 'S’entraîner sur les multiples de 5.', icon: '🖐️', un: stats.totalCorrect >= 5 },
                { id: 3, title: 'Maître du 7', desc: 'Maîtriser les multiplications par 7.', icon: '⚔️', un: stats.totalCorrect >= 10 },
                { id: 4, title: 'Roi du 8 et 9', desc: 'Dompter les tables de 8 et 9.', icon: '👑', un: stats.totalCorrect >= 15 },
                { id: 5, title: 'Sprint éclair (15+)', desc: 'Score >= 15 dans le Sprint 60s.', icon: '⚡', un: stats.bestSprint >= 15 },
                { id: 6, title: 'Sans-faute parfait (10/10)', desc: 'Compléter une série sans faute.', icon: '🎯', un: stats.perfectTens >= 1 },
                { id: 7, title: 'Série magique (10 d’affilée)', desc: '10 bonnes réponses consécutives.', icon: '🔥', un: stats.bestStreak >= 10 },
                { id: 8, title: 'Centurion (100 calculs)', desc: '100 calculs réussis au total.', icon: '💯', un: stats.totalCorrect >= 100 },
              ].map((tr) => (
                <div key={tr.id} className={`p-4 rounded-2xl border ${tr.un ? 'bg-white/15 border-amber-400/60' : 'bg-white/5 border-white/10 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tr.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-base font-fredoka">{tr.title}</h4>
                      <p className="text-xs text-slate-300">{tr.desc}</p>
                      <span className="text-[10px] font-bold text-amber-300 mt-1 inline-block">
                        {tr.un ? '✨ Débloqué !' : '🔒 Verrouillé'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
