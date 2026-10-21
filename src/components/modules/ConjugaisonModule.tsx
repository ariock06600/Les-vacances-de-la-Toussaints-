import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../Navbar';
import { playSound } from '../../utils/audio';
import { fireGrandCelebration } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Sparkles, RotateCcw, Check, ArrowRight, X } from 'lucide-react';

interface ConjugaisonModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

interface VerbData {
  id: string;
  name: string;
  forms: Record<string, string>;
  sentences: Record<string, string>;
}

const PRONOUNS = [
  { key: 'je', label: "je / j'", display: 'je' },
  { key: 'tu', label: 'tu', display: 'tu' },
  { key: 'il', label: 'il / elle / on', display: 'il' },
  { key: 'nous', label: 'nous', display: 'nous' },
  { key: 'vous', label: 'vous', display: 'vous' },
  { key: 'ils', label: 'ils / elles', display: 'ils' },
];

const VERBS_DB: Record<string, VerbData> = {
  etre: {
    id: 'etre',
    name: 'être',
    forms: { je: 'suis', tu: 'es', il: 'est', nous: 'sommes', vous: 'êtes', ils: 'sont' },
    sentences: {
      je: 'Actuellement, je ___ très attentif en classe.',
      tu: 'Tu ___ toujours prêt pour de nouvelles aventures.',
      il: 'Ce matin, le maître ___ ravi de notre travail.',
      nous: 'Nous ___ heureux de partager ce moment ensemble.',
      vous: 'Vous ___ de très bons élèves.',
      ils: 'Les oiseaux ___ perchés sur la plus haute branche.',
    },
  },
  avoir: {
    id: 'avoir',
    name: 'avoir',
    forms: { je: 'ai', tu: 'as', il: 'a', nous: 'avons', vous: 'avez', ils: 'ont' },
    sentences: {
      je: "J'___ hâte de découvrir la surprise de ce soir.",
      tu: 'Tu ___ une belle écriture sur ton cahier.',
      il: 'Mon voisin ___ un nouveau vélo rouge.',
      nous: "Nous ___ beaucoup d'énergie pour cette journée.",
      vous: 'Vous ___ la bonne réponse à cette question.',
      ils: 'Les enfants ___ faim après cette longue marche.',
    },
  },
  aller: {
    id: 'aller',
    name: 'aller',
    forms: { je: 'vais', tu: 'vas', il: 'va', nous: 'allons', vous: 'allez', ils: 'vont' },
    sentences: {
      je: "Tous les matins, je ___ à l'école à pied.",
      tu: 'Tu ___ chez le médecin cet après-midi.',
      il: 'Le train ___ à toute allure vers la capitale.',
      nous: 'Ce week-end, nous ___ faire un pique-nique en forêt.',
      vous: 'Vous ___ souvent à la piscine municipale.',
      ils: 'Ces bateaux ___ vers le grand large.',
    },
  },
  dire: {
    id: 'dire',
    name: 'dire',
    forms: { je: 'dis', tu: 'dis', il: 'dit', nous: 'disons', vous: 'dites', ils: 'disent' },
    sentences: {
      je: 'Je ___ toujours la vérité à mes parents.',
      tu: 'Tu ___ bonjour poliment aux personnes que tu croises.',
      il: 'Le présentateur ___ les dernières nouvelles à la radio.',
      nous: 'Nous ___ un grand merci pour ce bon repas.',
      vous: 'Que ___ -vous de cette nouvelle proposition ?',
      ils: "Les témoins ___ exactement ce qu'ils ont observé.",
    },
  },
  faire: {
    id: 'faire',
    name: 'faire',
    forms: { je: 'fais', tu: 'fais', il: 'fait', nous: 'faisons', vous: 'faites', ils: 'font' },
    sentences: {
      je: 'Le samedi, je ___ du sport avec mon frère.',
      tu: 'Tu ___ attention en traversant la rue.',
      il: 'Aujourd’hui, il ___ un soleil magnifique.',
      nous: 'Nous ___ un gâteau au chocolat pour le goûter.',
      vous: 'Vous ___ de gros progrès en conjugaison.',
      ils: 'Ces enfants ___ une course dans la cour de récréation.',
    },
  },
  voir: {
    id: 'voir',
    name: 'voir',
    forms: { je: 'vois', tu: 'vois', il: 'voit', nous: 'voyons', vous: 'voyez', ils: 'voient' },
    sentences: {
      je: 'De ma fenêtre, je ___ les cimes enneigées.',
      tu: 'Tu ___ très bien sans tes lunettes aujourd’hui.',
      il: 'Le renard ___ une proie au loin dans les champs.',
      nous: 'Nous ___ rarement des étoiles filantes en ville.',
      vous: 'Est-ce que vous ___ le panneau sur le bord du chemin ?',
      ils: 'Ces deux amis se ___ chaque jour à la récréation.',
    },
  },
  partir: {
    id: 'partir',
    name: 'partir',
    forms: { je: 'pars', tu: 'pars', il: 'part', nous: 'partons', vous: 'partez', ils: 'partent' },
    sentences: {
      je: 'Dès que la cloche sonne, je ___ à la maison.',
      tu: 'Tu ___ en vacances à la mer demain matin.',
      il: "L'autobus ___ à huit heures précises de la place.",
      nous: 'Nous ___ explorer le sentier de randonnée.',
      vous: 'À quelle heure ___ -vous pour la gare ?',
      ils: 'Les randonneurs ___ de bon matin à la fraîche.',
    },
  },
  prendre: {
    id: 'prendre',
    name: 'prendre',
    forms: { je: 'prends', tu: 'prends', il: 'prend', nous: 'prenons', vous: 'prenez', ils: 'prennent' },
    sentences: {
      je: 'Chaque matin, je ___ un chocolat chaud au petit-déjeuner.',
      tu: 'Tu ___ ton manteau car il fait froid dehors.',
      il: 'Le photographe ___ un joli cliché du coucher de soleil.',
      nous: 'Nous ___ le temps de bien relire nos phrases.',
      vous: "Vous ___ une feuille double pour l'évaluation.",
      ils: 'Ces élèves ___ leur cartable avant de sortir.',
    },
  },
  venir: {
    id: 'venir',
    name: 'venir',
    forms: { je: 'viens', tu: 'viens', il: 'vient', nous: 'venons', vous: 'venez', ils: 'viennent' },
    sentences: {
      je: "Je ___ te voir dès que j'ai terminé mes devoirs.",
      tu: 'Tu ___ souvent jouer dans notre jardin.',
      il: 'Le facteur ___ déposer le courrier dans la boîte.',
      nous: "Nous ___ d'apprendre une excellente nouvelle.",
      vous: 'D’où ___ -vous avec tous ces paquets ?',
      ils: 'Mes cousins ___ passer tout le week-end chez nous.',
    },
  },
  vouloir: {
    id: 'vouloir',
    name: 'vouloir',
    forms: { je: 'veux', tu: 'veux', il: 'veut', nous: 'voulons', vous: 'voulez', ils: 'veulent' },
    sentences: {
      je: 'Je ___ apprendre à bien conjuguer tous mes verbes.',
      tu: 'Tu ___ un morceau de tarte aux pommes ?',
      il: 'Mon petit frère ___ écouter une belle histoire.',
      nous: 'Nous ___ réussir notre exercice avec un sans-faute.',
      vous: 'Que ___ -vous faire pendant les vacances ?',
      ils: 'Les supporters ___ que leur équipe remporte le match.',
    },
  },
  pouvoir: {
    id: 'pouvoir',
    name: 'pouvoir',
    forms: { je: 'peux', tu: 'peux', il: 'peut', nous: 'pouvons', vous: 'pouvez', ils: 'peuvent' },
    sentences: {
      je: "Je ___ t'aider si tu ne comprends pas la consigne.",
      tu: 'Tu ___ courir plus vite que moi sur cette distance.',
      il: 'Cet oiseau ___ voler à une vitesse impressionnante.',
      nous: 'En unissant nos forces, nous ___ y arriver.',
      vous: 'Vous ___ entrer dans la salle dès maintenant.',
      ils: 'Ces champions ___ soulever des charges très lourdes.',
    },
  },
};

