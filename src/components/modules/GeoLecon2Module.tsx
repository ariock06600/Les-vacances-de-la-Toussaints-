import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { playSound } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Check, RotateCcw, ZoomIn, ExternalLink } from 'lucide-react';

interface GeoLecon2ModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const GeoLecon2Module: React.FC<GeoLecon2ModuleProps> = ({ onHome, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'landing' | 'lesson' | 'exercises' | 'trophies'>('landing');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [scores, setScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

  // Ex 1: Origines Tri
  const [selectedOrigin, setSelectedOrigin] = useState<{ id: string; name: string; cat: string } | null>(null);
  const [originBuckets, setOriginBuckets] = useState<Record<string, { id: string; name: string; cat: string }[]>>({
    vegetale: [],
    animale: [],
    minerale: [],
  });

  // Ex 2: Vrai / Faux
  const [vfAnswers, setVfAnswers] = useState<Record<number, boolean | null>>({ 1: null, 2: null, 3: null, 4: null });
  const vfCorrect = { 1: true, 2: false, 3: true, 4: true };

  // Ex 3: Importation QCM
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, string | null>>({ 1: null, 2: null });

  // Ex 4: Transformation Tri (Brut vs Transformé)
  const [selectedTransform, setSelectedTransform] = useState<{ id: string; name: string; cat: string } | null>(null);
  const [transformBuckets, setTransformBuckets] = useState<Record<string, { id: string; name: string; cat: string }[]>>({
    brut: [],
    transforme: [],
  });

  // Ex 5: Circuits Courts vs Longs
  const [selectedCircuit, setSelectedCircuit] = useState<{ id: string; name: string; cat: string } | null>(null);
  const [circuitBuckets, setCircuitBuckets] = useState<Record<string, { id: string; name: string; cat: string }[]>>({
    court: [],
    long: [],
  });

  // Ex 6: Cloze
  const [selectedBankWord, setSelectedBankWord] = useState<string | null>(null);
  const [clozeSlots, setClozeSlots] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '' });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const checkCompletionAndReward = (newScores: Record<number, number>) => {
    const sum = Object.values(newScores).reduce((a, b) => a + b, 0);
    if (sum >= 20) {
      fireGrandCelebration();
      setMissionCompleted('geo2');
      if (onComplete) onComplete();
    }
  };

  // Ex 1
  const originItems = [
    { id: '1', name: '🥕 Carotte', cat: 'vegetale' },
    { id: '2', name: '🥩 Viande de bœuf', cat: 'animale' },
    { id: '3', name: '🧂 Sel de cuisine', cat: 'minerale' },
    { id: '4', name: '🌾 Épi de blé', cat: 'vegetale' },
    { id: '5', name: '🥛 Lait de vache', cat: 'animale' },
    { id: '6', name: '💧 Eau minérale', cat: 'minerale' },
  ];

  const depositOriginItem = (cat: string) => {
    if (!selectedOrigin) return;
    playSound('click');
    setOriginBuckets((prev) => ({
      ...prev,
      [cat]: [...prev[cat].filter((i) => i.id !== selectedOrigin.id), selectedOrigin],
    }));
    setSelectedOrigin(null);
  };

  const verifyOrigin = () => {
    let pts = 0;
    Object.entries(originBuckets).forEach(([cat, items]) => {
      items.forEach((it) => {
        if (it.cat === cat) pts += 0.67;
      });
    });
    const finalPts = Math.min(4, Math.round(pts));
    if (finalPts >= 3) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }
    const nextScores = { ...scores, 1: finalPts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 2
  const answerVF = (qNum: number, choice: boolean) => {
    const isOk = choice === vfCorrect[qNum as keyof typeof vfCorrect];
    if (isOk) playSound('success');
    else playSound('wrong');

    const nextAnswers = { ...vfAnswers, [qNum]: choice };
    setVfAnswers(nextAnswers);

    let pts = 0;
    Object.entries(nextAnswers).forEach(([q, a]) => {
      if (a === vfCorrect[parseInt(q) as keyof typeof vfCorrect]) pts += 1;
    });

    const nextScores = { ...scores, 2: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 3
  const answerQCM = (qNum: number, opt: string) => {
    const expected = { 1: 'A', 2: 'B' };
    const isOk = opt === expected[qNum as keyof typeof expected];
    if (isOk) playSound('success');
    else playSound('wrong');

    const next = { ...qcmAnswers, [qNum]: opt };
    setQcmAnswers(next);

    let pts = 0;
    if (next[1] === 'A') pts += 2;
    if (next[2] === 'B') pts += 2;

    const nextScores = { ...scores, 3: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 4
  const transformItems = [
    { id: '1', name: '🍎 Pomme fraîche', cat: 'brut' },
    { id: '2', name: '🧀 Fromage affiné', cat: 'transforme' },
    { id: '3', name: '🌾 Grain de blé', cat: 'brut' },
    { id: '4', name: '🍪 Biscuit au chocolat', cat: 'transforme' },
  ];

  const depositTransformItem = (cat: string) => {
    if (!selectedTransform) return;
    playSound('click');
    setTransformBuckets((prev) => ({
      ...prev,
      [cat]: [...prev[cat].filter((i) => i.id !== selectedTransform.id), selectedTransform],
    }));
    setSelectedTransform(null);
  };

  const verifyTransform = () => {
    let pts = 0;
    Object.entries(transformBuckets).forEach(([cat, items]) => {
      items.forEach((it) => {
        if (it.cat === cat) pts += 1;
      });
    });
    if (pts === 4) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }
    const nextScores = { ...scores, 4: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 5
  const circuitItems = [
    { id: '1', name: '🚜 Achat d’œufs directement à la ferme', cat: 'court' },
    { id: '2', name: '🏬 Barquette de fraises espagnoles au supermarché', cat: 'long' },
    { id: '3', name: '🧺 Panier de légumes chez le maraîcher local', cat: 'court' },
    { id: '4', name: '🏭 Boîte de conserve industrielle passée par 3 usines', cat: 'long' },
  ];

  const depositCircuitItem = (cat: string) => {
    if (!selectedCircuit) return;
    playSound('click');
    setCircuitBuckets((prev) => ({
      ...prev,
      [cat]: [...prev[cat].filter((i) => i.id !== selectedCircuit.id), selectedCircuit],
    }));
    setSelectedCircuit(null);
  };

  const verifyCircuit = () => {
    let pts = 0;
    Object.entries(circuitBuckets).forEach(([cat, items]) => {
      items.forEach((it) => {
        if (it.cat === cat) pts += 1;
      });
    });
    if (pts === 4) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }
    const nextScores = { ...scores, 5: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 6
  const dropCloze = (slot: number) => {
    if (!selectedBankWord) return;
    playSound('click');
    setClozeSlots((prev) => ({ ...prev, [slot]: selectedBankWord }));
    setSelectedBankWord(null);
  };

  const verifyCloze = () => {
    const expected = { 1: 'animale', 2: 'importés', 3: 'transformés', 4: 'courts' };
    let pts = 0;
    Object.entries(expected).forEach(([slot, exp]) => {
      if (clozeSlots[parseInt(slot)] === exp) pts += 1;
    });

    if (pts === 4) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }
    const nextScores = { ...scores, 6: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  const trophiesList = [
    { id: 1, title: 'Apprenti Fermier', desc: 'Marquer son premier point.', unlocked: totalScore >= 1, icon: '🌾' },
    { id: 2, title: 'Trieur des 3 Origines', desc: 'Sans-faute sur le tri végétal, animal, minéral.', unlocked: scores[1] === 4, icon: '🌱' },
    { id: 3, title: 'Expert Vrai ou Faux', desc: '4/4 sur le Défi 2.', unlocked: scores[2] === 4, icon: '⚡' },
    { id: 4, title: 'Spécialiste Import-Export', desc: 'Excellence sur les raisons d’importation (Défi 3).', unlocked: scores[3] === 4, icon: '🚢' },
    { id: 5, title: 'Maître de l’Usine', desc: 'Distinguer brut et transformé sans faute (Défi 4).', unlocked: scores[4] === 4, icon: '⚙️' },
    { id: 6, title: 'Consomm’Acteur Local', desc: 'Maîtriser les circuits courts et longs (Défi 5).', unlocked: scores[5] === 4, icon: '🛒' },
    { id: 7, title: 'Grand Maître de l’Assiette', desc: 'Score parfait de 24 sur 24 !', unlocked: totalScore === 24, icon: '👑' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        title="Géographie Leçon 2 : D'où proviennent nos aliments ?"
        badgeText="Cycle 3 • Géographie"
        badgeBg="bg-amber-600 text-white"
        onHome={onHome}
        rightExtra={
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-white/20 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            <span>⭐ {totalScore} / 24 pts</span>
          </div>
        }
      />

      {/* Sub Navigation */}
      <div className="bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-inner">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'landing', label: '🏠 Accueil' },
              { id: 'lesson', label: '📖 Leçon & Doc' },
              { id: 'exercises', label: '✏️ 6 Exercices' },
              { id: 'trophies', label: `🏆 Trophées (${trophiesList.filter((t) => t.unlocked).length}/7)` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click');
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === tab.id ? 'bg-white text-emerald-900 shadow' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: LANDING */}
        {activeTab === 'landing' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-700 text-white p-6 sm:p-10 shadow-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-amber-200">
                🚜 GÉOGRAPHIE & ALIMENTATION • LEÇON 2
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-fredoka tracking-tight leading-tight mt-2">
                D'où proviennent les aliments que nous consommons ?
              </h2>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-medium mt-2 max-w-2xl">
                Découvre les <strong>3 origines</strong> des aliments (végétale, animale, minérale), le voyage des aliments importés, la transformation et les <strong>circuits courts vs longs</strong>.
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('lesson');
                  }}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black font-fredoka text-base rounded-2xl shadow-lg transition"
                >
                  📖 Lire la Leçon
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('exercises');
                  }}
                  className="px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition"
                >
                  🎯 Faire les 6 Exercices (Score: {totalScore}/24)
                </button>
              </div>
            </div>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">🌱</div>
                <h4 className="font-bold text-slate-900 text-base mb-1">3 Origines</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Végétale</strong> (plantes), <strong>Animale</strong> (élevage) ou <strong>Minérale</strong> (eau, sel).
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">🚢</div>
                <h4 className="font-bold text-slate-900 text-base mb-1">France vs Importés</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certains aliments sont importés car impossibles à faire pousser en France (café, banane) ou pas assez produits (viande).
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">⚙️</div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Transformation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Des aliments bruts deviennent des produits transformés : lait &rarr; yaourt, blé &rarr; farine &rarr; biscuits.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">🛒</div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Circuits de Distribution</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Circuit court :</strong> vente directe à la ferme.<br />
                  <strong>Circuit long :</strong> supermarché et intermédiaires.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LESSON */}
        {activeTab === 'lesson' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Texte Officiel du Cahier de Géographie
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-800 mt-2">
                D'où proviennent les aliments que nous consommons ?
              </h2>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/60 p-6 sm:p-8 rounded-3xl border-2 border-emerald-300 space-y-4">
              <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🌱</span>
                <p className="text-base sm:text-lg leading-relaxed text-slate-800">
                  <strong>Les aliments que nous consommons sont d'origine végétale, animale ou minérale.</strong> Ils sont issus de <strong>l'agriculture</strong> et de <strong>l'élevage</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🚢</span>
                <p className="text-base sm:text-lg leading-relaxed text-slate-800">
                  <strong>Certains sont produits en France mais d'autres sont importés de l'étranger</strong> car nous ne pouvons pas les produire (<em>café, banane…</em>) ou pas assez (<em>viande, blé…</em>).
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🥛</span>
                <p className="text-base sm:text-lg leading-relaxed text-slate-800">
                  <strong>Avant d'arriver dans notre assiette certains aliments sont transformés</strong> (lait &rarr; yaourt, blé &rarr; gâteaux).
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🛒</span>
                <p className="text-base sm:text-lg leading-relaxed text-slate-800">
                  <strong>Pour se procurer les aliments, on peut passer par des circuits courts</strong> (vente à la ferme) <strong>ou des circuits longs</strong> (achat de produits transformés en supermarché).
                </p>
              </div>
            </div>

            {/* External link / Doc card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Document Illustré de la Leçon 2</h4>
                  <p className="text-xs text-slate-500">Schéma des filières alimentaires et photographies des exploitations.</p>
                </div>
              </div>
              <a
                href="https://photos.app.goo.gl/xYGAZeT19RpytPrJ6"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <span>🌐</span> Ouvrir le document source
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: 6 EXERCISES */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Exercises tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
              {[
                { id: 1, label: '1. Les 3 Origines' },
                { id: 2, label: '2. Vrai / Faux' },
                { id: 3, label: '3. Importation' },
                { id: 4, label: '4. Transformation' },
                { id: 5, label: '5. Circuits Courts & Longs' },
                { id: 6, label: '6. Texte à Trous' },
              ].map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(ex.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition flex items-center gap-1.5 ${
                    activeExercise === ex.id
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{ex.label}</span>
                  <span className="text-[10px] bg-black/15 px-1.5 py-0.5 rounded-md font-mono">
                    {scores[ex.id]} / 4
                  </span>
                </button>
              ))}
            </div>

            {/* Exercise 1 */}
            {activeExercise === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Défi 1 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Le Tri des 3 Origines</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-700">Score : {scores[1]}/4</span>
                </div>

                <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-slate-600">Aliments à classer :</span>
                  <div className="flex flex-wrap gap-2.5">
                    {originItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          playSound('click');
                          setSelectedOrigin(item);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                          selectedOrigin?.id === item.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { cat: 'vegetale', title: '🌱 VÉGÉTALE', tag: 'Plantes', bg: 'bg-emerald-50 border-emerald-300' },
                    { cat: 'animale', title: '🐄 ANIMALE', tag: 'Élevage', bg: 'bg-rose-50 border-rose-300' },
                    { cat: 'minerale', title: '💎 MINÉRALE', tag: 'Roches / Eau', bg: 'bg-sky-50 border-sky-300' },
                  ].map((b) => (
                    <div
                      key={b.cat}
                      onClick={() => depositOriginItem(b.cat)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition min-h-[160px] flex flex-col ${b.bg}`}
                    >
                      <div className="font-extrabold text-slate-800 text-sm mb-2 flex justify-between">
                        <span>{b.title}</span>
                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full">{b.tag}</span>
                      </div>
                      <div className="space-y-1.5 flex-grow">
                        {originBuckets[b.cat].map((it) => (
                          <div key={it.id} className="p-2 bg-white rounded-xl border text-xs font-bold shadow-xs">
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={verifyOrigin}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                  >
                    Valider le tri
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setOriginBuckets({ vegetale: [], animale: [], minerale: [] });
                    }}
                    className="px-4 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            )}

            {/* Exercise 2 */}
            {activeExercise === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                      Défi 2 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Vrai ou Faux ?</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-teal-700">Score : {scores[2]}/4</span>
                </div>

                {[
                  { q: 1, text: '1. L’eau et le sel sont des aliments d’origine minérale.' },
                  { q: 2, text: '2. La France produit elle-même tout le café et toutes les bananes consommés.' },
                  { q: 3, text: '3. Le yaourt et le fromage sont des aliments transformés à partir du lait.' },
                  { q: 4, text: '4. Acheter directement ses légumes à la ferme est un exemple de circuit court.' },
                ].map((item) => (
                  <div key={item.q} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="font-bold text-slate-800 text-sm sm:text-base">{item.text}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => answerVF(item.q, true)}
                        className={`px-5 py-2 rounded-xl font-black text-sm border-2 transition ${
                          vfAnswers[item.q] === true
                            ? vfCorrect[item.q as keyof typeof vfCorrect] === true
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-rose-500 border-rose-600 text-white'
                            : 'bg-white border-slate-300 hover:border-emerald-500'
                        }`}
                      >
                        VRAI
                      </button>
                      <button
                        onClick={() => answerVF(item.q, false)}
                        className={`px-5 py-2 rounded-xl font-black text-sm border-2 transition ${
                          vfAnswers[item.q] === false
                            ? vfCorrect[item.q as keyof typeof vfCorrect] === false
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-rose-500 border-rose-600 text-white'
                            : 'bg-white border-slate-300 hover:border-rose-500'
                        }`}
                      >
                        FAUX
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercise 3 */}
            {activeExercise === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                      Défi 3 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Produits Français vs Importés</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-sky-700">Score : {scores[3]}/4</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="font-extrabold text-slate-900 text-base">
                    1. Pourquoi le <strong>café</strong> et les <strong>bananes</strong> sont-ils importés de l'étranger ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { key: 'A', text: 'A) Le climat en France métropolitaine ne permet pas de les cultiver' },
                      { key: 'B', text: 'B) Les Français n’aiment pas ces produits' },
                      { key: 'C', text: 'C) Il est interdit de faire pousser des plantes en France' },
                      { key: 'D', text: 'D) Ce sont des produits purement minéraux' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => answerQCM(1, opt.key)}
                        className={`p-3.5 rounded-xl font-bold text-left transition border-2 ${
                          qcmAnswers[1] === opt.key
                            ? opt.key === 'A'
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                              : 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-white border-slate-200 hover:border-sky-400'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="font-extrabold text-slate-900 text-base">
                    2. Pourquoi la France importe-t-elle parfois de la <strong>viande</strong> ou du <strong>blé</strong> alors qu'elle en produit ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { key: 'A', text: 'A) Car les animaux ne mangent pas d’herbe en France' },
                      { key: 'B', text: 'B) Car la production nationale ne suffit pas toujours à couvrir tous les besoins' },
                      { key: 'C', text: 'C) Car le blé français est toxique' },
                      { key: 'D', text: 'D) Pour faire plaisir aux pays voisins' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => answerQCM(2, opt.key)}
                        className={`p-3.5 rounded-xl font-bold text-left transition border-2 ${
                          qcmAnswers[2] === opt.key
                            ? opt.key === 'B'
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                              : 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-white border-slate-200 hover:border-sky-400'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exercise 4 */}
            {activeExercise === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      Défi 4 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Brut vs Transformé</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-purple-700">Score : {scores[4]}/4</span>
                </div>

                <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-slate-600">Aliments à classer :</span>
                  <div className="flex flex-wrap gap-2.5">
                    {transformItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          playSound('click');
                          setSelectedTransform(item);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                          selectedTransform?.id === item.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-purple-400'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { cat: 'brut', title: '🌱 Aliment BRUT', tag: 'Tel quel dans la nature', bg: 'bg-emerald-50 border-emerald-300' },
                    { cat: 'transforme', title: '⚙️ Produit TRANSFORMÉ', tag: 'Passé en usine / recette', bg: 'bg-purple-50 border-purple-300' },
                  ].map((b) => (
                    <div
                      key={b.cat}
                      onClick={() => depositTransformItem(b.cat)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition min-h-[160px] flex flex-col ${b.bg}`}
                    >
                      <div className="font-extrabold text-slate-800 text-sm mb-2 flex justify-between">
                        <span>{b.title}</span>
                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full">{b.tag}</span>
                      </div>
                      <div className="space-y-1.5 flex-grow">
                        {transformBuckets[b.cat].map((it) => (
                          <div key={it.id} className="p-2 bg-white rounded-xl border text-xs font-bold shadow-xs">
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={verifyTransform}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
                >
                  Valider
                </button>
              </div>
            )}

            {/* Exercise 5 */}
            {activeExercise === 5 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      Défi 5 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Circuits Courts & Circuits Longs</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-700">Score : {scores[5]}/4</span>
                </div>

                <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-slate-600">Situations à classer :</span>
                  <div className="flex flex-wrap gap-2.5">
                    {circuitItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          playSound('click');
                          setSelectedCircuit(item);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                          selectedCircuit?.id === item.id
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-amber-400'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { cat: 'court', title: '🧺 CIRCUIT COURT', tag: 'Vente directe du producteur', bg: 'bg-emerald-50 border-emerald-300' },
                    { cat: 'long', title: '🏬 CIRCUIT LONG', tag: 'Plusieurs intermédiaires / supermarché', bg: 'bg-amber-50 border-amber-300' },
                  ].map((b) => (
                    <div
                      key={b.cat}
                      onClick={() => depositCircuitItem(b.cat)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition min-h-[160px] flex flex-col ${b.bg}`}
                    >
                      <div className="font-extrabold text-slate-800 text-sm mb-2 flex justify-between">
                        <span>{b.title}</span>
                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full">{b.tag}</span>
                      </div>
                      <div className="space-y-1.5 flex-grow">
                        {circuitBuckets[b.cat].map((it) => (
                          <div key={it.id} className="p-2 bg-white rounded-xl border text-xs font-bold shadow-xs">
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={verifyCircuit}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  Valider
                </button>
              </div>
            )}

            {/* Exercise 6 */}
            {activeExercise === 6 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                      Défi 6 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Le Texte à Trous de la Leçon 2</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-indigo-700">Score : {scores[6]}/4</span>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-indigo-900">Clique d'abord sur un mot :</span>
                  <div className="flex flex-wrap gap-2">
                    {['animale', 'importés', 'transformés', 'courts'].map((word) => (
                      <button
                        key={word}
                        onClick={() => {
                          playSound('click');
                          setSelectedBankWord(word);
                        }}
                        className={`px-4 py-2 rounded-xl font-black text-sm transition ${
                          selectedBankWord === word
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border-2 border-indigo-300 text-slate-800 hover:border-indigo-600'
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base leading-loose text-slate-800 font-medium space-y-3">
                  Les aliments que nous consommons sont d’origine végétale,{' '}
                  <button
                    onClick={() => dropCloze(1)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-indigo-400 bg-white text-indigo-900 font-bold rounded-xl min-w-[120px] justify-center"
                  >
                    {clozeSlots[1] || '... ? ...'}
                  </button>{' '}
                  ou minérale. Certains aliments sont produits en France mais d’autres sont{' '}
                  <button
                    onClick={() => dropCloze(2)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-indigo-400 bg-white text-indigo-900 font-bold rounded-xl min-w-[110px] justify-center"
                  >
                    {clozeSlots[2] || '... ? ...'}
                  </button>{' '}
                  de l’étranger. Avant d’arriver dans notre assiette, certains aliments sont{' '}
                  <button
                    onClick={() => dropCloze(3)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-indigo-400 bg-white text-indigo-900 font-bold rounded-xl min-w-[130px] justify-center"
                  >
                    {clozeSlots[3] || '... ? ...'}
                  </button>{' '}
                  en usine. Enfin, on peut acheter nos vivres en circuits{' '}
                  <button
                    onClick={() => dropCloze(4)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-indigo-400 bg-white text-indigo-900 font-bold rounded-xl min-w-[100px] justify-center"
                  >
                    {clozeSlots[4] || '... ? ...'}
                  </button>{' '}
                  (à la ferme) ou circuits longs.
                </div>

                <button
                  onClick={verifyCloze}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
                >
                  Vérifier
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TROPHIES */}
        {activeTab === 'trophies' && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Salle des Trophées
                </span>
                <h2 className="text-3xl font-black font-fredoka mt-2">🏆 Galerie des 7 Trophées</h2>
                <p className="text-slate-300 text-sm">Débloque tous les badges en complétant les 6 exercices.</p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center min-w-[200px]">
                <div className="text-xs uppercase text-slate-300 font-bold">Score Total</div>
                <div className="text-3xl font-black font-fredoka text-amber-300">{totalScore} / 24 pts</div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${Math.round((totalScore / 24) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trophiesList.map((tr) => (
                <div
                  key={tr.id}
                  className={`p-4 rounded-2xl border transition ${
                    tr.unlocked
                      ? 'bg-white/15 border-amber-400/60 shadow-md'
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                      {tr.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base font-fredoka text-white">{tr.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{tr.desc}</p>
                      <span className="text-[10px] font-bold text-amber-300 mt-1 inline-block">
                        {tr.unlocked ? '✨ Débloqué !' : '🔒 Verrouillé'}
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
