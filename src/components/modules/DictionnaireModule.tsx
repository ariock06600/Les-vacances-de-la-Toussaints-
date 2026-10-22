import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { playSound, speakText, stopSpeech } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { addXP, unlockTrophy, incrementStreak } from '../../utils/gamification';
import { Check, RotateCcw, Volume2, ArrowRight } from 'lucide-react';

interface DictionnaireModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const DictionnaireModule: React.FC<DictionnaireModuleProps> = ({
  onHome,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'lesson' | 'exercises'>('home');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------
  // EXERCICE 1: Vrai ou Faux (5 questions)
  // ----------------------------------------------------
  const vfAnswers: Record<number, boolean> = { 1: true, 2: false, 3: true, 4: true, 5: true };
  const [userVF, setUserVF] = useState<Record<number, boolean | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });
  const [vfChecked, setVfChecked] = useState(false);
  const [vfScore, setVfScore] = useState(0);

  const handleSelectVF = (qId: number, val: boolean) => {
    playSound('click');
    setUserVF((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckVF = () => {
    let score = 0;
    for (let i = 1; i <= 5; i++) {
      if (userVF[i] === vfAnswers[i]) score++;
    }
    setVfScore(score);
    setVfChecked(true);

    if (score >= 4) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 1: true }));
      addXP(50, 'Exercice 1 Dictionnaire validé !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 2: Les 11 abréviations
  // ----------------------------------------------------
  const abbrevAnswers: Record<string, string> = {
    'n.': 'Nom',
    'm. ou masc.': 'Masculin',
    'v.': 'Verbe',
    'f. ou fém.': 'Féminin',
    'adj.': 'Adjectif',
    'pl.': 'Pluriel',
    'adv.': 'Adverbe',
    'sing.': 'Singulier',
    'inv.': 'Invariable',
    'syn.': 'Synonyme',
    'contr.': 'Contraire',
  };

  const [userAbbrevs, setUserAbbrevs] = useState<Record<string, string>>({});
  const [abbrevChecked, setAbbrevChecked] = useState(false);
  const [abbrevScore, setAbbrevScore] = useState(0);

  const handleSelectAbbrev = (key: string, val: string) => {
    setUserAbbrevs((prev) => ({ ...prev, [key]: val }));
  };

  const handleCheckAbbrev = () => {
    let score = 0;
    Object.keys(abbrevAnswers).forEach((key) => {
      if (userAbbrevs[key] === abbrevAnswers[key]) score++;
    });
    setAbbrevScore(score);
    setAbbrevChecked(true);

    if (score >= 9) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 2: true }));
      addXP(70, 'Tableau des 11 abréviations maîtrisé !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 3: Mots-repères
  // Début : CARTABLE  |  Fin : CHÂTEAU
  // ----------------------------------------------------
  const repereAnswers: Record<number, 'avant' | 'page' | 'apres'> = {
    1: 'page', // Cascade
    2: 'avant', // Cahier
    3: 'apres', // Chien
    4: 'page', // Cavalier
  };

  const [userRepere, setUserRepere] = useState<Record<number, 'avant' | 'page' | 'apres' | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [repereChecked, setRepereChecked] = useState(false);
  const [repereScore, setRepereScore] = useState(0);

  const handleSelectRepere = (qId: number, pos: 'avant' | 'page' | 'apres') => {
    playSound('click');
    setUserRepere((prev) => ({ ...prev, [qId]: pos }));
  };

  const handleCheckRepere = () => {
    let score = 0;
    for (let i = 1; i <= 4; i++) {
      if (userRepere[i] === repereAnswers[i]) score++;
    }
    setRepereScore(score);
    setRepereChecked(true);

    if (score >= 3) {
      playSound('fanfare');
      fireConfetti();
      setCompletedExercises((prev) => ({ ...prev, 3: true }));
      addXP(60, 'Mots-repères trouvés !');
      incrementStreak();
    } else {
      playSound('error');
    }
  };

  // ----------------------------------------------------
  // EXERCICE 4: Analyser l'article "bâtir"
  // ----------------------------------------------------
  const [art1, setArt1] = useState<string | null>(null);
  const [art2, setArt2] = useState<string | null>(null);
  const [art3, setArt3] = useState<string | null>(null);
  const [art4, setArt4] = useState<string | null>(null);
  const [artChecked, setArtChecked] = useState(false);
  const [artScore, setArtScore] = useState(0);

  const handleCheckArt = () => {
    let score = 0;
    if (art1 === 'v') score++;
    if (art2 === 'def') score++;
    if (art3 === 'detruire') score++;
    if (art4 === 'edifier') score++;

    setArtScore(score);
    setArtChecked(true);

    if (score === 4) {
      playSound('fanfare');
      fireGrandCelebration();
      setCompletedExercises((prev) => ({ ...prev, 4: true }));
      addXP(80, 'Article de dictionnaire analysé avec brio !');
      setMissionCompleted('dictionnaire', true);
      unlockTrophy('as_dictionnaire');
      if (onComplete) onComplete();
    } else {
      playSound('error');
    }
  };

  const readLessonAloud = () => {
    const text =
      "Fiche V1 : Le dictionnaire. Règle numéro un : Dans un dictionnaire, les mots sont rangés dans l'ordre alphabétique. On regarde la première lettre, puis la deuxième, puis la troisième. Règle numéro deux : En haut des pages, les mots-repères indiquent le premier mot et le dernier mot de la double page. Règle numéro trois : Le dictionnaire sert à vérifier l'orthographe d'un mot, à connaître sa nature, son genre et ses différents sens. Les exemples sont généralement écrits en italique.";
    playSound('click');
    speakText(text);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar
        title="📖 Fiche V1 : Le dictionnaire"
        badgeText="Français • Vocabulaire CM1"
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
                  ? 'bg-sky-600 text-white shadow-xs'
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
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>📖</span> <span>La Leçon</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('exercises');
                stopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeTab === 'exercises'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🎮</span> <span>Les 4 Exercices</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                {Object.values(completedExercises).filter(Boolean).length}/4
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
            <span>📚</span>
            <span>Ordre alphabétique & Abréviations</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : ACCUEIL                                          */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-9 shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-sky-200 border border-white/10">
                  <span>📖</span> VOCABULAIRE & RECHERCHE CM1
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-fredoka leading-tight">
                  Deviens un as du dictionnaire !
                </h2>
                <p className="text-sky-100 text-sm sm:text-base font-medium">
                  Apprends à retrouver un mot grâce à l'ordre alphabétique et aux mots-repères, décrypte les 11 abréviations indispensables et analyse un article.
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

            {/* Repères du dictionnaire */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Rangement</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-sky-700 mt-1">A à Z</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Ordre alphabétique</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">En haut des pages</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-blue-700 mt-1">Mots-repères</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Premier et dernier mot</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Abréviations</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-emerald-700 mt-1">11 Codes</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Nature, genre, syn., contr.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                <div className="text-[11px] text-stone-500 font-bold uppercase">Exemple</div>
                <div className="text-lg sm:text-xl font-black font-fredoka text-amber-600 mt-1">En italique</div>
                <p className="text-[11px] text-stone-500 mt-0.5">Pour comprendre en contexte</p>
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
                    desc: '5 questions pour vérifier tes réflexes sur le fonctionnement du dictionnaire.',
                    color: 'bg-sky-600 hover:bg-sky-700',
                  },
                  {
                    id: 2,
                    icon: '🔤',
                    title: '2. Tableau des 11 abréviations',
                    desc: 'Associe chaque abréviation (n., m., v., f., adj., pl., adv., sing., inv., syn., contr.).',
                    color: 'bg-emerald-600 hover:bg-emerald-700',
                  },
                  {
                    id: 3,
                    icon: '📑',
                    title: '3. Les Mots-repères',
                    desc: 'Détermine si Cascade, Cahier, Chien et Cavalier sont avant, sur la page ou après.',
                    color: 'bg-indigo-600 hover:bg-indigo-700',
                  },
                  {
                    id: 4,
                    icon: '🔍',
                    title: '4. Analyser un article',
                    desc: 'Étudie l’article "bâtir" : retrouve sa nature, sa définition, son contraire et son synonyme.',
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
                <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Fiche V1 • Vocabulaire CM1
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-stone-800 mt-1">
                  Le dictionnaire
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
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>1. Rangement :</strong> Dans un dictionnaire, les mots sont rangés dans <strong>l'ordre alphabétique</strong>. On regarde la 1ère lettre, puis la 2e, la 3e...
              </div>
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>2. Mots-repères :</strong> En haut des pages, ils indiquent le <strong>1er mot</strong> et le <strong>dernier mot</strong> de la double page.
              </div>
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-sm text-stone-800 leading-relaxed">
                <strong>3. Utilité :</strong> Vérifier l'orthographe, la nature, le genre et les différents sens d'un mot.
              </div>
            </div>

            {/* Exemple d'article annoté */}
            <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Exemple d'article annoté :</span>
              <div className="font-serif text-base sm:text-lg text-stone-800 leading-relaxed">
                <span className="font-black text-amber-900 text-xl">nomade</span>{' '}
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-md">adj. et n.</span>{' '}
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-md">Qui n'a pas d'habitation fixe.</span>{' '}
                <span className="bg-amber-100 text-amber-900 text-xs italic px-2 py-0.5 rounded-md">Les premiers peuples préhistoriques étaient nomades.</span>{' '}
                <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-md">|| contr. sédentaire ||</span>
              </div>
            </div>

            {/* Tableau des 11 abréviations */}
            <div>
              <h3 className="font-bold text-stone-900 text-base font-fredoka mb-3">
                Toutes les abréviations indispensables à retenir :
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[
                  { abr: 'n.', sign: 'Nom' },
                  { abr: 'm. ou masc.', sign: 'Masculin' },
                  { abr: 'v.', sign: 'Verbe' },
                  { abr: 'f. ou fém.', sign: 'Féminin' },
                  { abr: 'adj.', sign: 'Adjectif' },
                  { abr: 'pl.', sign: 'Pluriel' },
                  { abr: 'adv.', sign: 'Adverbe' },
                  { abr: 'sing.', sign: 'Singulier' },
                  { abr: 'inv.', sign: 'Invariable' },
                  { abr: 'syn.', sign: 'Synonyme' },
                  { abr: 'contr.', sign: 'Contraire' },
                ].map((item) => (
                  <div key={item.abr} className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <strong className="text-sky-700">{item.abr}</strong>
                    <span className="text-stone-700 font-bold">{item.sign}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setActiveTab('exercises');
                  setActiveExercise(1);
                }}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
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
                { id: 2, label: '2. Abréviations', icon: '🔤' },
                { id: 3, label: '3. Mots-repères', icon: '📑' },
                { id: 4, label: '4. L\'Article', icon: '🔍' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(b.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeExercise === b.id
                      ? 'bg-sky-600 text-white shadow-xs'
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
                    <p className="text-xs text-stone-500">Réponds aux 5 affirmations du cours.</p>
                  </div>
                  {vfChecked && (
                    <span className="text-sm font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                      Score : {vfScore} / 5
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {[
                    { id: 1, text: "Dans un dictionnaire, les mots sont rangés dans l'ordre alphabétique." },
                    { id: 2, text: "On ne regarde que la 1ère lettre du mot pour le trouver." },
                    { id: 3, text: "Les mots-repères indiquent le premier et le dernier mot de la double page." },
                    { id: 4, text: "L'exemple dans un article est souvent écrit en italique." },
                    { id: 5, text: "Les numéros devant une définition indiquent les différents sens du mot." },
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
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            Vrai
                          </button>
                          <button
                            onClick={() => handleSelectVF(q.id, false)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              ans === false
                                ? 'bg-sky-600 text-white shadow-xs'
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
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider l'Exercice 1
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 2 : ABRÉVIATIONS --- */}
            {activeExercise === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xl font-fredoka text-stone-900">
                      Exercice 2 : Décoder le tableau des 11 abréviations
                    </h3>
                    <p className="text-xs text-stone-500">Associe chaque abréviation à sa signification exacte.</p>
                  </div>
                  {abbrevChecked && (
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Score : {abbrevScore} / 11
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(abbrevAnswers).map((abr) => {
                    const isRight = abbrevChecked && userAbbrevs[abr] === abbrevAnswers[abr];
                    const isWrong = abbrevChecked && userAbbrevs[abr] && userAbbrevs[abr] !== abbrevAnswers[abr];

                    return (
                      <div
                        key={abr}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <span className="font-black text-sky-800 text-sm">{abr}</span>
                        <select
                          value={userAbbrevs[abr] || ''}
                          onChange={(e) => handleSelectAbbrev(abr, e.target.value)}
                          className="px-2 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="">-- Choisir --</option>
                          {[
                            'Nom',
                            'Masculin',
                            'Verbe',
                            'Féminin',
                            'Adjectif',
                            'Pluriel',
                            'Adverbe',
                            'Singulier',
                            'Invariable',
                            'Synonyme',
                            'Contraire',
                          ].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckAbbrev}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Vérifier les 11 abréviations
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 3 : MOTS-REPÈRES --- */}
            {activeExercise === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-stone-900">
                    Exercice 3 : Mots-repères
                  </h3>
                  <p className="text-xs text-stone-500">
                    Place chaque mot par rapport à cette double page de dictionnaire.
                  </p>
                </div>

                {/* Bannière de la double page */}
                <div className="p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl flex items-center justify-between text-sm font-bold text-amber-950">
                  <span>📖 Début : <strong>CARTABLE</strong></span>
                  <span>Fin : <strong>CHÂTEAU</strong> 📖</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 1, word: 'Cascade' },
                    { id: 2, word: 'Cahier' },
                    { id: 3, word: 'Chien' },
                    { id: 4, word: 'Cavalier' },
                  ].map((item) => {
                    const ans = userRepere[item.id];
                    const isCorrect = repereChecked && ans === repereAnswers[item.id];
                    const isWrong = repereChecked && ans !== null && ans !== repereAnswers[item.id];

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <span className="font-bold text-stone-900 text-sm">
                          {item.id}. <strong>{item.word}</strong>
                        </span>

                        <div className="flex gap-1.5 shrink-0">
                          {(['avant', 'page', 'apres'] as const).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => handleSelectRepere(item.id, pos)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                ans === pos
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {pos === 'avant' ? 'Avant' : pos === 'page' ? 'Sur la page' : 'Après'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckRepere}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Vérifier mes choix
                  </button>
                </div>
              </div>
            )}

            {/* --- EXERCICE 4 : L'ARTICLE --- */}
            {activeExercise === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-xl font-fredoka text-stone-900">
                    Exercice 4 : Analyser un article de dictionnaire
                  </h3>
                  <p className="text-xs text-stone-500">Lis attentivement cet extrait pour répondre aux questions.</p>
                </div>

                {/* Article extrait */}
                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 font-serif text-base text-stone-900">
                  <strong className="text-amber-900 text-lg">bâtir</strong> <em>v.</em> Construire un édifice, une maison. <em>Les maçons bâtissent un mur.</em> || syn. <em>édifier</em> ; contr. <em>détruire</em>.
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Q1 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">1. Quelle est la nature de ce mot ?</p>
                    <div className="flex gap-2">
                      {[
                        { key: 'n', label: 'Nom' },
                        { key: 'v', label: 'Verbe' },
                        { key: 'adj', label: 'Adjectif' },
                      ].map((o) => (
                        <button
                          key={o.key}
                          onClick={() => {
                            playSound('click');
                            setArt1(o.key);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            art1 === o.key ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">2. Quelle est la définition ?</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {[
                        { key: 'def', label: 'Construire un édifice, une maison.' },
                        { key: 'ex', label: 'Les maçons bâtissent un mur.' },
                      ].map((o) => (
                        <button
                          key={o.key}
                          onClick={() => {
                            playSound('click');
                            setArt2(o.key);
                          }}
                          className={`p-2.5 rounded-xl font-bold transition text-left cursor-pointer ${
                            art2 === o.key ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">3. Quel est son contraire (`contr.`) ?</p>
                    <div className="flex gap-2">
                      {['détruire', 'édifier'].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            playSound('click');
                            setArt3(w);
                          }}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            art3 === w ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4 */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="font-bold text-stone-800">4. Quel est son synonyme (`syn.`) ?</p>
                    <div className="flex gap-2">
                      {['édifier', 'détruire'].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            playSound('click');
                            setArt4(w);
                          }}
                          className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            art4 === w ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-stone-700'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCheckArt}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm text-xs transition active:scale-95 cursor-pointer"
                  >
                    Valider l'Exercice 4 ➔
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
