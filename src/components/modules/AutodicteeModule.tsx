import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText, stopSpeech, pauseSpeech } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Volume2, Pause, Square, Sparkles, Check, RotateCcw, Lightbulb, Search, BookOpen, UserCheck } from 'lucide-react';

interface AutodicteeModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

const FULL_TEXT =
  "Regardez autour de vous, les arbres, le ciel, les cailloux, les rivières, les insectes, vos animaux de compagnie, les astres, ce qu'il y a dans votre assiette, même ! Tout ! Tout ce qui vous procure une sensation, vous émerveille, vous fait rire, vous met des gargouillis dans le ventre ou des fourmis dans les jambes. Cultivez vos petits plaisirs (...)";

const DIFFICULT_WORDS = [
  "cailloux",
  "rivières",
  "insectes",
  "animaux",
  "compagnie",
  "assiette",
  "procure",
  "émerveille",
  "gargouillis",
  "fourmis",
  "Cultivez",
];

const SENTENCES_LIST = [
  "Regardez autour de vous, les arbres, le ciel, les cailloux, les rivières, les insectes, vos animaux de compagnie, les astres, ce qu'il y a dans votre assiette, même !",
  "Tout !",
  "Tout ce qui vous procure une sensation, vous émerveille, vous fait rire, vous met des gargouillis dans le ventre ou des fourmis dans les jambes.",
  "Cultivez vos petits plaisirs (...)",
];

interface WordToken {
  id: number;
  raw: string;
  cleanWord: string;
  trailingPunct: string;
  isBlank: boolean;
}

