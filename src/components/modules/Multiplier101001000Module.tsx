import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { playSound } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Sparkles, RotateCcw, Check, X, ShieldAlert, Award } from 'lucide-react';

interface Multiplier101001000ModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

interface ZeroQuestion {
  base: number;
  multiplier: number;
  result: number;
  type: 'direct' | 'missing' | 'sort' | 'detective';
  displayPrompt: React.ReactNode;
  expectedVal: number | string | boolean;
  explanation?: string;
}

interface MistakeItem {
  prompt: string;
  expected: string;
  userTyped: string;
}

export const Multiplier101001000Module: React.FC<Multiplier101001000ModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [screen, setScreen] = useState<'landing' | 'game' | 'results' | 'trophies'>('landing');

  // Interactive Demo state
  const [demoBase, setDemoBase] = useState<number>(4);
  const [demoPower, setDemoPower] = useState<number>(100);

  // Settings
  const [targetMultiplier, setTargetMultiplier] = useState<'mix' | '10' | '100' | '1000'>('mix');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Game state
  const [currentMode, setCurrentMode] = useState<number>(1);
  const [questions, setQuestions] = useState<ZeroQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [userTyped, setUserTyped] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [feedback, setFeedback] = useState<{ isOk: boolean; text: string } | null>(null);

  // Stats
  const [stats, setStats] = useState<{ totalCorrect: number; perfectTens: number }>(() => {
    try {
      const raw = localStorage.getItem('zeros_stats');
      return raw ? JSON.parse(raw) : { totalCorrect: 0, perfectTens: 0 };
    } catch (e) {
      return { totalCorrect: 0, perfectTens: 0 };
    }
  });

  const generateQuestions = (mode: number): ZeroQuestion[] => {
    const list: ZeroQuestion[] = [];
    const powers = targetMultiplier === 'mix' ? [10, 100, 1000] : [parseInt(targetMultiplier, 10)];

    for (let i = 0; i < 10; i++) {
      const p = powers[Math.floor(Math.random() * powers.length)];
      let base = 5;

      if (difficulty === 'easy') {
        const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 50];
        base = pool[Math.floor(Math.random() * pool.length)];
      } else if (difficulty === 'medium') {
        base = Math.floor(Math.random() * 80) + 12;
      } else {
        const pool = [105, 230, 408, 750, 1200, 3040];
        base = pool[Math.floor(Math.random() * pool.length)];
      }

      const result = base * p;

      if (mode === 1) {
        // Direct
        list.push({
          base,
          multiplier: p,
          result,
          type: 'direct',
          expectedVal: result,
          displayPrompt: (
            <span>
              {base} × {p.toLocaleString('fr-FR')} = <span className="text-sky-600 underline">?</span>
            </span>
          ),
        });
      } else if (mode === 2) {
        // Missing
        const hidePower = Math.random() > 0.5;
        list.push({
          base,
          multiplier: p,
          result,
          type: 'missing',
          expectedVal: hidePower ? p : base,
          displayPrompt: hidePower ? (
            <span>
              {base} × <span className="text-amber-600 underline">?</span> = {result.toLocaleString('fr-FR')}
            </span>
          ) : (
            <span>
              <span className="text-amber-600 underline">?</span> × {p.toLocaleString('fr-FR')} = {result.toLocaleString('fr-FR')}
            </span>
          ),
        });
      } else if (mode === 3) {
        // Sort into family x10, x100, x1000
        list.push({
          base,
          multiplier: p,
          result,
          type: 'sort',
          expectedVal: p,
          displayPrompt: (
            <span>
              {base} &rarr; <span className="text-purple-600 font-black">{result.toLocaleString('fr-FR')}</span>
            </span>
          ),
        });
      } else {
        // Detective
        const isTrue = Math.random() > 0.5;
        let fakeResult = result;
        if (!isTrue) {
          // generate classic student mistake: forgetting a zero or adding one too many
          fakeResult = Math.random() > 0.5 ? Math.max(1, Math.floor(result / 10)) : result * 10;
        }

        list.push({
          base,
          multiplier: p,
          result,
          type: 'detective',
          expectedVal: isTrue,
          explanation: isTrue
            ? `Exact ! ${base} × ${p} = ${result.toLocaleString('fr-FR')}.`
            : `Faux ! ${base} × ${p} = ${result.toLocaleString('fr-FR')} (et non ${fakeResult.toLocaleString('fr-FR')}) !`,
          displayPrompt: (
            <span>
              {base} × {p.toLocaleString('fr-FR')} = {fakeResult.toLocaleString('fr-FR')} ?
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
    const qList = generateQuestions(mode);
    setQuestions(qList);
    setQIndex(0);
    setUserTyped('');
    setScore(0);
    setIsLocked(false);
    setMistakes([]);
    setFeedback(null);
    setScreen('game');
  };

  const handleKeyPress = (digit: string) => {
    if (isLocked) return;
    playSound('click');
    setUserTyped((prev) => (prev.length < 8 ? prev + digit : prev));
  };

  const handleBackspace = () => {
    if (isLocked) return;
    playSound('click');
    setUserTyped((prev) => prev.slice(0, -1));
  };

  const submitAnswer = (overrideVal?: any) => {
    if (isLocked || qIndex >= questions.length) return;
    const currentQ = questions[qIndex];

    let isCorrect = false;
    if (currentQ.type === 'sort' || currentQ.type === 'detective') {
      isCorrect = overrideVal === currentQ.expectedVal;
    } else {
      const parsed = parseInt(userTyped, 10);
      isCorrect = parsed === currentQ.expectedVal;
    }

    setIsLocked(true);

    if (isCorrect) {
      playSound('correct');
      setScore((s) => s + 1);
      setFeedback({
        isOk: true,
        text: currentQ.explanation || '🎉 Excellent ! Bonne réponse !',
      });
    } else {
      playSound('wrong');
      const expectedStr = String(currentQ.expectedVal);
      setMistakes((prev) => [
        ...prev,
        {
          prompt: `${currentQ.base} × ${currentQ.multiplier}`,
          expected: expectedStr,
          userTyped: String(overrideVal !== undefined ? overrideVal : userTyped),
        },
      ]);
      setFeedback({
        isOk: false,
        text: currentQ.explanation || `Attendu : ${expectedStr}`,
      });
    }

    setTimeout(() => {
      setUserTyped('');
      setFeedback(null);
      setIsLocked(false);
      if (qIndex + 1 < questions.length) {
        setQIndex((idx) => idx + 1);
      } else {
        finishGame();
      }
    }, 700);
  };

  const finishGame = () => {
    setScreen('results');
    const finalScore = score + (feedback?.isOk ? 0 : 0);
    const isPerfect = mistakes.length === 0;

    const newStats = {
      totalCorrect: stats.totalCorrect + score,
      perfectTens: isPerfect ? stats.perfectTens + 1 : stats.perfectTens,
    };
    setStats(newStats);
    try {
      localStorage.setItem('zeros_stats', JSON.stringify(newStats));
    } catch (e) {}

    if (finalScore >= 8) {
      playSound('fanfare');
      fireGrandCelebration();
      setMissionCompleted('multiplier');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }
  };

  const currentQ = questions[qIndex];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar
        title="Le Maître des Zéros : ×10, ×100, ×1 000"
        badgeText="Mathématiques Malines"
        badgeBg="bg-sky-600 text-white"
        onHome={onHome}
        rightExtra={
          <button
            onClick={() => {
              playSound('click');
              setScreen('trophies');
            }}
            className="px-3 py-1 bg-amber-400 text-amber-950 font-black rounded-xl text-xs transition"
          >
            🏆 Trophées
          </button>
        }
      />

      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* SCREEN 1: LANDING & DEMONSTRATOR */}
        {screen === 'landing' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-700 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide text-amber-200">
                ⚡ LA MÉTHODE MAGIQUE SANS POSER L'OPÉRATION
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka leading-tight mt-2">
                Multiplier par 10, 100 et 1 000 en un clin d'œil !
              </h2>
              <p className="text-sky-100 text-sm sm:text-base font-medium mt-1">
                Comprends la règle du décalage des rangs et relève les 4 défis interactifs.
              </p>
            </div>

            {/* Interactive Golden Rule Demonstrator */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs uppercase font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    La Règle d'Or en Action
                  </span>
                  <h3 className="text-xl font-black font-fredoka text-slate-800 mt-1">
                    Comment ça marche ? Observe la magie des zéros :
                  </h3>
                </div>
              </div>

              {/* Live Simulator */}
              <div className="p-6 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 text-center space-y-4">
                <div className="text-xs sm:text-sm font-bold text-slate-600">Choisis un nombre de base :</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {[4, 35, 80, 420].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        playSound('click');
                        setDemoBase(n);
                      }}
                      className={`px-4 py-1.5 rounded-xl font-black text-sm transition ${
                        demoBase === n ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {n} {n === 80 ? '(déjà un 0 !)' : ''}
                    </button>
                  ))}
                </div>

                {/* Animated Calculation */}
                <div className="py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-black font-fredoka text-slate-800">
                  <span className="bg-white px-4 py-2 rounded-2xl border-2 border-slate-200 shadow-xs text-indigo-700">
                    {demoBase}
                  </span>
                  <span className="text-slate-400">×</span>
                  <span className="bg-white px-4 py-2 rounded-2xl border-2 border-amber-400 shadow-xs text-amber-600">
                    {demoPower.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-slate-400">=</span>
                  <div className="bg-white px-5 py-2 rounded-2xl border-2 border-emerald-500 shadow-md flex items-center">
                    <span className="text-indigo-700">{demoBase}</span>
                    <span className="text-emerald-500 font-extrabold tracking-widest animate-attach-zeros">
                      {demoPower === 10 ? '0' : demoPower === 100 ? '00' : '000'}
                    </span>
                  </div>
                </div>

                {/* 3 Powers buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                  {[
                    { p: 10, title: 'Multiplier par 10', tag: '+ 1 zéro', desc: 'On décale d’un rang vers la gauche et on ajoute un 0.' },
                    { p: 100, title: 'Multiplier par 100', tag: '+ 2 zéros', desc: 'On décale de 2 rangs et on ajoute deux 0 (00).' },
                    { p: 1000, title: 'Multiplier par 1 000', tag: '+ 3 zéros', desc: 'On décale de 3 rangs et on ajoute trois 0 (000).' },
                  ].map((item) => (
                    <button
                      key={item.p}
                      onClick={() => {
                        playSound('click');
                        setDemoPower(item.p);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition ${
                        demoPower === item.p ? 'border-amber-500 bg-amber-50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-black text-slate-900 text-sm mb-1">
                        <span>{item.title}</span>
                        <span className="text-xs bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">{item.tag}</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    <strong>Le Piège :</strong> Si le nombre de départ a déjà un zéro (ex: 50), on n'oublie pas son zéro d'origine ! 50 × 100 = 5 000 (1 + 2 = 3 zéros).
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Dedicated Modes */}
            <div className="space-y-4">
              <h3 className="text-lg font-black font-fredoka text-slate-800 flex items-center gap-2">
                <span>🎮</span> Les 4 Exercices Dédiés :
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">🪄</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Exercice 1 : Le Décalage Magique
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Écris directement le résultat. Pavé tactile interactif ou clavier physique.
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(1)}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer Décalage Magique ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">🧩</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Exercice 2 : L'Opération Mystère
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Trouve le nombre manquant ou le bon multiplicateur (ex: <strong>?</strong> × 100 = 7 200).
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(2)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer Opération Mystère ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">📦</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Exercice 3 : Le Laboratoire du Tri
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Range chaque carte dans son bon conteneur : « Famille ×10 », « Famille ×100 » ou « Famille ×1 000 ».
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(3)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer le Laboratoire ➔
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">🕵️‍♂️</span>
                    <h4 className="font-extrabold text-slate-900 text-base font-fredoka mb-1">
                      Exercice 4 : Détective des Zéros
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Analyse des égalités pièges d'élèves (ex: « 40 × 100 = 400 ? »).
                    </p>
                  </div>
                  <button
                    onClick={() => startGame(4)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-xs transition"
                  >
                    Lancer la Chasse aux Pièges ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: GAMEPLAY */}
        {screen === 'game' && currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    setScreen('landing');
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs transition"
                >
                  ✕ Quitter
                </button>
                <div>
                  <span className="text-xs font-black uppercase text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    {currentMode === 1
                      ? 'Décalage Magique'
                      : currentMode === 2
                      ? 'Opération Mystère'
                      : currentMode === 3
                      ? 'Laboratoire du Tri'
                      : 'Détective des Zéros'}
                  </span>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">Calcul {qIndex + 1} / 10</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-black block leading-none">Score</span>
                <span className="text-xl font-black font-fredoka text-indigo-600">{score}</span>
              </div>
            </div>

            {/* Prompt */}
            <div className="text-center py-5 sm:py-7 bg-slate-50 rounded-3xl border-2 border-slate-200 px-4 space-y-4">
              <div className="text-3xl sm:text-5xl font-black font-fredoka text-slate-800 tracking-tight leading-tight">
                {currentQ.displayPrompt}
              </div>

              {(currentMode === 1 || currentMode === 2) && (
                <div className="max-w-xs mx-auto">
                  <div className="w-full py-2.5 px-4 bg-white border-2 border-sky-400 rounded-2xl text-2xl sm:text-3xl font-black text-sky-950 text-center shadow-inner tracking-widest min-h-[54px] flex items-center justify-center">
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

            {/* Interaction by mode */}
            {currentMode === 1 || currentMode === 2 ? (
              <div className="space-y-2 max-w-sm mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleKeyPress(n)}
                      className="p-3 bg-white border-2 border-slate-200 hover:border-sky-400 active:bg-sky-50 rounded-2xl font-black text-xl text-slate-800 shadow-xs transition"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-xs transition"
                  >
                    ⌫ Effacer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="p-3 bg-white border-2 border-slate-200 hover:border-sky-400 active:bg-sky-50 rounded-2xl font-black text-xl text-slate-800 shadow-xs transition"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => submitAnswer()}
                    className="p-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-base rounded-2xl shadow transition"
                  >
                    OK ↵
                  </button>
                </div>
              </div>
            ) : currentMode === 3 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { p: 10, label: 'Famille × 10', tag: '+ 1 zéro' },
                  { p: 100, label: 'Famille × 100', tag: '+ 2 zéros' },
                  { p: 1000, label: 'Famille × 1 000', tag: '+ 3 zéros' },
                ].map((item) => (
                  <button
                    key={item.p}
                    onClick={() => submitAnswer(item.p)}
                    className="p-4 rounded-2xl border-2 border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-base shadow-sm transition active:scale-95 flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">📦</span>
                    <span>{item.label}</span>
                    <span className="text-xs text-purple-700 font-normal mt-0.5">{item.tag}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => submitAnswer(true)}
                  className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>✅</span> <span>C'est VRAI</span>
                </button>
                <button
                  type="button"
                  onClick={() => submitAnswer(false)}
                  className="p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-950 font-black text-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>❌</span> <span>C'est FAUX</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: RESULTS */}
        {screen === 'results' && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl space-y-7 max-w-2xl mx-auto">
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <div className="text-6xl">{score >= 8 ? '🏆' : '💪'}</div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Série Terminée !
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka text-slate-900 mt-2">
                Superbe Performance !
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="text-[11px] font-bold text-indigo-700 uppercase">Score</div>
                <div className="text-2xl sm:text-3xl font-black font-fredoka text-indigo-900 mt-1">{score} / 10</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-bold text-amber-700 uppercase">Erreurs</div>
                <div className="text-2xl sm:text-3xl font-black font-fredoka text-amber-900 mt-1">{mistakes.length}</div>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm font-fredoka flex items-center gap-1.5">
                  <span>🔍</span> Erreurs à revoir ({mistakes.length}) :
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mistakes.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border flex justify-between text-xs sm:text-sm">
                      <span className="font-bold">{m.prompt}</span>
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
                className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-2xl shadow transition"
              >
                🔄 Rejouer ce défi
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setScreen('landing');
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition"
              >
                🏠 Choisir un autre exercice
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: TROPHIES */}
        {screen === 'trophies' && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-9 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Palmarès des Zéros
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka mt-2">🏆 La Salle des 9 Trophées</h2>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setScreen('landing');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition"
              >
                ← Retour
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                { id: 1, title: 'Premier Zéro', desc: 'Réussir son premier calcul par 10, 100 ou 1000.', icon: '🌱', un: stats.totalCorrect >= 1 },
                { id: 2, title: 'Maître du ×10', desc: '10 multiplications réussies par 10.', icon: '⚡', un: stats.totalCorrect >= 5 },
                { id: 3, title: 'Expert des Deux Zéros', desc: '10 multiplications réussies par 100.', icon: '🪐', un: stats.totalCorrect >= 10 },
                { id: 4, title: 'Champion du Millier', desc: '10 multiplications réussies par 1 000.', icon: '🚀', un: stats.totalCorrect >= 15 },
                { id: 5, title: 'Sans-Faute Magique', desc: 'Obtenir 10/10 sans aucune erreur.', icon: '💎', un: stats.perfectTens >= 1 },
                { id: 6, title: 'Grand Centurion', desc: '100 calculs réussis au total.', icon: '💯', un: stats.totalCorrect >= 50 },
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
