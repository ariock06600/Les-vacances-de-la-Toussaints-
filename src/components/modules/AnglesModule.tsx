import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText, stopSpeech } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { addXP, unlockTrophy, incrementStreak } from '../../utils/gamification';
import { Check, RotateCcw, Volume2, ArrowRight } from 'lucide-react';

interface AnglesModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const AnglesModule: React.FC<AnglesModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'lesson' | 'exercises'>('home');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------
  // EXERCICE 1: Vrai ou Faux (4 questions)
  // ----------------------------------------------------
  const vfAnswers: Record<number, boolean> = { 1: false, 2: true, 3: false, 4: true };
  const [userVF, setUserVF] = useState<Record<number, boolean | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [vfChecked, setVfChecked] = useState(false);
  const [vfScore, setVfScore] = useState(0);

  const handleSelectVF = (qId: number, val: boolean) => {
    playSound('click');
    setUserVF((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckVF = () => {
    let score = 0;
    for (let i = 1; i <= 4; i++) {
      if (userVF[i] === vfAnswers[i]) score++;
    }
    setVfScore(score);
    setVfChecked(true);

    if (score >= 3) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 1: true }));
      addXP(50, 'Exercice 1 Angles validé !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 2: Reconnaître le type d'angle (4 figures)
  // 1: aigu, 2: obtus, 3: droit, 4: aigu
  // ----------------------------------------------------
  const recAnswers: Record<number, 'aigu' | 'droit' | 'obtus'> = {
    1: 'aigu',
    2: 'obtus',
    3: 'droit',
    4: 'aigu',
  };

  const [userRec, setUserRec] = useState<Record<number, 'aigu' | 'droit' | 'obtus' | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [recChecked, setRecChecked] = useState(false);
  const [recScore, setRecScore] = useState(0);

  const handleSelectRec = (figId: number, val: 'aigu' | 'droit' | 'obtus') => {
    playSound('click');
    setUserRec((prev) => ({ ...prev, [figId]: val }));
  };

  const handleCheckRec = () => {
    let score = 0;
    for (let i = 1; i <= 4; i++) {
      if (userRec[i] === recAnswers[i]) score++;
    }
    setRecScore(score);
    setRecChecked(true);

    if (score === 4) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 2: true }));
      addXP(70, 'Reconnaissance des angles réussie sans faute !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 3: La notation d'un angle
  // 1: milieu, 2: A_chap, 3: MAN, 4: NAM
  // ----------------------------------------------------
  const notAnswers: Record<number, string> = {
    1: 'milieu',
    2: 'A_chap',
    3: 'MAN',
    4: 'NAM',
  };

  const [userNot, setUserNot] = useState<Record<number, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [notChecked, setNotChecked] = useState(false);
  const [notScore, setNotScore] = useState(0);

  const handleSelectNot = (qId: number, val: string) => {
    playSound('click');
    setUserNot((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckNot = () => {
    let score = 0;
    for (let i = 1; i <= 4; i++) {
      if (userNot[i] === notAnswers[i]) score++;
    }
    setNotScore(score);
    setNotChecked(true);

    if (score >= 3) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 3: true }));
      addXP(60, 'Notation des angles maîtrisée !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 4: Définitions et propriétés
  // 1: ecart, 2: 1s_2c, 3: perp, 4: obtus
  // ----------------------------------------------------
  const defAnswers: Record<number, string> = {
    1: 'ecart',
    2: '1s_2c',
    3: 'perp',
    4: 'obtus',
  };

  const [userDef, setUserDef] = useState<Record<number, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [defChecked, setDefChecked] = useState(false);
  const [defScore, setDefScore] = useState(0);

  const handleSelectDef = (qId: number, val: string) => {
    playSound('click');
    setUserDef((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckDef = () => {
    let score = 0;
    for (let i = 1; i <= 4; i++) {
      if (userDef[i] === defAnswers[i]) score++;
    }
    setDefScore(score);
    setDefChecked(true);

    if (score === 4) {
      playSound('fanfare');
      fireGrandCelebration();
      setCompletedExercises((prev) => ({ ...prev, 4: true }));
      addXP(80, 'Expert des angles certifié !');
      setMissionCompleted('angles', true);
      unlockTrophy('maitre_angles');
      if (onComplete) onComplete();
    } else {
      playSound('error');
    }
  };

  const readLessonAloud = () => {
    const text =
      "Fiche Geom 2 : Les angles. Définition : Un angle est l'espace qui se trouve entre deux droites qui se coupent. Composition : Un angle possède un sommet noté A et deux côtés. Sa grandeur dépend uniquement de l'écartement de ses côtés et non de leur longueur. Notation : On le note avec un chapeau, par exemple Â ou MÂN, avec toujours le sommet placé au milieu. Les 3 sortes d'angles : L'angle droit a ses côtés perpendiculaires et forme le coin de l'équerre. L'angle aigu est plus petit qu'un angle droit. L'angle obtus est plus grand qu'un angle droit.";
    playSound('click');
    speakText(text);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar
        title="📐 Fiche Geom 2 : Les angles"
        badgeText="Mathématiques • Géométrie CM1"
        badgeBg="bg-blue-100 text-blue-900 border-blue-300"
        onHome={onHome}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('home');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>📐</span> <span>La Leçon</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('exercises');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'exercises'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🎮</span> <span>Les 4 Exercices</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                {Object.values(completedExercises).filter(Boolean).length}/4
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
            <span>📐</span>
            <span>Angles droits, aigus et obtus</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : ACCUEIL                                          */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-sky-900 text-white p-6 sm:p-9 shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-blue-200 border border-white/10">
                  <span>📐</span> GÉOMÉTRIE & ÉQUERRE CM1
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-fredoka leading-tight">
                  Maîtrise les 3 sortes d'angles !
                </h2>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Apprends à identifier les angles droits, aigus et obtus, utilise la notation avec un chapeau et deviens incollable sur leurs propriétés géométriques.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('lesson')}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black font-fredoka rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>📜</span> Lire la Leçon Complète
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('exercises');
                      setActiveExercise(1);
                    }}
                    className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🎮</span> Commencer les Exercices
                  </button>
                </div>
              </div>
            </div>

            {/* Repères des angles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Angle droit</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-blue-700 mt-1">Équerre</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Côtés perpendiculaires</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Angle aigu</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-emerald-700 mt-1">Plus petit</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Moins ouvert que le droit</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Angle obtus</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-amber-600 mt-1">Plus grand</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Plus ouvert que le droit</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Notation</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-purple-700 mt-1">Â ou MÂN</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Sommet toujours au milieu</p>
              </div>
            </div>

            {/* 4 Exercices cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-fredoka text-stone-800 flex items-center gap-2">
                <span>🎮</span> Les 4 Exercices d'entraînement :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    icon: '⚡',
                    title: '1. Vrai ou Faux',
                    desc: '4 questions pour vérifier tes connaissances de base sur la définition des angles.',
                    color: 'bg-blue-600 hover:bg-blue-700',
                  },
                  {
                    id: 2,
                    icon: '📐',
                    title: '2. Reconnaître le type d’angle',
                    desc: 'Observe les 4 figures géométriques et indique si c’est un angle droit, aigu ou obtus.',
                    color: 'bg-indigo-600 hover:bg-indigo-700',
                  },
                  {
                    id: 3,
                    icon: '✏️',
                    title: '3. La Notation d’un angle',
                    desc: 'Maîtrise le chapeau et la position centrale obligatoire du sommet (Â, MÂN, NÂM).',
                    color: 'bg-emerald-600 hover:bg-emerald-700',
                  },
                  {
                    id: 4,
                    icon: '🔍',
                    title: '4. Définitions et propriétés',
                    desc: '4 questions sur l’écartement des côtés, les côtés perpendiculaires et la grandeur.',
                    color: 'bg-purple-600 hover:bg-purple-700',
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
                      <span>Lancer l'Exercice</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2 : LA LEÇON                                         */}
        {/* ======================================================== */}
        {activeTab === 'lesson' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                  Fiche Geom 2 • Géométrie CM1
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-stone-800 mt-1">
                  Les angles
                </h2>
              </div>
              <button
                onClick={readLessonAloud}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Écouter la leçon
              </button>
            </div>

            {/* Règles */}
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>Définition :</strong> Un <strong>angle</strong> est l'espace qui se trouve entre deux droites qui se coupent.
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>Composition :</strong> Un angle a un <strong>sommet</strong> (noté A) et <strong>deux côtés</strong>. Sa grandeur dépend uniquement de <strong>l'écartement des côtés</strong>.
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>Notation :</strong> On le note avec un chapeau : <strong>Â</strong> ou <strong>MÂN</strong> (avec toujours le <strong>sommet au milieu</strong> et un point sur chaque côté).
              </div>
            </div>

            {/* Les 3 sortes d'angles illustrés en SVG */}
            <div>
              <h3 className="font-bold text-stone-900 text-base font-fredoka mb-3">
                Les 3 sortes d'angles géométriques :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Angle droit */}
                <div className="bg-stone-50 border-2 border-blue-200 p-4 rounded-2xl text-center space-y-2">
                  <svg viewBox="0 0 100 80" className="w-32 h-24 mx-auto">
                    <line x1="20" y1="70" x2="90" y2="70" stroke="#0f172a" strokeWidth="3" />
                    <line x1="20" y1="70" x2="20" y2="10" stroke="#0f172a" strokeWidth="3" />
                    <rect x="20" y="55" width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  </svg>
                  <h4 className="font-black text-blue-900 text-base font-fredoka">Angle droit</h4>
                  <p className="text-xs text-stone-600">
                    Les côtés sont <strong>perpendiculaires</strong> (forme le coin de l'équerre).
                  </p>
                </div>

                {/* Angle aigu */}
                <div className="bg-stone-50 border-2 border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                  <svg viewBox="0 0 100 80" className="w-32 h-24 mx-auto">
                    <line x1="20" y1="70" x2="90" y2="70" stroke="#0f172a" strokeWidth="3" />
                    <line x1="20" y1="70" x2="65" y2="15" stroke="#0f172a" strokeWidth="3" />
                    <path d="M 40 70 A 20 20 0 0 0 34 53" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                  </svg>
                  <h4 className="font-black text-emerald-900 text-base font-fredoka">Angle aigu</h4>
                  <p className="text-xs text-stone-600">
                    L'angle est <strong>plus petit</strong> (moins ouvert) qu'un angle droit.
                  </p>
                </div>

                {/* Angle obtus */}
                <div className="bg-stone-50 border-2 border-amber-200 p-4 rounded-2xl text-center space-y-2">
                  <svg viewBox="0 0 100 80" className="w-32 h-24 mx-auto">
                    <line x1="50" y1="70" x2="95" y2="70" stroke="#0f172a" strokeWidth="3" />
                    <line x1="50" y1="70" x2="10" y2="20" stroke="#0f172a" strokeWidth="3" />
                    <path d="M 70 70 A 20 20 0 0 0 35 52" fill="none" stroke="#dc2626" strokeWidth="2.5" />
                  </svg>
                  <h4 className="font-black text-amber-900 text-base font-fredoka">Angle obtus</h4>
                  <p className="text-xs text-stone-600">
                    L'angle est <strong>plus grand</strong> (plus ouvert) qu'un angle droit.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setActiveTab('exercises');
                  setActiveExercise(1);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Passer aux Exercices</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3 : LES 4 EXERCICES                                  */}
        {/* ======================================================== */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Exercise Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-stone-200">
              {[
                { id: 1, label: '1. Vrai / Faux', icon: '⚡' },
                { id: 2, label: '2. Reconnaître', icon: '📐' },
                { id: 3, label: '3. Notation', icon: '✏️' },
                { id: 4, label: '4. Propriétés', icon: '🔍' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(b.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeExercise === b.id
                      ? 'bg-blue-600 text-white shadow-xs'
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

            {/* --- EXERCICE 1 : VRAI / FAUX --- */}
            {activeExercise === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-stone-900">
                      Exercice 1 : Vrai ou Faux
                    </h3>
                    <p className="text-xs text-stone-500">Réponds aux 4 affirmations sur les angles.</p>
                  </div>
                  {vfChecked && (
                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      Score : {vfScore} / 4
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {[
                    { id: 1, text: "Un angle est l'espace qui se trouve entre deux droites parallèles." },
                    { id: 2, text: "Les côtés d'un angle droit sont perpendiculaires." },
                    { id: 3, text: "Un angle obtus est plus petit qu'un angle droit." },
                    { id: 4, text: "La grandeur d'un angle dépend de l'écartement de ses côtés." },
                  ].map((q) => {
                    const ans = userVF[q.id];
                    const isCorrect = vfChecked && ans === vfAnswers[q.id];
                    const isWrong = vfChecked && ans !== null && ans !== vfAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold text-stone-800">
                          {q.id}. {q.text}
                        </p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleSelectVF(q.id, true)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              ans === true
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            Vrai
                          </button>
                          <button
                            onClick={() => handleSelectVF(q.id, false)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              ans === false
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            Faux
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckVF}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider l'Exercice 1
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 2 : RECONNAÎTRE LE TYPE D'ANGLE --- */}
            {activeExercise === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-stone-900">
                      Exercice 2 : Reconnaître le type d'angle
                    </h3>
                    <p className="text-xs text-stone-500">Observe chaque figure et choisis la bonne réponse.</p>
                  </div>
                  {recChecked && (
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      Score : {recScore} / 4
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Figure 1 (aigu) */}
                  <div className="bg-stone-50 p-4 rounded-2xl border text-center space-y-3">
                    <p className="text-xs font-bold text-stone-700">Figure 1 :</p>
                    <svg viewBox="0 0 100 80" className="w-32 h-20 mx-auto">
                      <line x1="20" y1="70" x2="85" y2="70" stroke="#0f172a" strokeWidth="3" />
                      <line x1="20" y1="70" x2="70" y2="20" stroke="#0f172a" strokeWidth="3" />
                    </svg>
                    <div className="flex justify-center gap-1.5">
                      {(['aigu', 'droit', 'obtus'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelectRec(1, t)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            userRec[1] === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Figure 2 (obtus) */}
                  <div className="bg-stone-50 p-4 rounded-2xl border text-center space-y-3">
                    <p className="text-xs font-bold text-stone-700">Figure 2 :</p>
                    <svg viewBox="0 0 100 80" className="w-32 h-20 mx-auto">
                      <line x1="50" y1="70" x2="90" y2="70" stroke="#0f172a" strokeWidth="3" />
                      <line x1="50" y1="70" x2="15" y2="20" stroke="#0f172a" strokeWidth="3" />
                    </svg>
                    <div className="flex justify-center gap-1.5">
                      {(['aigu', 'droit', 'obtus'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelectRec(2, t)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            userRec[2] === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Figure 3 (droit) */}
                  <div className="bg-stone-50 p-4 rounded-2xl border text-center space-y-3">
                    <p className="text-xs font-bold text-stone-700">Figure 3 :</p>
                    <svg viewBox="0 0 100 80" className="w-32 h-20 mx-auto">
                      <line x1="20" y1="70" x2="85" y2="70" stroke="#0f172a" strokeWidth="3" />
                      <line x1="20" y1="70" x2="20" y2="15" stroke="#0f172a" strokeWidth="3" />
                      <rect x="20" y="55" width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-center gap-1.5">
                      {(['aigu', 'droit', 'obtus'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelectRec(3, t)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            userRec[3] === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Figure 4 (aigu) */}
                  <div className="bg-stone-50 p-4 rounded-2xl border text-center space-y-3">
                    <p className="text-xs font-bold text-stone-700">Figure 4 :</p>
                    <svg viewBox="0 0 100 80" className="w-32 h-20 mx-auto">
                      <line x1="30" y1="65" x2="90" y2="65" stroke="#0f172a" strokeWidth="3" />
                      <line x1="30" y1="65" x2="70" y2="35" stroke="#0f172a" strokeWidth="3" />
                    </svg>
                    <div className="flex justify-center gap-1.5">
                      {(['aigu', 'droit', 'obtus'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelectRec(4, t)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            userRec[4] === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckRec}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider la Reconnaissance
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 3 : NOTATION D'UN ANGLE --- */}
            {activeExercise === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-stone-900">
                      Exercice 3 : La notation d'un angle
                    </h3>
                    <p className="text-xs text-stone-500">Mémorise la notation géométrique officielle.</p>
                  </div>
                  {notChecked && (
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Score : {notScore} / 4
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Q1 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">1. Où doit toujours se situer le sommet dans la notation d'un angle à 3 lettres ?</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'debut', l: 'Au début' },
                        { k: 'milieu', l: 'Au milieu' },
                        { k: 'fin', l: 'À la fin' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectNot(1, o.k)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userNot[1] === o.k ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">2. Si un angle a pour sommet le point A, comment peut-on l'écrire avec une seule lettre ?</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'A', l: 'A' },
                        { k: 'A_chap', l: 'Â' },
                        { k: 'A_barre', l: 'Ā' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectNot(2, o.k)}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userNot[2] === o.k ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">3. L'angle a pour sommet A et ses côtés passent par M et N. Quelle écriture est correcte ?</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'AMN', l: 'ÂMN' },
                        { k: 'MAN', l: 'MÂN' },
                        { k: 'MNA', l: 'MNÂ' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectNot(3, o.k)}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userNot[3] === o.k ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">4. Quelle autre écriture désigne exactement le même angle que MÂN ?</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'NAM', l: 'NÂM' },
                        { k: 'ANM', l: 'AN̂M' },
                        { k: 'NMA', l: 'NM̂A' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectNot(4, o.k)}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userNot[4] === o.k ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckNot}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider la Notation
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 4 : PROPRIÉTÉS ET DÉFINITIONS --- */}
            {activeExercise === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-stone-900">
                      Exercice 4 : Définitions et propriétés
                    </h3>
                    <p className="text-xs text-stone-500">Valide les 4 propriétés fondamentales des angles.</p>
                  </div>
                  {defChecked && (
                    <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      Score : {defScore} / 4
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Q1 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">1. De quoi dépend la grandeur d'un angle ?</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {[
                        { k: 'longueur', l: 'De la longueur des côtés' },
                        { k: 'ecart', l: 'De l’écartement des côtés' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectDef(1, o.k)}
                          className={`p-2.5 rounded-xl font-bold transition text-left cursor-pointer ${
                            userDef[1] === o.k ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">2. Un angle est formé de :</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {[
                        { k: '1s_2c', l: 'Un sommet et deux côtés' },
                        { k: '2s_1c', l: 'Deux sommets et un côté' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectDef(2, o.k)}
                          className={`p-2.5 rounded-xl font-bold transition text-left cursor-pointer ${
                            userDef[2] === o.k ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">3. Comment qualifie-t-on les côtés d'un angle droit ?</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'para', l: 'Parallèles' },
                        { k: 'perp', l: 'Perpendiculaires' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectDef(3, o.k)}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userDef[3] === o.k ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">4. Si un angle est plus grand qu'un angle droit, c'est un angle :</p>
                    <div className="flex gap-2">
                      {[
                        { k: 'aigu', l: 'Aigu' },
                        { k: 'obtus', l: 'Obtus' },
                      ].map((o) => (
                        <button
                          key={o.k}
                          onClick={() => handleSelectDef(4, o.k)}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            userDef[4] === o.k ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckDef}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider les Propriétés ➔
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
