import React, { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText, stopSpeech } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { addXP, unlockTrophy, incrementStreak } from '../../utils/gamification';
import { Check, RotateCcw, Volume2, ArrowRight } from 'lucide-react';

interface HistoireConqueteGauleModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const HistoireConqueteGauleModule: React.FC<HistoireConqueteGauleModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'lesson' | 'exercises' | 'trophies'>('home');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------
  // EXERCICE 1: Quiz Rome et Gaule (5 questions)
  // ----------------------------------------------------
  const quizQuestions = [
    {
      q: 'Au Ier siècle avant J.-C., quel général romain entreprend la conquête de la Gaule ?',
      options: ['Alexandre le Grand', 'Jules César', 'Napoléon Bonaparte', 'Charlemagne'],
      correct: 1,
      explanation: "C'est Jules César qui a mené la conquête de la Gaule pour agrandir l'Empire romain.",
    },
    {
      q: 'Pourquoi les légions romaines étaient-elles si redoutables ?',
      options: [
        'Elles se battaient chacune de leur côté sans chef',
        'Elles étaient très disciplinées, entraînées et bien organisées',
        'Elles utilisaient de la magie',
        'Elles étaient composées uniquement de géants',
      ],
      correct: 1,
      explanation: 'La discipline rigoureuse et l’organisation tactique faisaient la force de l’armée romaine.',
    },
    {
      q: 'Quel jeune chef gaulois a réussi à unir les tribus pour défendre leur indépendance ?',
      options: ['Astérix', 'Vercingétorix', 'Obélix', 'Clovis'],
      correct: 1,
      explanation: 'Vercingétorix, chef des Arvernes, a réussi à fédérer les tribus gauloises.',
    },
    {
      q: 'En quelle année a eu lieu la célèbre et décisive bataille d’Alésia ?',
      options: ['En l’an 800', 'En 1515', 'En 52 avant J.-C.', 'En 1789'],
      correct: 2,
      explanation: 'La bataille et le siège d’Alésia ont eu lieu en 52 avant J.-C.',
    },
    {
      q: 'Que s’est-il passé après la défaite gauloise à Alésia ?',
      options: [
        'La Gaule est devenue romaine et a adopté le mode de vie romain',
        'Les Romains sont aussitôt rentrés chez eux en Italie',
        'Tous les Gaulois se sont envolés pour un autre pays',
        'Rien n’a changé en Gaule',
      ],
      correct: 0,
      explanation: 'La Gaule est devenue une province romaine (la civilisation gallo-romaine).',
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
      addXP(20, 'Bonne réponse au Quiz de la Conquête !');
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
        addXP(50, 'Exercice 1 Conquête validé !');
      }
    }
  };

  // ----------------------------------------------------
  // EXERCICE 2: Définitions & Mots-clés
  // ----------------------------------------------------
  const definitions = [
    {
      term: 'Conquérir',
      desc: 'Prendre possession d’un territoire par la force et la guerre.',
    },
    {
      term: 'Indépendance',
      desc: 'Liberté pour un peuple ou un pays de se diriger lui-même sans être soumis à un autre.',
    },
    {
      term: 'Impôt',
      desc: 'Somme d’argent versée obligatoirement au pouvoir pour financer l’État et les armées.',
    },
    {
      term: 'Alésia',
      desc: 'Lieu de la bataille décisive en 52 av. J.-C. où Vercingétorix a déposé ses armes.',
    },
    {
      term: 'Vercingétorix',
      desc: 'Chef arverne qui a rassemblé les tribus gauloises contre Jules César.',
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
    'Ier siècle av. J.-C.',
    'Jules César',
    'organisées',
    'Vercingétorix',
    '52 avant J.-C.',
    'Alésia',
    'romaine',
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
  });

  useEffect(() => {
    setAvailableTokens([...clozeTokens].sort(() => Math.random() - 0.5));
  }, []);

  const handlePlaceToken = (token: string) => {
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
    let errors = 0;
    clozeTokens.forEach((tok, idx) => {
      if (clozeAnswers[idx] !== tok) errors++;
    });

    if (errors === 0) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 3: true }));
      addXP(80, 'Récit de la conquête complété sans faute !');
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 4: Grand Tri Romains vs Gaulois
  // ----------------------------------------------------
  const sortingItems = [
    { id: '1', text: 'Jules César et ses généraux', category: 'romains' },
    { id: '2', text: 'Vercingétorix et les Arvernes', category: 'gaulois' },
    { id: '3', text: 'Légions en formation tortue', category: 'romains' },
    { id: '4', text: 'Guerriers avec boucliers ovales et braies', category: 'gaulois' },
    { id: '5', text: 'Vainqueurs du siège d’Alésia', category: 'romains' },
    { id: '6', text: 'Défenseurs de leur indépendance', category: 'gaulois' },
    { id: '7', text: 'Empire méditerranéen puissant', category: 'romains' },
    { id: '8', text: 'Tribus unies pour résister', category: 'gaulois' },
  ];

  const [sortBucket, setSortBucket] = useState<Record<string, 'romains' | 'gaulois' | null>>({});

  const handleSortItem = (itemId: string, cat: 'romains' | 'gaulois') => {
    playSound('click');
    setSortBucket((prev) => ({ ...prev, [itemId]: cat }));
  };

  const verifySort = () => {
    let allCorrect = true;
    sortingItems.forEach((it) => {
      if (sortBucket[it.id] !== it.category) allCorrect = false;
    });

    if (allCorrect) {
      playSound('fanfare');
      fireGrandCelebration();
      setCompletedExercises((prev) => ({ ...prev, 4: true }));
      addXP(90, 'Tri Romains vs Gaulois parfait !');

      setMissionCompleted('histoire2', true);
      unlockTrophy('heros_alesia');
      if (onComplete) onComplete();
    } else {
      playSound('error');
    }
  };

  // Check mission complete
  useEffect(() => {
    const doneCount = Object.values(completedExercises).filter(Boolean).length;
    if (doneCount >= 3) {
      setMissionCompleted('histoire2', true);
      unlockTrophy('heros_alesia');
      if (onComplete) onComplete();
    }
  }, [completedExercises, onComplete]);

  const readLessonAloud = () => {
    const lessonText =
      "Leçon 21 : La Conquête de la Gaule. Durant l'Antiquité, au premier siècle avant Jésus-Christ, le chef romain Jules César a conquis la Gaule pour agrandir l'Empire romain. Les légions romaines étaient très bien organisées et disciplinées. En 52 avant Jésus-Christ, le chef gaulois Vercingétorix a réussi à unir plusieurs tribus gauloises pour défendre leur indépendance. Après une terrible bataille à Alésia, les Gaulois ont été vaincus. La Gaule est alors devenue romaine.";
    playSound('click');
    speakText(lessonText);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar
        title="⚔️ 21. La Conquête de la Gaule"
        badgeText="Histoire Cycle 3 • CM1"
        badgeBg="bg-rose-100 text-rose-900 border-rose-300"
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
                  ? 'bg-rose-800 text-white shadow-xs'
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
                  ? 'bg-rose-800 text-white shadow-xs'
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
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🎮</span> <span>Les 4 Exercices</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                {Object.values(completedExercises).filter(Boolean).length}/4
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <span>🏛️</span>
            <span>52 av. J.-C. • Alésia</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : ACCUEIL                                          */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 via-red-950 to-amber-950 text-white p-6 sm:p-9 shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-amber-200 border border-white/10">
                  <span>⚔️</span> ROME CONTRE LES GAULOIS • 52 AVANT J.-C.
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-fredoka leading-tight">
                  Deviens incollable sur Jules César & Vercingétorix !
                </h2>
                <p className="text-amber-100 text-sm sm:text-base font-medium">
                  Révise ta leçon officielle, maîtrise les mots importants (conquérir, indépendance, impôt) et relève les 4 défis d'histoire romaine et gauloise.
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

            {/* Repères chronologiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">L'Époque</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-rose-800 mt-1">Antiquité</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Ier siècle av. J.-C.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Le Chef Romain</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-red-700 mt-1">Jules César</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Légions très organisées</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Le Chef Gaulois</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-emerald-700 mt-1">
                  Vercingétorix
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Union des tribus gauloises</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Bataille Clé</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-amber-600 mt-1">
                  52 av. J.-C.
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">Siège d'Alésia</p>
              </div>
            </div>

            {/* Exercices Cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-fredoka text-stone-800 flex items-center gap-2">
                <span>🎮</span> Les 4 Exercices de la leçon :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    icon: '🏛️',
                    title: '1. Le Quiz de la Conquête',
                    desc: '5 questions sur Jules César, les légions romaines, Vercingétorix et Alésia.',
                    color: 'bg-rose-800 hover:bg-rose-900',
                  },
                  {
                    id: 2,
                    icon: '🧩',
                    title: '2. Mots-clés & Définitions',
                    desc: 'Associe conquérir, indépendance, impôt, Alésia et Vercingétorix à leur sens.',
                    color: 'bg-amber-600 hover:bg-amber-700',
                  },
                  {
                    id: 3,
                    icon: '✍️',
                    title: '3. Récit à Trous d’Alésia',
                    desc: 'Reconstitue l’histoire de la conquête en replaçant les dates et mots clés.',
                    color: 'bg-red-700 hover:bg-red-800',
                  },
                  {
                    id: 4,
                    icon: '⚔️',
                    title: '4. Romains contre Gaulois',
                    desc: 'Trie les chefs, armées et rôles de chaque camp lors de l’affrontement.',
                    color: 'bg-indigo-700 hover:bg-indigo-800',
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
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                  Fiche d'Histoire Officielle CM1
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-stone-800 mt-1">
                  21. La Conquête de la Gaule
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
              <div className="space-y-4">
                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  Durant <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">l'Antiquité</mark>, au{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">Ier siècle avant J.-C.</mark>, le chef
                  romain <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">Jules César</mark> a{' '}
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded font-extrabold text-stone-900">conquis*</span> la
                  Gaule pour agrandir l'Empire romain.
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  Les armées romaines (les légions) étaient{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">très bien organisées et disciplinées</mark>.
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  En <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">52 avant J.-C.</mark>, le chef
                  gaulois <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">Vercingétorix</mark> a réussi à
                  unir plusieurs tribus gauloises pour défendre leur{' '}
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded font-extrabold text-stone-900">
                    indépendance*
                  </span>
                  .
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80">
                  Après le siège et la terrible bataille d'
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">Alésia</mark>, les Gaulois ont été
                  vaincus. La Gaule est alors devenue{' '}
                  <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold">romaine</mark> et a dû payer des{' '}
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded font-extrabold text-stone-900">impôts*</span> à
                  Rome.
                </div>
              </div>

              {/* Mots importants */}
              <div className="space-y-3 pt-3 border-t border-amber-300/60">
                <h3 className="font-bold text-amber-950 text-base sm:text-lg font-fredoka flex items-center gap-2">
                  <span>📖</span> Mots importants à retenir :
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-2xs">
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-stone-900">Conquérir* :</span>
                    <p className="mt-2 text-stone-700">Prendre possession d'un territoire par la force et les armes.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-2xs">
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-stone-900">
                      Indépendance* :
                    </span>
                    <p className="mt-2 text-stone-700">
                      La liberté pour un peuple de se diriger lui-même sans dépendre d'un autre pays.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-2xs">
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-stone-900">Un impôt* :</span>
                    <p className="mt-2 text-stone-700">
                      Somme d'argent versée obligatoirement au pouvoir pour financer l'État et l'armée.
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
                className="px-6 py-3 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-2xl shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
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
                { id: 1, label: '1. Quiz Conquête', icon: '🏛️' },
                { id: 2, label: '2. Mots-clés', icon: '🧩' },
                { id: 3, label: '3. Récit à Trous', icon: '✍️' },
                { id: 4, label: '4. Romains vs Gaulois', icon: '⚔️' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(b.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeExercise === b.id
                      ? 'bg-rose-800 text-white shadow-xs'
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
                    <h3 className="font-bold text-xl font-fredoka text-rose-950">
                      Exercice 1 : Le Quiz de Rome et de la Gaule
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
                          className="px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
                        >
                          {quizIndex < quizQuestions.length - 1 ? 'Question suivante' : 'Voir mon résultat'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-6xl">🏆</div>
                    <h4 className="text-2xl font-bold font-fredoka text-stone-800">
                      Quiz terminé ! Ton score : {quizScore} / {quizQuestions.length}
                    </h4>
                    <p className="text-sm text-stone-600">
                      {quizScore >= 4
                        ? 'Formidable ! Tu as l’esprit d’un véritable centurion historien !'
                        : 'Bon effort ! Prends le temps de relire la fiche pour obtenir 5/5.'}
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
                        className="px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
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
                  <h3 className="font-bold text-xl font-fredoka text-rose-950">
                    Exercice 2 : Relie chaque mot à sa bonne définition
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Clique sur un terme à gauche, puis sur son explication à droite.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Terms */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                      1. Mots & Personnages
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
                      Superbe ! Tous les mots et personnages historiques sont bien associés ! 🌟
                    </p>
                    <button
                      onClick={() => setActiveExercise(3)}
                      className="px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
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
                  <h3 className="font-bold text-xl font-fredoka text-rose-950">
                    Exercice 3 : Complète le récit de la conquête
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Clique sur un jeton pour l'insérer dans le texte, ou clique dessus pour le retirer.
                  </p>
                </div>

                {/* Tokens pool */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 mb-2">Mots à placer :</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTokens.map((token) => (
                      <button
                        key={token}
                        onClick={() => handlePlaceToken(token)}
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:border-rose-500 text-stone-800 font-bold rounded-xl text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        + {token}
                      </button>
                    ))}
                    {availableTokens.length === 0 && (
                      <span className="text-xs text-emerald-700 font-bold italic">
                        Tous les éléments sont placés !
                      </span>
                    )}
                  </div>
                </div>

                {/* Cloze Text */}
                <div className="p-6 bg-[#FEFDF9] rounded-3xl border-2 border-amber-200 text-stone-800 leading-loose text-base">
                  Durant l'Antiquité, au{' '}
                  <span
                    onClick={() => handleRemoveToken(0)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[0] || '... 1 ...'}
                  </span>
                  , le chef romain{' '}
                  <span
                    onClick={() => handleRemoveToken(1)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[1] || '... 2 ...'}
                  </span>{' '}
                  conquiert la Gaule. Les légions romaines sont très{' '}
                  <span
                    onClick={() => handleRemoveToken(2)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[2] || '... 3 ...'}
                  </span>
                  . Mais le jeune chef gaulois{' '}
                  <span
                    onClick={() => handleRemoveToken(3)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[3] || '... 4 ...'}
                  </span>{' '}
                  unit les tribus pour défendre leur indépendance. En{' '}
                  <span
                    onClick={() => handleRemoveToken(4)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[4] || '... 5 ...'}
                  </span>
                  , après le siège d'
                  <span
                    onClick={() => handleRemoveToken(5)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[5] || '... 6 ...'}
                  </span>
                  , les Gaulois sont vaincus et la Gaule devient{' '}
                  <span
                    onClick={() => handleRemoveToken(6)}
                    className="inline-block px-3 py-1 bg-white border-2 border-dashed border-amber-400 rounded-lg text-rose-900 font-bold cursor-pointer min-w-28 text-center"
                  >
                    {clozeAnswers[6] || '... 7 ...'}
                  </span>
                  .
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setClozeAnswers({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null });
                      setAvailableTokens([...clozeTokens].sort(() => Math.random() - 0.5));
                      playSound('click');
                    }}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-bold underline cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={verifyCloze}
                    className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Vérifier mon récit
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 4 : GRAND TRI ROMAINS VS GAULOIS --- */}
            {activeExercise === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-rose-950">
                    Exercice 4 : Romains contre Gaulois
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Indique pour chaque carte s'il s'agit du camp romain ou du camp gaulois.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortingItems.map((item) => {
                    const currentBucket = sortBucket[item.id];
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-bold text-stone-800">{item.text}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleSortItem(item.id, 'romains')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              currentBucket === 'romains'
                                ? 'bg-rose-800 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            🏛️ Romain
                          </button>
                          <button
                            onClick={() => handleSortItem(item.id, 'gaulois')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              currentBucket === 'gaulois'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            🛡️ Gaulois
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={verifySort}
                    className="px-6 py-3 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider le Tri Historique ➔
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
