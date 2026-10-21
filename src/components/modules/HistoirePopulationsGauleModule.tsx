import React, { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText, stopSpeech } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { addXP, unlockTrophy, incrementStreak } from '../../utils/gamification';
import { Check, RotateCcw, Volume2, Sparkles, BookOpen, Layers, Award, ArrowRight } from 'lucide-react';

interface HistoirePopulationsGauleModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const HistoirePopulationsGauleModule: React.FC<HistoirePopulationsGauleModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'lesson' | 'exercises' | 'trophies'>('home');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------
  // EXERCICE 1: Quiz du peuplement (5 questions)
  // ----------------------------------------------------
  const quizQuestions = [
    {
      q: "Qui peuplait la Gaule durant l'Antiquité, avant l'arrivée des nouvelles populations ?",
      options: [
        "Les Romains débarqués d'Italie",
        "Les descendants des hommes et femmes préhistoriques",
        "Uniquement les Vikings du Nord",
        "Personne, le territoire était vide",
      ],
      correct: 1,
      explanation: "Le territoire français était habité par les descendants des hommes et femmes préhistoriques.",
    },
    {
      q: "À partir de quel siècle de nouvelles populations arrivent-elles en Gaule ?",
      options: [
        "Au 1er siècle après J.-C.",
        "Au 6ème siècle avant J.-C.",
        "Au Moyen Âge (Ve siècle)",
        "Au 15ème siècle",
      ],
      correct: 1,
      explanation: "C'est au 6ème siècle avant J.-C. que de nouvelles populations arrivent en Gaule.",
    },
    {
      q: "D'où venaient les Celtes ?",
      options: [
        "D'Europe centrale",
        "D'Égypte ancienne",
        "D'Amérique du Nord",
        "D'Asie de l'Est",
      ],
      correct: 0,
      explanation: "Les Celtes sont arrivés d'Europe centrale et ont formé les tribus gauloises.",
    },
    {
      q: "Par où les Grecs sont-ils arrivés en Gaule ?",
      options: [
        "Par les montagnes des Alpes à ski",
        "Par la mer Méditerranée",
        "Par l'océan Atlantique",
        "Par le fleuve Rhin",
      ],
      correct: 1,
      explanation: "Les Grecs étaient d'excellents marins et navigateurs venus par la mer Méditerranée.",
    },
    {
      q: "Quels étaient les 4 talents majeurs des Gaulois selon la leçon ?",
      options: [
        "Banquiers, astronautes, peintres et chauffeurs",
        "Artisans habiles, remarquables agriculteurs, brillants artistes et guerriers redoutés",
        "Pêcheurs, chanteurs, juges et maçons",
        "Comédiens, navigateurs, cuisiniers et empereurs",
      ],
      correct: 1,
      explanation: "Ils étaient artisans, agriculteurs, artistes et guerriers redoutés !",
    },
  ];
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleQuizAnswer = (idx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    const isCorrect = idx === quizQuestions[quizIndex].correct;
    if (isCorrect) {
      playSound('success');
      setQuizScore((prev) => prev + 1);
      addXP(20, 'Bonne réponse au Quiz Gaulois !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelected(null);
    } else {
      setQuizFinished(true);
      const isPerfect = quizScore + (quizSelected === quizQuestions[quizIndex].correct ? 1 : 0) >= 4;
      if (isPerfect) {
        setCompletedExercises((prev) => ({ ...prev, 1: true }));
        playSound('fanfare');
        fireGrandCelebration();
        addXP(50, 'Exercice 1 validé !');
      }
    }
  };

  // ----------------------------------------------------
  // EXERCICE 2: Association Définitions
  // ----------------------------------------------------
  const definitions = [
    {
      term: "Une tribu",
      desc: "Un groupe de personnes qui ont la même langue, la même manière de vivre et un même chef.",
    },
    {
      term: "Un artisan",
      desc: "Une personne qui fabrique des objets à la main ou avec des outils.",
    },
    {
      term: "Les Celtes",
      desc: "Population venue d'Europe centrale à partir du 6e siècle av. J.-C.",
    },
    {
      term: "Les Grecs",
      desc: "Commerçants et marins venus par la mer Méditerranée.",
    },
  ];

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongPairAnimation, setWrongPairAnimation] = useState<string | null>(null);

  const handleTermClick = (term: string) => {
    if (matchedPairs.includes(term)) return;
    playSound('click');
    setSelectedTerm(term);
  };

  const handleDescClick = (desc: string, termAssociated: string) => {
    if (!selectedTerm || matchedPairs.includes(termAssociated)) return;

    if (selectedTerm === termAssociated) {
      playSound('success');
      const next = [...matchedPairs, termAssociated];
      setMatchedPairs(next);
      setSelectedTerm(null);
      addXP(25, 'Définition associée !');
      incrementStreak();
      if (next.length === definitions.length) {
        setCompletedExercises((prev) => ({ ...prev, 2: true }));
        playSound('fanfare');
        fireConfetti();
        addXP(60, 'Exercice 2 Définitions terminé !');
      }
    } else {
      playSound('error');
      setWrongPairAnimation(desc);
      setTimeout(() => setWrongPairAnimation(null), 800);
      setSelectedTerm(null);
    }
  };

  // ----------------------------------------------------
  // EXERCICE 3: Texte à trous
  // ----------------------------------------------------
  const clozeTokens = [
    'l\'Antiquité',
    'descendants',
    '6ème siècle',
    'Celtes',
    'Europe centrale',
    'Grecs',
    'Méditerranée',
    'tribus',
  ];

  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [clozeAnswers, setClozeAnswers] = useState<Record<number, string | null>>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
  });
  const [clozeSubmitted, setClozeSubmitted] = useState(false);

  useEffect(() => {
    // Shuffle tokens randomly
    const shuffled = [...clozeTokens].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
  }, []);

  const handlePlaceToken = (token: string) => {
    // Find first empty slot
    const emptySlot = Object.keys(clozeAnswers).find(
      (k) => clozeAnswers[parseInt(k, 10)] === null
    );
    if (emptySlot !== undefined) {
      const slotNum = parseInt(emptySlot, 10);
      setClozeAnswers((prev) => ({ ...prev, [slotNum]: token }));
      setAvailableTokens((prev) => prev.filter((t) => t !== token));
      playSound('click');
    }
  };

  const handleRemoveToken = (slotNum: number) => {
    const val = clozeAnswers[slotNum];
    if (!val) return;
    setClozeAnswers((prev) => ({ ...prev, [slotNum]: null }));
    setAvailableTokens((prev) => [...prev, val]);
    playSound('click');
  };

  const verifyCloze = () => {
    const expected = clozeTokens;
    let errors = 0;
    expected.forEach((tok, idx) => {
      if (clozeAnswers[idx] !== tok) errors++;
    });

    setClozeSubmitted(true);
    if (errors === 0) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 3: true }));
      addXP(80, 'Texte à trous sans aucune faute !');
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 4: Grand Tri Gaulois
  // ----------------------------------------------------
  const sortingItems = [
    { id: '1', text: "Celtes d'Europe centrale", category: 'origines' },
    { id: '2', text: 'Artisans habiles', category: 'talents' },
    { id: '3', text: 'Grecs par la Méditerranée', category: 'origines' },
    { id: '4', text: 'Guerriers redoutés', category: 'talents' },
    { id: '5', text: 'Descendants de la Préhistoire', category: 'origines' },
    { id: '6', text: 'Remarquables agriculteurs', category: 'talents' },
    { id: '7', text: 'Tribus avec chefs', category: 'origines' },
    { id: '8', text: 'Armes et outils en fer', category: 'talents' },
  ];

  const [sortBucket, setSortBucket] = useState<Record<string, 'origines' | 'talents' | null>>({});
  const [sortSubmitted, setSortSubmitted] = useState(false);

  const handleSortItem = (itemId: string, cat: 'origines' | 'talents') => {
    playSound('click');
    setSortBucket((prev) => ({ ...prev, [itemId]: cat }));
  };

  const verifySort = () => {
    let allCorrect = true;
    sortingItems.forEach((it) => {
      if (sortBucket[it.id] !== it.category) allCorrect = false;
    });

    setSortSubmitted(true);
    if (allCorrect) {
      playSound('fanfare');
      fireGrandCelebration();
      setCompletedExercises((prev) => ({ ...prev, 4: true }));
      addXP(90, 'Grand Tri Gaulois parfait !');

      // Check if all 4 are done for mission completion & trophy
      setMissionCompleted('histoire1', true);
      unlockTrophy('guerrier_gaulois');
      if (onComplete) onComplete();
    } else {
      playSound('error');
    }
  };

  // Check if mission is complete
  useEffect(() => {
    const doneCount = Object.values(completedExercises).filter(Boolean).length;
    if (doneCount >= 3) {
      setMissionCompleted('histoire1', true);
      unlockTrophy('guerrier_gaulois');
      if (onComplete) onComplete();
    }
  }, [completedExercises, onComplete]);

  const readLessonAloud = () => {
    const lessonText =
      "Leçon : Les Populations de la Gaule. a) Le peuplement de la Gaule : Durant l'Antiquité, le territoire français était peuplé par les descendants des hommes et femmes préhistoriques. À partir du 6ème siècle avant Jésus-Christ, de nouvelles populations sont arrivées : les Celtes, venus d'Europe centrale, et les Grecs, venus par la mer Méditerranée. Elles se sont mélangées, jusqu'à parler la même langue et vivre de la même manière. Ils ont formé des tribus de Gaulois. b) La civilisation gauloise : Les Gaulois produisaient des armes de qualité et des outils agricoles. Ils étaient des artisans habiles, de remarquables agriculteurs, de brillants artistes et des guerriers redoutés.";
    playSound('click');
    speakText(lessonText);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar
        title="🏺 1/ Les Populations de la Gaule"
        badgeText="Histoire Cycle 3 • CM1"
        badgeBg="bg-emerald-100 text-emerald-900 border-emerald-300"
        onHome={onHome}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('home');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🏠</span> <span>Accueil</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('lesson');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'lesson'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>📜</span> <span>Fiche de cours</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('exercises');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'exercises'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🎮</span> <span>Les 4 Exercices</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                {Object.values(completedExercises).filter(Boolean).length}/4
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Gaule antique</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : ACCUEIL                                          */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-amber-950 text-white p-6 sm:p-9 shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-amber-200 border border-white/10">
                  <span>🛡️</span> CELTES, GRECS & CIVILISATION GAULOISE
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-fredoka leading-tight">
                  Qui étaient les premiers habitants de la Gaule ?
                </h2>
                <p className="text-emerald-100 text-sm sm:text-base font-medium">
                  Découvre le mélange des populations dès le VIe siècle avant J.-C., les talents des artisans et guerriers gaulois, et retiens les définitions clés.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('lesson')}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black font-fredoka rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>📜</span> Lire la Fiche Complète
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('exercises');
                      setActiveExercise(1);
                    }}
                    className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🎮</span> Commencer les 4 Défis
                  </button>
                </div>
              </div>
            </div>

            {/* Repères clés */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Date Clé</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-emerald-800 mt-1">
                  VIe siècle av. J.-C.
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Arrivée de nouveaux peuples</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Les Celtes</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-amber-700 mt-1">
                  Europe centrale
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Forment les tribus gauloises</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Les Grecs</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-teal-700 mt-1">
                  Méditerranée
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Commerçants et marins</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Leurs Talents</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-purple-700 mt-1">
                  4 Talents Clés
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Artisans, agriculteurs, artistes, guerriers</p>
              </div>
            </div>

            {/* Liste des 4 Exercices */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-fredoka text-stone-800 flex items-center gap-2">
                <span>🎮</span> Les 4 Exercices interactifs :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    icon: '🏛️',
                    title: '1. Le Grand Quiz du Peuplement',
                    desc: '5 questions sur la Préhistoire, les Celtes, les Grecs et la vie gauloise.',
                    color: 'bg-emerald-700 hover:bg-emerald-800',
                  },
                  {
                    id: 2,
                    icon: '🧩',
                    title: '2. Définitions & Mots Importants',
                    desc: 'Relie par paire les notions et définitions : tribu, artisan, Celtes, Grecs.',
                    color: 'bg-amber-600 hover:bg-amber-700',
                  },
                  {
                    id: 3,
                    icon: '✍️',
                    title: '3. Texte à Trous',
                    desc: 'Replace les mots essentiels au bon endroit dans le récit du cours.',
                    color: 'bg-teal-700 hover:bg-teal-800',
                  },
                  {
                    id: 4,
                    icon: '🌾',
                    title: '4. Le Grand Tri Gaulois',
                    desc: 'Classe les éléments : Origines & Peuples contre Talents & Métiers Gaulois.',
                    color: 'bg-purple-700 hover:bg-purple-800',
                  },
                ].map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{ex.icon}</span>
                        {completedExercises[ex.id] ? (
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Fait !
                          </span>
                        ) : (
                          <span className="text-xs bg-stone-100 text-stone-500 font-bold px-2.5 py-0.5 rounded-full">
                            À faire
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-stone-900 text-base font-fredoka mb-1">{ex.title}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">{ex.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('exercises');
                        setActiveExercise(ex.id);
                      }}
                      className={`w-full py-2.5 ${ex.color} text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95`}
                    >
                      <span>Lancer le Défi</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2 : FICHE DE COURS                                   */}
        {/* ======================================================== */}
        {activeTab === 'lesson' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Fiche d'Histoire Officielle CM1
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-stone-800 mt-1">
                  1/ Les Populations de la Gaule
                </h2>
              </div>
              <button
                onClick={readLessonAloud}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Écouter la leçon
              </button>
            </div>

            {/* Reproduction fidèle cahier d'écolier avec surlignage */}
            <div className="bg-[#FEFDF9] p-6 sm:p-8 rounded-3xl border-2 border-amber-200 shadow-inner space-y-6 text-stone-800 text-base sm:text-lg leading-relaxed">
              {/* Section a */}
              <div className="space-y-2">
                <h3 className="font-bold text-emerald-950 text-lg sm:text-xl font-fredoka flex items-center gap-2">
                  <span>🌍</span> a) Le peuplement de la Gaule
                </h3>
                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  Durant <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">l'Antiquité</mark>, le
                  territoire français était peuplé par{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">
                    les descendants des hommes et femmes préhistoriques
                  </mark>
                  . <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">À partir du 6ème siècle avant J.-C.</mark>
                  , de nouvelles populations sont arrivées :{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">
                    les Celtes, venus d'Europe centrale
                  </mark>
                  , et{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">
                    les Grecs, venus par la mer Méditerranée
                  </mark>
                  . Elles se sont mélangées,{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">
                    jusqu'à parler la même langue et vivre de la même manière
                  </mark>
                  . Ils ont formé des <span className="bg-slate-200 px-1.5 py-0.5 rounded font-extrabold text-stone-900">tribus*</span> de Gaulois(es).
                </div>
              </div>

              {/* Section b */}
              <div className="space-y-2">
                <h3 className="font-bold text-emerald-950 text-lg sm:text-xl font-fredoka flex items-center gap-2">
                  <span>⚔️</span> b) La civilisation gauloise
                </h3>
                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">
                    Les Gaulois produisaient des armes de qualité et des outils agricoles
                  </mark>
                  . Ils étaient <span className="bg-slate-200 px-1.5 py-0.5 rounded font-extrabold text-stone-900">des artisans*</span>{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">habiles</mark>, de remarquables{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">agriculteurs</mark>, de brillants{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">artistes</mark> et des{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">guerriers</mark> redoutés.
                </div>
              </div>

              {/* Mots importants */}
              <div className="space-y-3 pt-3 border-t border-amber-300/60">
                <h3 className="font-bold text-amber-950 text-base sm:text-lg font-fredoka flex items-center gap-2">
                  <span>📖</span> Mots importants à retenir :
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-2xs">
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-stone-900">Une tribu* :</span>
                    <p className="mt-2 text-stone-700">
                      Un groupe de personnes qui ont la même langue, la même manière de vivre et un même chef.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-2xs">
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-stone-900">Un artisan* :</span>
                    <p className="mt-2 text-stone-700">
                      Une personne qui fabrique des objets à la main ou avec des outils.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setActiveTab('exercises');
                  setActiveExercise(1);
                }}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Passer aux Exercices</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3 : LES EXERCICES                                    */}
        {/* ======================================================== */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Exercise Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-stone-200">
              {[
                { id: 1, label: '1. Quiz Peuplement', icon: '🏛️' },
                { id: 2, label: '2. Définitions', icon: '🧩' },
                { id: 3, label: '3. Texte à Trous', icon: '✍️' },
                { id: 4, label: '4. Grand Tri', icon: '🌾' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(b.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeExercise === b.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : completedExercises[b.id]
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                  {completedExercises[b.id] && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
              ))}
            </div>

            {/* --- EXERCICE 1 : QUIZ --- */}
            {activeExercise === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-emerald-950">
                      Exercice 1 : Le Grand Quiz du Peuplement
                    </h3>
                    <p className="text-xs text-stone-500">
                      Question {quizIndex + 1} sur {quizQuestions.length}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-amber-600">
                    Score : {quizScore} / {quizQuestions.length}
                  </div>
                </div>

                {!quizFinished ? (
                  <div className="space-y-4">
                    <p className="font-bold text-stone-800 text-base sm:text-lg">
                      {quizQuestions[quizIndex].q}
                    </p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {quizQuestions[quizIndex].options.map((opt, idx) => {
                        const isCorrect = idx === quizQuestions[quizIndex].correct;
                        const isSelected = quizSelected === idx;
                        let btnStyle = 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800';

                        if (quizSelected !== null) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-100 border-rose-300 text-rose-950';
                          } else {
                            btnStyle = 'opacity-50 border-stone-200 bg-stone-50';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={quizSelected !== null}
                            className={`w-full p-4 text-left text-sm rounded-2xl border-2 transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSelected !== null && isCorrect && (
                              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSelected !== null && (
                      <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p>
                          <strong>Explication :</strong> {quizQuestions[quizIndex].explanation}
                        </p>
                        <button
                          onClick={handleNextQuiz}
                          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
                        >
                          {quizIndex < quizQuestions.length - 1 ? 'Question suivante' : 'Voir mon résultat'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h4 className="text-2xl font-bold font-fredoka text-stone-800">
                      Quiz terminé ! Ton score : {quizScore} / {quizQuestions.length}
                    </h4>
                    <p className="text-sm text-stone-600">
                      {quizScore >= 4
                        ? 'Bravo ! Tu maîtrises parfaitement l’origine des peuples de la Gaule !'
                        : 'Bien essayé ! N’hésite pas à relire la fiche pour faire un sans-faute.'}
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setQuizIndex(0);
                          setQuizSelected(null);
                          setQuizScore(0);
                          setQuizFinished(false);
                        }}
                        className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" /> Recommencer
                      </button>
                      <button
                        onClick={() => setActiveExercise(2)}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                      >
                        Exercice suivant <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- EXERCICE 2 : DÉFINITIONS --- */}
            {activeExercise === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-emerald-950">
                    Exercice 2 : Relie chaque mot à sa bonne définition
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Clique d'abord sur un terme à gauche, puis clique sur sa définition correspondante à droite.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Terms */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                      1. Mots & Notions
                    </h4>
                    {definitions.map((item) => {
                      const isMatched = matchedPairs.includes(item.term);
                      const isSelected = selectedTerm === item.term;
                      return (
                        <button
                          key={item.term}
                          onClick={() => handleTermClick(item.term)}
                          disabled={isMatched}
                          className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition flex items-center justify-between cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-70'
                              : isSelected
                              ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-sm scale-102'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                          }`}
                        >
                          <span>{item.term}</span>
                          {isMatched && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Definitions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                      2. Définitions
                    </h4>
                    {definitions.map((item) => {
                      const isMatched = matchedPairs.includes(item.term);
                      const isShaking = wrongPairAnimation === item.desc;
                      return (
                        <button
                          key={item.desc}
                          onClick={() => handleDescClick(item.desc, item.term)}
                          disabled={isMatched}
                          className={`w-full p-4 rounded-2xl border-2 text-left text-xs leading-relaxed transition flex items-start justify-between cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-70'
                              : isShaking
                              ? 'bg-rose-100 border-rose-400 text-rose-950 animate-bounce'
                              : selectedTerm
                              ? 'bg-stone-50 hover:bg-amber-50 border-amber-200 text-stone-800'
                              : 'bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>{item.desc}</span>
                          {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {matchedPairs.length === definitions.length && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <p className="font-bold text-emerald-900 text-sm">
                      Bravo ! Toutes les paires de définitions ont été retrouvées ! 🌟
                    </p>
                    <button
                      onClick={() => setActiveExercise(3)}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      Passer à l'Exercice 3 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- EXERCICE 3 : TEXTE À TROUS --- */}
            {activeExercise === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-emerald-950">
                    Exercice 3 : Complète le texte de la leçon
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Clique sur un mot ci-dessous pour l'insérer dans le premier trou libre. Clique sur un mot inséré pour le retirer.
                  </p>
                </div>

                {/* Available tokens pool */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 mb-2">Mots à placer :</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTokens.map((token) => (
                      <button
                        key={token}
                        onClick={() => handlePlaceToken(token)}
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-500 text-stone-800 font-bold rounded-xl text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        + {token}
                      </button>
                    ))}
                    {availableTokens.length === 0 && (
                      <span className="text-xs text-emerald-700 font-bold italic">
                        Tous les mots ont été placés dans le texte !
                      </span>
                    )}
                  </div>
                </div>

                {/* Cloze Text */}
                <div className="p-6 bg-[#FEFDF9] rounded-3xl border-2 border-amber-200 text-stone-800 leading-loose text-base">
                  Durant{' '}
                  <span
                    onClick={() => handleRemoveToken(0)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[0] || '... 1 ...'}
                  </span>
                  , le territoire français était peuplé par les{' '}
                  <span
                    onClick={() => handleRemoveToken(1)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[1] || '... 2 ...'}
                  </span>{' '}
                  des hommes et femmes préhistoriques. À partir du{' '}
                  <span
                    onClick={() => handleRemoveToken(2)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[2] || '... 3 ...'}
                  </span>{' '}
                  avant J.-C., de nouvelles populations sont arrivées : les{' '}
                  <span
                    onClick={() => handleRemoveToken(3)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[3] || '... 4 ...'}
                  </span>
                  , venus d'
                  <span
                    onClick={() => handleRemoveToken(4)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[4] || '... 5 ...'}
                  </span>
                  , et les{' '}
                  <span
                    onClick={() => handleRemoveToken(5)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[5] || '... 6 ...'}
                  </span>
                  , venus par la mer{' '}
                  <span
                    onClick={() => handleRemoveToken(6)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[6] || '... 7 ...'}
                  </span>
                  . Elles se sont mélangées jusqu'à former des{' '}
                  <span
                    onClick={() => handleRemoveToken(7)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-emerald-800 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[7] || '... 8 ...'}
                  </span>{' '}
                  de Gaulois.
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setClozeAnswers({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
                      setAvailableTokens([...clozeTokens].sort(() => Math.random() - 0.5));
                      setClozeSubmitted(false);
                      playSound('click');
                    }}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-bold underline cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={verifyCloze}
                    className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Vérifier mes réponses
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 4 : GRAND TRI GAULOIS --- */}
            {activeExercise === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-emerald-950">
                    Exercice 4 : Le Grand Tri Gaulois
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Classe chaque élément dans la bonne catégorie en cliquant sur le bouton correspondant.
                  </p>
                </div>

                {/* Items to sort */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortingItems.map((item) => {
                    const currentBucket = sortBucket[item.id];
                    const isCorrect = sortSubmitted && currentBucket === item.category;
                    const isWrong = sortSubmitted && currentBucket !== item.category;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-400'
                            : isWrong
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <span className="text-xs font-bold text-stone-800">{item.text}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleSortItem(item.id, 'origines')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              currentBucket === 'origines'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            🌍 Origine
                          </button>
                          <button
                            onClick={() => handleSortItem(item.id, 'talents')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              currentBucket === 'talents'
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            ⚔️ Talent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={verifySort}
                    className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider le Tri Gaulois ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