const VERB_KEYS = Object.keys(VERBS_DB);

interface QuestionItem {
  verbId: string;
  verbName: string;
  pronounKey: string;
  pronounLabel: string;
  expected: string;
  prompt: React.ReactNode;
}

interface MistakeItem {
  verbName: string;
  pronounLabel: string;
  expected: string;
  userTyped: string;
  question: QuestionItem;
}

export const ConjugaisonModule: React.FC<ConjugaisonModuleProps> = ({ onHome, onComplete }) => {
  const [screen, setScreen] = useState<'home' | 'game' | 'results'>('home');
  const [selectedMode, setSelectedMode] = useState<number>(1); // 1: ordre, 2: desordre, 3: phrase
  const [selectedVerbs, setSelectedVerbs] = useState<string[]>(['etre', 'avoir']);

  // Game state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnswerValidated, setIsAnswerValidated] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleVerb = (vKey: string) => {
    playSound('click');
    setSelectedVerbs((prev) =>
      prev.includes(vKey) ? prev.filter((k) => k !== vKey) : [...prev, vKey]
    );
  };

  const quickSelect = (type: 'all' | 'aux' | 'none') => {
    playSound('click');
    if (type === 'all') setSelectedVerbs([...VERB_KEYS]);
    else if (type === 'aux') setSelectedVerbs(['etre', 'avoir']);
    else setSelectedVerbs([]);
  };

  const buildQuestions = (verbsList: string[], mode: number): QuestionItem[] => {
    const list: QuestionItem[] = [];
    verbsList.forEach((vKey) => {
      const verb = VERBS_DB[vKey];
      PRONOUNS.forEach((pr) => {
        const expectedForm = verb.forms[pr.key];
        let promptNode: React.ReactNode = null;

        if (mode === 1 || mode === 2) {
          let displayPronom = pr.display;
          if (
            pr.key === 'je' &&
            /^[aeiouéèê]/i.test(expectedForm)
          ) {
            displayPronom = "j'";
          }
          promptNode = (
            <span>
              <span className="text-indigo-600 font-black">{displayPronom}</span> ({verb.name})
            </span>
          );
        } else {
          // Mode 3: Phrase
          const sentenceTemplate = verb.sentences[pr.key] || `${pr.display} ___ (${verb.name})`;
          const parts = sentenceTemplate.split('___');
          promptNode = (
            <div className="space-y-1">
              <span className="text-slate-500 text-sm block">Verbe ({verb.name})</span>
              <span>
                {parts[0]}
                <span className="text-indigo-600 underline font-black px-2 bg-indigo-50 rounded-lg">
                  ... ? ...
                </span>
                {parts[1] || ''}
              </span>
            </div>
          );
        }

        list.push({
          verbId: vKey,
          verbName: verb.name,
          pronounKey: pr.key,
          pronounLabel: pr.label,
          expected: expectedForm,
          prompt: promptNode,
        });
      });
    });

    if (mode === 2 || mode === 3) {
      // Shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    return list;
  };

  const startGame = (customQ?: QuestionItem[]) => {
    playSound('click');
    const qList = customQ || buildQuestions(selectedVerbs, selectedMode);
    if (qList.length === 0) return;

    setQuestions(qList);
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswerValidated(false);
    setScore(0);
    setMistakes([]);
    setScreen('game');

    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const insertAccent = (char: string) => {
    playSound('click');
    if (isAnswerValidated) return;
    setUserAnswer((prev) => prev + char);
    inputRef.current?.focus();
  };

  const handleValidate = () => {
    if (isAnswerValidated) return;
    const cleanTyped = userAnswer.trim().toLowerCase();
    if (!cleanTyped) return;

    const currentQ = questions[currentIndex];
    const isCorrect = cleanTyped === currentQ.expected.toLowerCase();

    setIsAnswerValidated(true);

    if (isCorrect) {
      playSound('success');
      setScore((s) => s + 1);
    } else {
      playSound('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          verbName: currentQ.verbName,
          pronounLabel: currentQ.pronounLabel,
          expected: currentQ.expected,
          userTyped: cleanTyped,
          question: currentQ,
        },
      ]);
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setUserAnswer('');
      setIsAnswerValidated(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setScreen('results');
    const finalScore = score + (userAnswer.trim().toLowerCase() === questions[currentIndex]?.expected.toLowerCase() ? 0 : 0);
    const percent = Math.round((finalScore / questions.length) * 100);

    if (percent >= 80) {
      playSound('fanfare');
      fireGrandCelebration();
      setMissionCompleted('conjugaison');
      if (onComplete) onComplete();
    } else {
      playSound('wrong');
    }
  };

  const retryErrors = () => {
    if (mistakes.length === 0) return;
    const errQuestions = mistakes.map((m) => m.question);
    startGame(errQuestions);
  };

  // Handle keyboard Enter
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen === 'game') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!isAnswerValidated) {
            handleValidate();
          } else {
            handleNext();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, isAnswerValidated, userAnswer, currentIndex, questions]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentNum = currentIndex + 1;
  const progressPercent = totalQuestions > 0 ? Math.round((currentNum / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar
        title="Conjugaison d'Automne : Le Présent de l'Indicatif"
        badgeText="Français • CM1"
        badgeBg="bg-indigo-600 text-white"
        onHome={onHome}
      />

      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* SCREEN 1: HOME & SELECTION */}
        {screen === 'home' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide text-indigo-100">
                🎯 ENTRAÎNEMENT PERSONNALISÉ
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka leading-tight mt-2">
                Maîtrise les 11 verbes incontournables !
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base font-medium mt-1">
                Choisis ton mode d'entraînement, sélectionne tes verbes et relève le défi du Présent de l'Indicatif.
              </p>
            </div>

            {/* Mode selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black font-fredoka text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Choisis le type d'exercice :
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 1, icon: '🔢', name: "Dans l'ordre", desc: 'De je à ils/elles de façon méthodique.' },
                  { id: 2, icon: '🎲', name: 'Dans le désordre', desc: 'Pronoms et verbes mélangés pour tester tes réflexes.' },
                  { id: 3, icon: '💬', name: 'Dans une phrase', desc: 'Conjugue le verbe dans un contexte de la vie quotidienne.' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSelectedMode(mode.id);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition relative ${
                      selectedMode === mode.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mode.icon}</div>
                    <div className="font-extrabold text-slate-900 text-base">{mode.name}</div>
                    <p className="text-xs text-slate-600 mt-1">{mode.desc}</p>
                    {selectedMode === mode.id && (
                      <span className="absolute top-3 right-3 text-xs bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                        Actif
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Verb selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-black font-fredoka text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Sélectionne les verbes à travailler :
                </h3>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => quickSelect('all')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded-xl transition"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSelect('aux')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded-xl transition"
                  >
                    Être & Avoir
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSelect('none')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-xl transition"
                  >
                    Vider
                  </button>
                </div>
              </div>

              {/* 11 verbs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {VERB_KEYS.map((vKey) => {
                  const verb = VERBS_DB[vKey];
                  const isSelected = selectedVerbs.includes(vKey);
                  return (
                    <button
                      key={vKey}
                      type="button"
                      onClick={() => toggleVerb(vKey)}
                      className={`p-3 rounded-2xl border-2 font-extrabold text-sm sm:text-base transition active:scale-95 shadow-sm flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{verb.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${isSelected ? 'bg-white/25' : 'text-slate-300 font-mono'}`}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-indigo-950">
                  <span>ℹ️</span>
                  <span>
                    Règle : <strong>6 questions par verbe</strong> (je, tu, il/elle/on, nous, vous, ils/elles).
                  </span>
                </div>
                <div className="bg-indigo-600 text-white font-black px-3 py-1 rounded-xl">
                  {selectedVerbs.length} verbe{selectedVerbs.length > 1 ? 's' : ''} = {selectedVerbs.length * 6} questions
                </div>
              </div>
            </div>

            {/* Start button */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={selectedVerbs.length === 0}
                onClick={() => startGame()}
                className={`w-full sm:w-auto px-10 py-4 font-black text-lg sm:text-xl font-fredoka rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3 mx-auto ${
                  selectedVerbs.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>🚀</span>
                <span>
                  {selectedVerbs.length > 0
                    ? `Commencer avec ${selectedVerbs.length * 6} questions`
                    : 'Sélectionne au moins 1 verbe'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: GAMEPLAY */}
        {screen === 'game' && currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-md space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                    Mode {selectedMode === 1 ? "Dans l'ordre" : selectedMode === 2 ? 'Dans le désordre' : 'En contexte'}
                  </span>
                  <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                    Verbe {currentQ.verbName.toUpperCase()}
                  </span>
                </div>
                <span className="font-mono text-sm text-indigo-600 font-black">
                  Question {currentNum} / {totalQuestions}
                </span>
              </div>

              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question prompt */}
            <div className="py-6 sm:py-8 text-center space-y-4 bg-slate-50 rounded-2xl border-2 border-slate-200/80 px-4">
              <div className="text-xs uppercase font-black tracking-widest text-indigo-600">
                Conjugue au présent de l'indicatif :
              </div>

              <div className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-relaxed">
                {currentQ.prompt}
              </div>

              {/* Input field */}
              <div className="max-w-md mx-auto pt-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  disabled={isAnswerValidated}
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="none"
                  placeholder="Écris le verbe conjugué..."
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={`w-full text-center text-xl sm:text-2xl font-bold py-3 px-5 rounded-2xl border-2 outline-none transition shadow-inner ${
                    isAnswerValidated
                      ? userAnswer.trim().toLowerCase() === currentQ.expected.toLowerCase()
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-rose-500 bg-rose-50 text-rose-900 font-black'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-900'
                  }`}
                />
              </div>

              {/* Accents keypad */}
              <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Accents :</span>
                {['é', 'è', 'ê', 'à', 'â', 'ç', 'î', 'ô', 'û'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    disabled={isAnswerValidated}
                    onClick={() => insertAccent(char)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 font-black text-slate-700 text-sm shadow-xs transition"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Immediate Feedback */}
              {isAnswerValidated && (
                <div
                  className={`p-4 rounded-2xl border text-sm sm:text-base font-bold transition flex items-center justify-center gap-2 ${
                    userAnswer.trim().toLowerCase() === currentQ.expected.toLowerCase()
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-rose-300 bg-rose-50 text-rose-950 flex-col'
                  }`}
                >
                  {userAnswer.trim().toLowerCase() === currentQ.expected.toLowerCase() ? (
                    <>
                      <span>🎉</span>
                      <span>
                        Bravo ! C'est exactement <strong>{currentQ.expected}</strong>.
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-rose-700">
                        <span>❌</span> <span>Pas tout à fait !</span>
                      </div>
                      <div>
                        La bonne réponse est :{' '}
                        <span className="underline text-emerald-700 text-lg sm:text-xl font-black">
                          {currentQ.expected}
                        </span>
                        <span className="text-xs font-normal text-slate-600 block">
                          (Tu avais écrit : "{userAnswer}")
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setScreen('home');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm transition flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Quitter
              </button>

              <div>
                {!isAnswerValidated ? (
                  <button
                    type="button"
                    onClick={handleValidate}
                    className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-md transition flex items-center gap-2"
                  >
                    <span>Valider</span>
                    <span className="text-xs bg-indigo-800/60 px-2 py-0.5 rounded-lg">↵ Entrée</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-md transition flex items-center gap-2"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: RESULTS */}
        {screen === 'results' && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl space-y-7">
            <div className="text-center space-y-3 border-b border-slate-100 pb-6">
              <div className="text-6xl">{score === totalQuestions ? '👑' : score >= totalQuestions * 0.8 ? '🏆' : '💪'}</div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Session Terminée !
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-fredoka text-slate-900">
                {score === totalQuestions
                  ? 'Sans-Faute Parfait !'
                  : score >= totalQuestions * 0.8
                  ? 'Très Bon Travail !'
                  : 'Bon début, continue de t’entraîner !'}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Tu as complété l'ensemble de la série de conjugaison.
              </p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="text-xs font-bold text-indigo-700 uppercase">Note sur 20</div>
                <div className="text-3xl font-black font-fredoka text-indigo-900 mt-1">
                  {totalQuestions > 0 ? ((score / totalQuestions) * 20).toFixed(1).replace('.0', '') : 0} / 20
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700 uppercase">Réponses Correctes</div>
                <div className="text-3xl font-black font-fredoka text-emerald-900 mt-1">
                  {score} / {totalQuestions}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-700 uppercase">Taux de Réussite</div>
                <div className="text-3xl font-black font-fredoka text-amber-900 mt-1">
                  {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Mistakes Section */}
            {mistakes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-base font-fredoka flex items-center gap-2">
                    <span>🔍</span> Mots à réviser ({mistakes.length}) :
                  </h4>
                  <span className="text-xs text-slate-500">Observe bien les terminaisons</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {mistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div>
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs uppercase mr-1">
                          {m.verbName}
                        </span>
                        <span className="font-bold text-slate-800">{m.pronounLabel}</span> :
                        <span className="line-through text-rose-500 font-semibold ml-1">"{m.userTyped}"</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 mr-1">Attendu :</span>
                        <span className="text-emerald-700 font-black text-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {m.expected}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => startGame()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Recommencer la même sélection
              </button>

              {mistakes.length > 0 && (
                <button
                  type="button"
                  onClick={retryErrors}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Rejouer uniquement les erreurs
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setScreen('home');
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition"
              >
                Changer de verbes ou d'exercice
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