export const AutodicteeModule: React.FC<AutodicteeModuleProps> = ({ onHome, onComplete }) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Parse words
  const initialTokens = useMemo<WordToken[]>(() => {
    const rawTokens = FULL_TEXT.split(' ');
    return rawTokens.map((raw, idx) => {
      const clean = raw.replace(/^[^a-zA-ZÀ-ÿ0-9']+|[^a-zA-ZÀ-ÿ0-9'.()]+$/g, '');
      const trailing = raw.replace(/^.*?([,;!?.()]+)$/, '$1');
      const hasTrailing = trailing !== raw;
      const isDiff = DIFFICULT_WORDS.some((dw) => dw.toLowerCase() === clean.toLowerCase());
      return {
        id: idx,
        raw,
        cleanWord: clean,
        trailingPunct: hasTrailing ? trailing : '',
        isBlank: isDiff,
      };
    });
  }, []);

  const [tokens, setTokens] = useState<WordToken[]>(initialTokens);

  // Tab 1: Recopie
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [copyInput, setCopyInput] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<{
    show: boolean;
    isSuccess: boolean;
    percent: number;
    correctCount: number;
    tokensDiff: { text: string; status: 'ok' | 'case' | 'error' | 'extra'; expected?: string }[];
  } | null>(null);

  // Tab 2: Cloze
  const [clozeSubMode, setClozeSubMode] = useState<'parent' | 'child'>('parent');
  const [childAnswers, setChildAnswers] = useState<Record<number, string>>({});
  const [clozeResult, setClozeResult] = useState<{
    tested: boolean;
    percent: number;
    correct: number;
    total: number;
    details: Record<number, { isOk: boolean; expected: string }>;
  } | null>(null);

  // Tab 3: Dashes
  const [dashAnswers, setDashAnswers] = useState<Record<number, string>>({});
  const [dashFeedback, setDashFeedback] = useState<{
    tested: boolean;
    percent: number;
    correct: number;
    total: number;
    results: Record<number, boolean>;
  } | null>(null);

  // Tab 4: Final Memory
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [memoryInput, setMemoryInput] = useState<string>('');
  const [memoryReport, setMemoryReport] = useState<{
    tested: boolean;
    scorePercent: number;
    note20: string;
    diffs: { word: string; status: 'ok' | 'approx' | 'error' | 'extra'; expected?: string }[];
  } | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const addStars = (n: number) => {
    setStars((prev) => prev + n);
  };

  const handleSpeakAll = () => {
    stopSpeech();
    setIsSpeaking(true);
    speakText(FULL_TEXT, speechRate, () => setIsSpeaking(false));
  };

  const handleSpeakSentence = (sentence: string) => {
    stopSpeech();
    setIsSpeaking(true);
    speakText(sentence, speechRate, () => setIsSpeaking(false));
  };

  // Tab 1 verification
  const verifyCopy = () => {
    const trimmed = copyInput.trim();
    if (!trimmed) {
      playSound('wrong');
      return;
    }

    const modelTokens = FULL_TEXT.trim().split(/\s+/);
    const userTokens = trimmed.split(/\s+/);

    let correctCount = 0;
    const tokensDiff: { text: string; status: 'ok' | 'case' | 'error' | 'extra'; expected?: string }[] = [];

    userTokens.forEach((token, idx) => {
      if (idx < modelTokens.length) {
        const expected = modelTokens[idx];
        if (token === expected) {
          correctCount++;
          tokensDiff.push({ text: token, status: 'ok' });
        } else if (token.toLowerCase() === expected.toLowerCase()) {
          tokensDiff.push({ text: token, status: 'case', expected });
        } else {
          tokensDiff.push({ text: token, status: 'error', expected });
        }
      } else {
        tokensDiff.push({ text: token, status: 'extra' });
      }
    });

    const percent = Math.round((correctCount / modelTokens.length) * 100);
    const isSuccess = percent >= 95 && userTokens.length >= modelTokens.length;

    if (isSuccess) {
      playSound('success');
      fireConfetti();
      addStars(3);
      setMissionCompleted('autodictee1');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }

    setCopyFeedback({
      show: true,
      isSuccess,
      percent,
      correctCount,
      tokensDiff,
    });
  };

  // Tab 2 Presets
  const applyPreset = (preset: 'difficult' | 'third' | 'half' | 'none' | 'all') => {
    playSound('click');
    setTokens((prev) =>
      prev.map((w, idx) => {
        let isBlank = false;
        if (preset === 'difficult') {
          isBlank = DIFFICULT_WORDS.some((dw) => dw.toLowerCase() === w.cleanWord.toLowerCase());
        } else if (preset === 'third') {
          isBlank = idx % 3 === 0;
        } else if (preset === 'half') {
          isBlank = idx % 2 === 0;
        } else if (preset === 'none') {
          isBlank = false;
        } else if (preset === 'all') {
          isBlank = true;
        }
        return { ...w, isBlank };
      })
    );
  };

  const toggleTokenBlank = (id: number) => {
    playSound('click');
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isBlank: !t.isBlank } : t))
    );
  };

  const giveFirstLetterAll = () => {
    playSound('click');
    setChildAnswers((prev) => {
      const next = { ...prev };
      tokens.forEach((t) => {
        if (t.isBlank && (!next[t.id] || next[t.id].trim() === '')) {
          next[t.id] = t.cleanWord.charAt(0);
        }
      });
      return next;
    });
  };

  const verifyClozeAnswers = () => {
    const blankTokens = tokens.filter((t) => t.isBlank);
    if (blankTokens.length === 0) {
      alert("Aucun mot n'a été masqué dans l'Espace Parents ! Activez quelques trous pour vous entraîner.");
      return;
    }

    let correct = 0;
    const details: Record<number, { isOk: boolean; expected: string }> = {};

    blankTokens.forEach((t) => {
      const typed = (childAnswers[t.id] || '').trim().toLowerCase();
      const expected = t.cleanWord.toLowerCase();
      const isOk = typed === expected;
      if (isOk) correct++;
      details[t.id] = { isOk, expected: t.cleanWord };
    });

    const percent = Math.round((correct / blankTokens.length) * 100);
    if (percent === 100) {
      playSound('success');
      fireGrandCelebration();
      addStars(4);
      setMissionCompleted('autodictee1');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }

    setClozeResult({
      tested: true,
      percent,
      correct,
      total: blankTokens.length,
      details,
    });
  };

  const retryOnlyClozeErrors = () => {
    playSound('click');
    if (!clozeResult) return;
    setChildAnswers((prev) => {
      const next = { ...prev };
      tokens.forEach((t) => {
        if (t.isBlank && clozeResult.details[t.id] && !clozeResult.details[t.id].isOk) {
          next[t.id] = '';
        }
      });
      return next;
    });
    setClozeResult(null);
  };

  // Tab 3 Dashes
  const revealDashHint = () => {
    playSound('click');
    const unfilled = tokens.filter((t) => {
      const ans = dashAnswers[t.id] || '';
      return ans.length < t.cleanWord.length;
    });

    if (unfilled.length > 0) {
      const target = unfilled[Math.floor(Math.random() * unfilled.length)];
      const currentVal = dashAnswers[target.id] || '';
      const nextChar = target.cleanWord.substring(0, currentVal.length + 1);
      setDashAnswers((prev) => ({ ...prev, [target.id]: nextChar }));
    }
  };

  const verifyDash = () => {
    let correct = 0;
    const results: Record<number, boolean> = {};

    tokens.forEach((t) => {
      const typed = (dashAnswers[t.id] || '').trim().toLowerCase();
      const isOk = typed === t.cleanWord.toLowerCase();
      if (isOk) correct++;
      results[t.id] = isOk;
    });

    const percent = Math.round((correct / tokens.length) * 100);
    if (percent === 100) {
      playSound('success');
      fireGrandCelebration();
      addStars(4);
      setMissionCompleted('autodictee1');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }

    setDashFeedback({
      tested: true,
      percent,
      correct,
      total: tokens.length,
      results,
    });
  };

  // Tab 4 Final Memory
  const handleDictateStep = () => {
    const text = SENTENCES_LIST[currentSentenceIdx];
    handleSpeakSentence(text);
    setCurrentSentenceIdx((prev) => (prev + 1) % SENTENCES_LIST.length);
  };

  const evaluateFinal = () => {
    const trimmed = memoryInput.trim();
    if (!trimmed) {
      playSound('wrong');
      return;
    }

    const modelWords = FULL_TEXT.trim().split(/\s+/);
    const userWords = trimmed.split(/\s+/);

    let matchedCount = 0;
    const diffs: { word: string; status: 'ok' | 'approx' | 'error' | 'extra'; expected?: string }[] = [];

    userWords.forEach((word, idx) => {
      if (idx < modelWords.length) {
        const expected = modelWords[idx];
        if (word === expected) {
          matchedCount += 1;
          diffs.push({ word, status: 'ok' });
        } else if (word.toLowerCase() === expected.toLowerCase()) {
          matchedCount += 0.75;
          diffs.push({ word, status: 'approx', expected });
        } else {
          diffs.push({ word, status: 'error', expected });
        }
      } else {
        diffs.push({ word, status: 'extra' });
      }
    });

    const scorePercent = Math.min(100, Math.round((matchedCount / modelWords.length) * 100));
    const note20 = (scorePercent / 5).toFixed(1);

    if (scorePercent >= 85) {
      playSound('success');
      fireGrandCelebration();
      addStars(5);
      setMissionCompleted('autodictee1');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }

    setMemoryReport({
      tested: true,
      scorePercent,
      note20,
      diffs,
    });
  };

  const resetFinalTest = () => {
    playSound('click');
    setMemoryInput('');
    setMemoryReport(null);
    setCurrentSentenceIdx(0);
  };

  // Render Highlighted Model Text
  const renderHighlightedModel = () => {
    if (!showLegend) {
      return FULL_TEXT;
    }

    // Split text into tokens and highlight specific types
    const rawTokens = FULL_TEXT.split(' ');
    return rawTokens.map((token, i) => {
      const clean = token.replace(/[^a-zA-ZÀ-ÿ]/g, '');
      const lower = clean.toLowerCase();

      let bgClass = '';
      if (['cailloux', 'animaux'].includes(lower)) {
        bgClass = 'bg-rose-200 text-rose-950 font-bold px-1 rounded';
      } else if (['regardez', 'cultivez'].includes(lower)) {
        bgClass = 'bg-indigo-200 text-indigo-950 font-bold px-1 rounded';
      } else if (['émerveille', 'gargouillis', 'fourmis', 'assiette', 'compagnie', 'rivières', 'insectes'].includes(lower)) {
        bgClass = 'bg-emerald-200 text-emerald-950 font-bold px-1 rounded';
      }

      return (
        <React.Fragment key={i}>
          {bgClass ? <span className={bgClass}>{token}</span> : token}{' '}
        </React.Fragment>
      );
    });
  };

  const blankCount = tokens.filter((t) => t.isBlank).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        title="Autodictée n°1 : La confiture de Berbéranza"
        badgeText="Français • CM1"
        badgeBg="bg-amber-400 text-amber-950"
        onHome={onHome}
        rightExtra={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-amber-300 bg-black/20 px-2.5 py-1 rounded-full">
              ⭐ {stars} étoiles
            </span>
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20 text-xs">
              <button
                onClick={handleSpeakAll}
                title="Écouter le texte complet"
                className={`p-1.5 rounded-lg hover:bg-white/20 transition ${isSpeaking ? 'bg-amber-400 text-amber-950 font-bold' : ''}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={pauseSpeech} title="Pause / Reprendre" className="p-1.5 rounded-lg hover:bg-white/20 transition">
                <Pause className="w-4 h-4" />
              </button>
              <button onClick={() => { stopSpeech(); setIsSpeaking(false); }} title="Arrêter" className="p-1.5 rounded-lg hover:bg-white/20 transition">
                <Square className="w-4 h-4" />
              </button>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="bg-transparent text-white font-bold text-xs ml-1 outline-none cursor-pointer"
              >
                <option value="0.75" className="text-slate-900">0.75x</option>
                <option value="0.9" className="text-slate-900">0.9x</option>
                <option value="1.0" className="text-slate-900">1.0x</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Tabs */}
      <div className="bg-sky-700 text-white shadow-inner">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 1, label: '✍️ 1. Recopier le modèle' },
            { id: 2, label: '🎯 2. Dictée à trous' },
            { id: 3, label: '📏 3. Écrire avec les tirets' },
            { id: 4, label: '🧠 4. Sans aide (De mémoire)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-sky-900 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: RECOPIER */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                    Étape 1 • Observation et mémorisation
                  </span>
                  <h2 className="text-2xl font-black font-fredoka text-slate-800 mt-1">Le Modèle Sous les Yeux</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeakSentence(FULL_TEXT)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 flex items-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Écouter le texte
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setShowLegend(!showLegend);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 ${
                      showLegend
                        ? 'bg-amber-200 text-amber-900 border-amber-400'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" /> Pièges & Accents
                  </button>
                </div>
              </div>

              {/* Seyes Paper Display */}
              <div className="mt-4 p-6 sm:p-8 seyes-paper rounded-2xl border border-slate-300 text-slate-800 text-lg sm:text-2xl leading-[32px] font-school select-none">
                <p>{renderHighlightedModel()}</p>
                <div className="mt-4 pt-2 text-right text-xs sm:text-sm font-sans font-bold text-slate-500 italic">
                  — Extrait de « La confiture de Berbéranza » de Florence Médina
                </div>
              </div>

              {showLegend && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="font-black text-rose-600 font-mono">cailloux, animaux</span> : pluriels particuliers en -x.
                  </div>
                  <div>
                    <span className="font-black text-indigo-600 font-mono">Regardez, Cultivez</span> : impératif pluriel en -ez.
                  </div>
                  <div>
                    <span className="font-black text-emerald-700 font-mono">émerveille, gargouillis</span> : lettres doubles (ll) & -is.
                  </div>
                </div>
              )}
            </div>

            {/* Recopie Space */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-fredoka text-slate-800 flex items-center gap-2">
                  <span>✏️</span> À ton tour de recopier fidèlement :
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {copyInput.trim() ? copyInput.trim().split(/\s+/).length : 0} / {tokens.length} mots
                </span>
              </div>

              <textarea
                rows={5}
                value={copyInput}
                onChange={(e) => setCopyInput(e.target.value)}
                placeholder="Clique ici et commence à recopier le texte mot à mot, sans oublier les majuscules, les accents et la ponctuation..."
                className="w-full p-5 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 font-school text-xl sm:text-2xl text-slate-800 placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 outline-none transition leading-relaxed"
              />

              {copyFeedback && copyFeedback.show && (
                <div
                  className={`p-4 rounded-2xl border text-sm font-semibold space-y-2 ${
                    copyFeedback.isSuccess
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                      : 'border-amber-300 bg-amber-50 text-amber-950'
                  }`}
                >
                  <p className="font-bold">
                    {copyFeedback.isSuccess ? '🎉 Bravo ! Copie parfaite !' : '👍 Beau travail ! Analyse de ta copie :'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 leading-relaxed p-3 bg-white rounded-xl border border-slate-200 font-school text-xl">
                    {copyFeedback.tokensDiff.map((td, i) => {
                      if (td.status === 'ok') {
                        return (
                          <span key={i} className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                            {td.text}
                          </span>
                        );
                      }
                      if (td.status === 'case') {
                        return (
                          <span key={i} className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            {td.text} <small className="text-slate-500 font-sans">({td.expected})</small>
                          </span>
                        );
                      }
                      if (td.status === 'error') {
                        return (
                          <span key={i} className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                            {td.text} <small className="text-slate-500 font-sans">({td.expected})</small>
                          </span>
                        );
                      }
                      return (
                        <span key={i} className="text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded line-through">
                          {td.text}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={verifyCopy}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Vérifier ma copie
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setCopyInput('');
                      setCopyFeedback(null);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition"
                  >
                    Effacer
                  </button>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab(2);
                  }}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow transition flex items-center gap-2"
                >
                  Passer à l'Exercice 2 : Dictée à trous ➡️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DICTÉE À TROUS */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-white/20 rounded-2xl">👨‍👩‍👧</span>
                <div>
                  <span className="text-xs uppercase font-black tracking-widest text-amber-100 bg-black/15 px-2.5 py-0.5 rounded-full">
                    Outil Pédagogique Collaboratif
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-fredoka">Dictée à trous personnalisable</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm">
                <button
                  onClick={() => {
                    playSound('click');
                    setClozeSubMode('parent');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    clozeSubMode === 'parent' ? 'bg-white text-slate-800 shadow' : 'text-white hover:bg-white/10'
                  }`}
                >
                  ⚙️ Espace Parents (Préparer)
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setClozeSubMode('child');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    clozeSubMode === 'child' ? 'bg-white text-slate-800 shadow' : 'text-white hover:bg-white/10'
                  }`}
                >
                  🎒 Espace Enfant (S'entraîner)
                </button>
              </div>
            </div>

            {/* Parent View */}
            {clozeSubMode === 'parent' ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-fredoka text-slate-800 flex items-center gap-2">
                      <span>🛠️</span> Cliquez sur les mots à masquer pour votre enfant :
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Les mots en <strong className="text-amber-700">orange</strong> deviendront des trous à compléter.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                    <span>Total : <strong className="text-slate-800">{tokens.length}</strong></span>
                    <span>•</span>
                    <span className="text-amber-700">✏️ <strong>{blankCount}</strong> trous</span>
                    <span>•</span>
                    <span className="text-emerald-700">👁️ <strong>{tokens.length - blankCount}</strong> visibles</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mr-1">Préréglages :</span>
                  <button onClick={() => applyPreset('difficult')} className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black rounded-xl border border-amber-300 transition">
                    🎯 Mots clés difficiles (11)
                  </button>
                  <button onClick={() => applyPreset('third')} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition">
                    🔢 1 mot sur 3
                  </button>
                  <button onClick={() => applyPreset('half')} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition">
                    ½ 1 mot sur 2
                  </button>
                  <button onClick={() => applyPreset('none')} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition">
                    👁️ Tout afficher
                  </button>
                  <button onClick={() => applyPreset('all')} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold rounded-xl border border-rose-300 transition">
                    ✏️ Tout masquer
                  </button>
                </div>

                {/* Interactive Tokens */}
                <div className="p-6 seyes-paper rounded-2xl border border-slate-300 flex flex-wrap gap-2 items-center leading-relaxed">
                  {tokens.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleTokenBlank(w.id)}
                      className={`px-3 py-1.5 rounded-xl text-base sm:text-xl font-school font-bold transition transform active:scale-95 flex items-center gap-1 ${
                        w.isBlank
                          ? 'border-2 border-amber-400 bg-amber-100 text-amber-900 shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{w.cleanWord}</span>
                      <span className="text-xs font-sans">{w.isBlank ? '✏️' : '👁️'}</span>
                      {w.trailingPunct && <span className="text-slate-500 font-sans">{w.trailingPunct}</span>}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    💡 Astuce : Commencez avec les mots clés difficiles avant d'augmenter le nombre de trous !
                  </div>
                  <button
                    onClick={() => {
                      playSound('click');
                      setClozeSubMode('child');
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg transition"
                  >
                    🚀 Lancer l'exercice pour l'enfant
                  </button>
                </div>
              </div>
            ) : (
              /* Child View */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Espace Enfant • Complète les trous
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-fredoka text-slate-800 mt-1">À toi de jouer !</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={giveFirstLetterAll}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> Indice (1ère lettre)
                    </button>
                    <button
                      onClick={() => handleSpeakSentence(FULL_TEXT)}
                      className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-300 transition flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Écouter la dictée
                    </button>
                    <button
                      onClick={() => {
                        playSound('click');
                        setClozeSubMode('parent');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                    >
                      ⚙️ Régler les trous
                    </button>
                  </div>
                </div>

                {/* Child Seyes Book */}
                <div className="p-6 sm:p-8 seyes-paper rounded-2xl border border-slate-300 text-slate-800 text-lg sm:text-2xl font-school leading-[42px]">
                  {tokens.map((w) => {
                    if (w.isBlank) {
                      const userVal = childAnswers[w.id] || '';
                      const isTested = clozeResult && clozeResult.details[w.id];
                      const isOk = isTested ? clozeResult.details[w.id].isOk : null;

                      let inputClasses =
                        'px-2 py-0.5 text-center font-school text-lg sm:text-2xl font-bold rounded-xl transition focus:outline-none ';
                      if (isOk === true) {
                        inputClasses += 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950';
                      } else if (isOk === false) {
                        inputClasses += 'bg-rose-100 border-2 border-rose-500 text-rose-950';
                      } else {
                        inputClasses += 'bg-white border-2 border-dashed border-amber-400 focus:border-amber-600 focus:bg-amber-50 text-amber-950 shadow-inner';
                      }

                      const charCount = Math.max(w.cleanWord.length, 3);
                      return (
                        <span key={w.id} className="inline-flex items-center mx-1 my-1 align-baseline relative">
                          {isOk === false && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-[11px] font-sans font-bold px-2 py-0.5 rounded-md shadow whitespace-nowrap z-10">
                              {w.cleanWord}
                            </span>
                          )}
                          <input
                            type="text"
                            value={userVal}
                            autoComplete="off"
                            spellCheck={false}
                            style={{ width: `${charCount * 1.3 + 1.2}rem` }}
                            onChange={(e) =>
                              setChildAnswers((prev) => ({ ...prev, [w.id]: e.target.value }))
                            }
                            className={inputClasses}
                          />
                          {w.trailingPunct && (
                            <span className="text-slate-800 ml-0.5 select-none font-school">{w.trailingPunct}</span>
                          )}
                        </span>
                      );
                    }
                    return (
                      <span key={w.id} className="select-none font-school">
                        {w.raw}{' '}
                      </span>
                    );
                  })}
                </div>

                {/* Score & Correction Result Panel */}
                {clozeResult && (
                  <div
                    className={`p-5 rounded-2xl border-2 space-y-2 ${
                      clozeResult.percent === 100
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                        : 'border-amber-300 bg-amber-50 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg font-fredoka">
                          Score : {clozeResult.percent}% ({clozeResult.correct} / {clozeResult.total} réussis)
                        </h4>
                        <p className="text-xs sm:text-sm">
                          {clozeResult.percent === 100
                            ? 'Félicitations ! Un sans-faute parfait sur tous les mots masqués !'
                            : 'Regarde les étiquettes rouges au-dessus des mots pour corriger tes erreurs.'}
                        </p>
                      </div>
                      <span className="text-3xl">{clozeResult.percent === 100 ? '🌟' : '💪'}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={verifyClozeAnswers}
                      className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Valider mes réponses
                    </button>
                    {clozeResult && clozeResult.percent < 100 && (
                      <button
                        onClick={retryOnlyClozeErrors}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl transition flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Corriger mes erreurs uniquement
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveTab(3);
                    }}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow transition"
                  >
                    Exercice 3 : Écrire avec les tirets ➡️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TIRETS */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    Étape 3 • Guide lettre par lettre
                  </span>
                  <h2 className="text-2xl font-black font-fredoka text-slate-800 mt-1">Le Guide des Tirets</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={revealDashHint}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Révéler une lettre secrète
                  </button>
                  <button
                    onClick={() => handleSpeakSentence(FULL_TEXT)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-300 flex items-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Écouter
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chaque mot est représenté par des tirets correspondant <strong>exactement à son nombre de lettres</strong>. Remplis les cases pour mémoriser la forme des mots !
              </p>

              {/* Dashes Grid */}
              <div className="p-6 sm:p-8 seyes-paper rounded-2xl border border-slate-300 text-slate-800 flex flex-wrap gap-x-2 gap-y-3 items-center text-lg sm:text-2xl font-school">
                {tokens.map((w) => {
                  const val = dashAnswers[w.id] || '';
                  const tested = dashFeedback && dashFeedback.results[w.id] !== undefined;
                  const isOk = tested ? dashFeedback.results[w.id] : null;

                  let borderStyle = 'border-slate-300 focus:border-indigo-500 text-indigo-950 bg-white';
                  if (isOk === true) {
                    borderStyle = 'border-emerald-500 bg-emerald-100 text-emerald-950';
                  } else if (isOk === false) {
                    borderStyle = 'border-rose-400 bg-rose-100 text-rose-950';
                  }

                  const charCount = Math.max(w.cleanWord.length, 3);
                  const placeholderDashes = '_ '.repeat(w.cleanWord.length).trim();

                  return (
                    <div key={w.id} className="inline-flex items-center my-1">
                      <input
                        type="text"
                        maxLength={w.cleanWord.length}
                        placeholder={placeholderDashes}
                        value={val}
                        style={{ width: `${charCount * 1.35 + 1.2}rem` }}
                        onChange={(e) => setDashAnswers((prev) => ({ ...prev, [w.id]: e.target.value }))}
                        className={`px-2 py-0.5 text-center font-school text-lg sm:text-2xl font-bold border-2 rounded-xl focus:outline-none shadow-xs placeholder:font-mono placeholder:text-xs placeholder:text-slate-400 transition ${borderStyle}`}
                      />
                      {w.trailingPunct && (
                        <span className="text-slate-700 ml-1 font-bold font-school">{w.trailingPunct}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {dashFeedback && (
                <div
                  className={`p-4 rounded-2xl border text-sm font-bold ${
                    dashFeedback.percent === 100
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                      : 'border-amber-300 bg-amber-50 text-amber-950'
                  }`}
                >
                  {dashFeedback.percent === 100
                    ? '🎉 Félicitations ! 100% de réussite ! Tous les mots correspondent parfaitement au gabarit.'
                    : `💪 Tu y es presque ! ${dashFeedback.correct} sur ${dashFeedback.total} mots exacts. Vérifie les cases en rouge.`}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={verifyDash}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Vérifier mes mots
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setDashAnswers({});
                      setDashFeedback(null);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition"
                  >
                    Recommencer
                  </button>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab(4);
                  }}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow transition"
                >
                  Passer au Défi Final Sans Aide ➡️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DE MÉMOIRE (LE GRAND DÉFI) */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Étape 4 • L'Autodictée Finale
                  </span>
                  <h2 className="text-2xl font-black font-fredoka text-slate-800 mt-1">Écrire Totalement de Mémoire</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDictateStep}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow flex items-center gap-2 transition"
                  >
                    <span>🗣️</span> Dictée phrase par phrase ({currentSentenceIdx + 1}/4)
                  </button>
                  <button
                    onClick={() => handleSpeakSentence(FULL_TEXT)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Tout écouter
                  </button>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-xs sm:text-sm">
                🔒 <strong>Le modèle est complètement masqué.</strong> Récite dans ta tête et écris le texte de Florence Médina dans le cahier ci-dessous. Tu pourras ensuite comparer mot à mot ta version avec le modèle original !
              </div>

              {/* Free Writing Seyes Paper */}
              <textarea
                rows={7}
                value={memoryInput}
                onChange={(e) => setMemoryInput(e.target.value)}
                placeholder="Regardez autour de vous..."
                className="w-full p-6 seyes-paper rounded-2xl border-2 border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 font-school text-xl sm:text-2xl text-slate-800 outline-none transition leading-[36px]"
              />

              {memoryReport && (
                <div
                  className={`p-6 rounded-3xl border-2 space-y-4 shadow-md ${
                    memoryReport.scorePercent >= 85
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                      : 'border-amber-300 bg-amber-50 text-amber-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
                    <div>
                      <span className="text-xs uppercase font-black tracking-widest px-3 py-1 rounded-full bg-white/60">
                        {memoryReport.scorePercent >= 85 ? "Diplôme d'Autodictée Réussie" : 'Encouragements'}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black font-fredoka mt-1">
                        {memoryReport.scorePercent >= 85 ? 'Magnifique travail ! 🎉' : 'Bel effort ! Continue ainsi 👍'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-black font-fredoka text-emerald-700">
                        {memoryReport.note20} / 20
                      </span>
                      <div className="text-xs font-bold text-slate-600">{memoryReport.scorePercent}% de conformité</div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold">Comparaison détaillée mot à mot de ton écrit :</p>

                  <div className="flex flex-wrap gap-1.5 leading-relaxed p-4 bg-white rounded-2xl border border-slate-300 font-school text-xl sm:text-2xl">
                    {memoryReport.diffs.map((df, i) => {
                      if (df.status === 'ok') {
                        return (
                          <span key={i} className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 font-bold">
                            {df.word}
                          </span>
                        );
                      }
                      if (df.status === 'approx') {
                        return (
                          <span key={i} className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
                            {df.word} <small className="text-xs font-sans text-slate-500">({df.expected})</small>
                          </span>
                        );
                      }
                      if (df.status === 'error') {
                        return (
                          <span key={i} className="bg-rose-100 text-rose-950 px-2 py-0.5 rounded-lg border border-rose-300">
                            {df.word} <small className="text-xs font-sans text-slate-500">({df.expected})</small>
                          </span>
                        );
                      }
                      return (
                        <span key={i} className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg line-through">
                          {df.word}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={evaluateFinal}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Corriger mon autodictée finale
                </button>

                <button onClick={resetFinalTest} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                  Effacer et recommencer l'épreuve
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
