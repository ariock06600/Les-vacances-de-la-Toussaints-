import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { playSound } from '../../utils/audio';
import { fireGrandCelebration, fireConfetti } from '../../utils/confetti';
import { setMissionCompleted } from '../../utils/storage';
import { Check, RotateCcw, Award, Globe, HelpCircle, Layers, CheckCircle } from 'lucide-react';

interface GeoLecon1ModuleProps {
  onHome: () => void;
  onComplete?: () => void;
}

export const GeoLecon1Module: React.FC<GeoLecon1ModuleProps> = ({ onHome, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'landing' | 'lesson' | 'exercises' | 'trophies'>('landing');
  const [activeExercise, setActiveExercise] = useState<number>(1);
  const [scores, setScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const [inspectedRegion, setInspectedRegion] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Exercise 1: Vrai / Faux
  const [vfAnswers, setVfAnswers] = useState<Record<number, boolean | null>>({ 1: null, 2: null, 3: null, 4: null });
  const vfCorrect = { 1: true, 2: false, 3: true, 4: false };

  // Exercise 2: Cloze
  const [selectedBankWord, setSelectedBankWord] = useState<string | null>(null);
  const [clozeSlots, setClozeSlots] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '' });
  const [clozeValidated, setClozeValidated] = useState<boolean>(false);

  // Exercise 3: QCM
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, string | null>>({ 1: null, 2: null });

  // Exercise 4: Matching
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});

  // Exercise 5: Sorting
  const [selectedSortItem, setSelectedSortItem] = useState<{ id: string; text: string; cat: string } | null>(null);
  const [sortBuckets, setSortBuckets] = useState<Record<string, { id: string; text: string; cat: string }[]>>({
    'france-base': [],
    'france-hausse': [],
    'monde-moins': [],
  });
  const [sortValidated, setSortValidated] = useState<boolean>(false);

  // Exercise 6: Map Quiz
  const [mapAnswers, setMapAnswers] = useState<Record<number, boolean | null>>({ 1: null, 2: null, 3: null, 4: null });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const checkCompletionAndReward = (newScores: Record<number, number>) => {
    const sum = Object.values(newScores).reduce((a, b) => a + b, 0);
    if (sum >= 20) {
      fireGrandCelebration();
      setMissionCompleted('geo1');
      if (onComplete) onComplete();
    }
  };

  // Inspect map regions
  const inspectRegion = (key: string) => {
    playSound('click');
    const regions: Record<string, { title: string; desc: string; icon: string }> = {
      namerica: {
        title: 'Amérique du Nord (Canada, USA)',
        desc: 'Zone de forte surconsommation : plus de 3 200 calories par jour et par habitant, avec plus de 1 000 kcal d’origine animale (viande, lait).',
        icon: '🍔',
      },
      samerica: {
        title: 'Amérique du Sud',
        desc: 'Moyenne mondiale équilibrée : 2 500 à 2 800 calories par jour, avec une part carnée intermédiaire (environ 450 à 700 kcal).',
        icon: '🥩',
      },
      europe: {
        title: 'Europe (France incluse)',
        desc: 'Surabondance alimentaire : plus de 3 200 calories quotidiennes et forte consommation carnée (>1 000 kcal animales).',
        icon: '🥖',
      },
      africa: {
        title: 'Afrique subsaharienne',
        desc: 'Zone critique de sous-alimentation : moins de 2 200 à 2 500 calories par jour, avec très peu de viande (< 200 kcal carnées).',
        icon: '🌾',
      },
      india: {
        title: 'Inde / Asie du Sud',
        desc: 'Ration modeste (2 200 à 2 500 kcal). L’Inde consomme 60 fois moins de viande qu’un Français (< 200 kcal carnées).',
        icon: '🍚',
      },
      china: {
        title: 'Chine / Asie de l’Est',
        desc: 'Consommation calorique en hausse rapide (environ 2 800 calories) avec augmentation de la viande et du porc.',
        icon: '🥢',
      },
      oceania: {
        title: 'Australie & Océanie',
        desc: 'Pays à très haute ration calorique (> 3 200 kcal/jour) et forte consommation carnée (> 1 000 kcal d’origine animale).',
        icon: '🦘',
      },
    };
    setInspectedRegion(regions[key] || null);
  };

  // Ex 1 V/F
  const answerVF = (qNum: number, val: boolean) => {
    const isCorrect = val === vfCorrect[qNum as keyof typeof vfCorrect];
    if (isCorrect) playSound('success');
    else playSound('wrong');

    const nextAnswers = { ...vfAnswers, [qNum]: val };
    setVfAnswers(nextAnswers);

    let pts = 0;
    Object.entries(nextAnswers).forEach(([q, a]) => {
      if (a === vfCorrect[parseInt(q) as keyof typeof vfCorrect]) pts += 1;
    });

    const nextScores = { ...scores, 1: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 2 Cloze
  const dropWord = (slot: number) => {
    if (!selectedBankWord) return;
    playSound('click');
    setClozeSlots((prev) => ({ ...prev, [slot]: selectedBankWord }));
    setSelectedBankWord(null);
  };

  const verifyCloze = () => {
    const expected = { 1: 'inégalités', 2: '60', 3: 'faim', 4: 'gaspillée' };
    let pts = 0;
    Object.entries(expected).forEach(([slot, exp]) => {
      if (clozeSlots[parseInt(slot)] === exp) pts += 1;
    });

    setClozeValidated(true);
    if (pts === 4) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }

    const nextScores = { ...scores, 2: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 3 QCM
  const answerQCM = (qNum: number, opt: string) => {
    const correctOpts = { 1: 'B', 2: 'C' };
    const isOk = opt === correctOpts[qNum as keyof typeof correctOpts];
    if (isOk) playSound('success');
    else playSound('wrong');

    const next = { ...qcmAnswers, [qNum]: opt };
    setQcmAnswers(next);

    let pts = 0;
    if (next[1] === 'B') pts += 2;
    if (next[2] === 'C') pts += 2;

    const nextScores = { ...scores, 3: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 4 Matching
  const clickMatchLeft = (key: string) => {
    playSound('click');
    setMatchSelectedLeft(key);
  };

  const clickMatchRight = (key: string) => {
    if (!matchSelectedLeft) return;
    playSound('click');
    const isMatch = matchSelectedLeft === key;

    const nextPairs = { ...matchPairs, [matchSelectedLeft]: key };
    setMatchPairs(nextPairs);
    setMatchSelectedLeft(null);

    let pts = 0;
    Object.entries(nextPairs).forEach(([l, r]) => {
      if (l === r) pts += 1;
    });

    if (isMatch) playSound('success');
    else playSound('wrong');

    const nextScores = { ...scores, 4: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 5 Sorting
  const sortPoolItems = [
    { id: '1', text: '🥛 Produits laitiers & Fromages', cat: 'france-base' },
    { id: '2', text: '🍕 Plats préparés industriels', cat: 'france-hausse' },
    { id: '3', text: '🌍 Habitants d’Afrique et d’Asie', cat: 'monde-moins' },
    { id: '4', text: '🥖 Céréales & Viandes traditionnelles', cat: 'france-base' },
    { id: '5', text: '🍬 Sucres & Confiseries', cat: 'france-hausse' },
  ];

  const depositSortItem = (targetCat: string) => {
    if (!selectedSortItem) return;
    playSound('click');
    setSortBuckets((prev) => ({
      ...prev,
      [targetCat]: [...prev[targetCat].filter((item) => item.id !== selectedSortItem.id), selectedSortItem],
    }));
    setSelectedSortItem(null);
  };

  const verifySort = () => {
    let pts = 0;
    let totalItems = 0;
    Object.entries(sortBuckets).forEach(([bucketCat, items]) => {
      items.forEach((it) => {
        totalItems++;
        if (it.cat === bucketCat) pts += 0.8;
      });
    });

    const finalPts = Math.min(4, Math.round(pts));
    setSortValidated(true);

    if (finalPts >= 3) {
      playSound('success');
      fireConfetti();
    } else {
      playSound('wrong');
    }

    const nextScores = { ...scores, 5: finalPts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  // Ex 6 Map questions
  const answerMap = (qNum: number, choice: boolean) => {
    const correctMap = { 1: true, 2: true, 3: true, 4: true };
    const isOk = choice === correctMap[qNum as keyof typeof correctMap];
    if (isOk) playSound('success');
    else playSound('wrong');

    const next = { ...mapAnswers, [qNum]: choice };
    setMapAnswers(next);

    let pts = 0;
    Object.entries(next).forEach(([q, c]) => {
      if (c === correctMap[parseInt(q) as keyof typeof correctMap]) pts += 1;
    });

    const nextScores = { ...scores, 6: pts };
    setScores(nextScores);
    checkCompletionAndReward(nextScores);
  };

  const trophiesList = [
    { id: 1, title: 'Premier Repère', desc: 'Marquer au moins 1 point dans n’importe quel défi.', unlocked: totalScore >= 1, icon: '🌱' },
    { id: 2, title: 'Expert Vrai/Faux', desc: 'Réussir un sans-faute sur le Défi 1 (4/4).', unlocked: scores[1] === 4, icon: '⚡' },
    { id: 3, title: 'Cartographe Mondial', desc: 'Inspecter les continents sur la carte et réussir le Défi 6.', unlocked: scores[6] === 4, icon: '🗺️' },
    { id: 4, title: 'Maître des Chiffres', desc: 'Associer parfaitement les chiffres chocs du Défi 4.', unlocked: scores[4] === 4, icon: '🔢' },
    { id: 5, title: 'Champion du Tri', desc: 'Compléter le grand tri de l’alimentation du Défi 5.', unlocked: scores[5] >= 3, icon: '📦' },
    { id: 6, title: 'Explorateur Émérite', desc: 'Obtenir au moins 18 points sur 24.', unlocked: totalScore >= 18, icon: '🥇' },
    { id: 7, title: 'Grand Maître Géographe', desc: 'Sans-faute légendaire : 24 sur 24 !', unlocked: totalScore === 24, icon: '👑' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        title="Géographie Leçon 1 : Se nourrir dans le monde"
        badgeText="Cycle 3 • Géographie"
        badgeBg="bg-teal-600 text-white"
        onHome={onHome}
        rightExtra={
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-white/20 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            <span>⭐ {totalScore} / 24 pts</span>
          </div>
        }
      />

      {/* Sub Navigation */}
      <div className="bg-emerald-700 text-white shadow-inner">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'landing', label: '🏠 Accueil' },
              { id: 'lesson', label: '🗺️ Carte & Cours' },
              { id: 'exercises', label: '✏️ 6 Défis' },
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 text-white p-6 sm:p-10 shadow-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-black tracking-wide text-emerald-200">
                🚀 QUÊTE GÉOGRAPHIQUE & ALIMENTAIRE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-fredoka tracking-tight leading-tight mt-2">
                Mange-t-on de la même manière partout dans le monde ?
              </h2>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-medium mt-2 max-w-2xl">
                Découvre le planisphère mondial de la <strong>ration calorique</strong> et de <strong>l'alimentation carnée</strong>. Relève les 6 défis pour devenir le grand cartographe de l'alimentation !
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('lesson');
                  }}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black font-fredoka text-base rounded-2xl shadow-lg transition"
                >
                  🗺️ Explorer la Carte & Leçon
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('exercises');
                  }}
                  className="px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition"
                >
                  🎯 Faire les 6 Défis (Score: {totalScore}/24)
                </button>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold mb-2">
                  &gt;3200
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Calories / jour</h4>
                <p className="text-xs text-slate-600 mt-1">En Amérique du Nord et Europe : surabondance calorique.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl mb-2">
                  🥩
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Origine Animale</h4>
                <p className="text-xs text-slate-600 mt-1">Plus de 1000 kcal carnées en Occident contre &lt;200 en Afrique/Inde.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold mb-2">
                  60x
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Inde vs France</h4>
                <p className="text-xs text-slate-600 mt-1">Un Indien consomme 60 fois moins de viande qu'un Français.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold mb-2">
                  1/5
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Gaspillage</h4>
                <p className="text-xs text-slate-600 mt-1">Près d'un cinquième des vivres disponibles chaque jour est jeté.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LESSON & MAP */}
        {activeTab === 'lesson' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Document Officiel de Géographie
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-800 mt-2">
                Ration calorique par habitant et alimentation carnée
              </h2>
            </div>

            {/* Interactive World Map SVG */}
            <div className="bg-gradient-to-b from-sky-50 to-blue-50/50 p-4 sm:p-6 rounded-3xl border-2 border-sky-200 shadow-inner space-y-4">
              <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-600 gap-2 font-bold">
                <span className="text-blue-900 font-bold text-sm">
                  🌐 Planisphère Thématique (Ration calorique & Alimentation carnée)
                </span>
                <span className="bg-white/80 px-3 py-1 rounded-full border border-sky-200 text-sky-800">
                  👆 Clique sur un continent pour inspecter ses calories !
                </span>
              </div>

              <div className="relative w-full overflow-hidden bg-white/70 rounded-2xl border border-sky-200 shadow-sm">
                <svg viewBox="0 0 950 480" className="w-full h-auto select-none">
                  <defs>
                    <pattern id="hatch-1000" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#4a151b" strokeWidth="3" />
                    </pattern>
                    <pattern id="hatch-700" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#7f1d1d" strokeWidth="1.8" />
                    </pattern>
                    <pattern id="hatch-450" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.2" fill="#92400e" />
                      <circle cx="7" cy="7" r="1.2" fill="#92400e" />
                    </pattern>
                  </defs>

                  <rect width="950" height="480" fill="#f0f9ff" />
                  <line x1="0" y1="240" x2="950" y2="240" stroke="#94a3b8" strokeDasharray="6,6" strokeWidth="1.2" />
                  <text x="15" y="235" fontSize="10" fill="#64748b" fontWeight="bold">Équateur (0°)</text>

                  {/* Ocean Labels */}
                  <text x="80" y="280" fontSize="12" fill="#0284c7" fontWeight="800" opacity="0.6">OCÉAN PACIFIQUE</text>
                  <text x="360" y="200" fontSize="12" fill="#0284c7" fontWeight="800" opacity="0.6">OCÉAN ATLANTIQUE</text>
                  <text x="610" y="320" fontSize="12" fill="#0284c7" fontWeight="800" opacity="0.6">OCÉAN INDIEN</text>

                  {/* 1. Amérique du Nord */}
                  <g className="map-region" onClick={() => inspectRegion('namerica')}>
                    <path d="M 120,50 L 260,40 L 290,90 L 250,110 L 270,160 L 210,180 L 160,190 L 120,130 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
                    <path d="M 120,50 L 260,40 L 290,90 L 250,110 L 270,160 L 210,180 L 160,190 L 120,130 Z" fill="url(#hatch-1000)" opacity="0.55" pointerEvents="none" />
                    <text x="180" y="115" fontSize="12" fill="#ffffff" fontWeight="900">AMÉRIQUE DU NORD</text>
                    <text x="180" y="130" fontSize="10" fill="#fecaca" fontWeight="bold">&gt;3200 kcal (Carné: 1000)</text>
                  </g>

                  {/* 2. Amérique du Sud */}
                  <g className="map-region" onClick={() => inspectRegion('samerica')}>
                    <path d="M 220,215 L 290,215 L 320,270 L 290,370 L 250,380 L 230,290 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
                    <path d="M 220,215 L 290,215 L 320,270 L 290,370 L 250,380 L 230,290 Z" fill="url(#hatch-700)" opacity="0.4" pointerEvents="none" />
                    <text x="240" y="290" fontSize="11" fill="#ffffff" fontWeight="900">AMÉRIQUE DU SUD</text>
                    <text x="245" y="305" fontSize="9" fill="#ffedd5" fontWeight="bold">2800 kcal (Carné: 700)</text>
                  </g>

                  {/* 3. Europe */}
                  <g className="map-region" onClick={() => inspectRegion('europe')}>
                    <path d="M 440,65 L 530,60 L 540,110 L 490,140 L 440,135 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
                    <path d="M 440,65 L 530,60 L 540,110 L 490,140 L 440,135 Z" fill="url(#hatch-1000)" opacity="0.55" pointerEvents="none" />
                    <text x="460" y="95" fontSize="12" fill="#ffffff" fontWeight="900">EUROPE</text>
                    <text x="455" y="110" fontSize="9" fill="#fecaca" fontWeight="bold">&gt;3200 kcal (Carné: 1000)</text>
                  </g>

                  {/* 4. Afrique */}
                  <g className="map-region" onClick={() => inspectRegion('africa')}>
                    <path d="M 430,145 L 530,145 L 520,185 L 420,185 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.2" />
                    <path d="M 410,185 L 535,185 L 550,260 L 500,340 L 460,340 L 430,240 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                    <text x="445" y="240" fontSize="12" fill="#713f12" fontWeight="900">AFRIQUE</text>
                    <text x="430" y="255" fontSize="9" fill="#854d0e" fontWeight="bold">&lt; 2200 - 2500 kcal</text>
                  </g>

                  {/* 5. Russie */}
                  <g className="map-region" onClick={() => inspectRegion('russia')}>
                    <path d="M 540,55 L 820,50 L 780,120 L 550,115 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.5" />
                    <text x="640" y="85" fontSize="11" fill="#ffffff" fontWeight="900">RUSSIE / ASIE DU NORD</text>
                  </g>

                  {/* 6. Inde */}
                  <g className="map-region" onClick={() => inspectRegion('india')}>
                    <path d="M 580,165 L 650,160 L 640,240 L 610,250 L 585,210 Z" fill="#fef08a" stroke="#a16207" strokeWidth="1.5" />
                    <text x="590" y="200" fontSize="11" fill="#713f12" fontWeight="900">INDE</text>
                    <text x="585" y="215" fontSize="8" fill="#854d0e" fontWeight="bold">Carné: &lt;200 kcal</text>
                  </g>

                  {/* 7. Asie de l'Est */}
                  <g className="map-region" onClick={() => inspectRegion('china')}>
                    <path d="M 655,130 L 770,125 L 750,210 L 660,200 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
                    <text x="685" y="165" fontSize="11" fill="#ffffff" fontWeight="900">ASIE DE L'EST</text>
                  </g>

                  {/* 8. Australie */}
                  <g className="map-region" onClick={() => inspectRegion('oceania')}>
                    <path d="M 720,290 L 810,285 L 820,360 L 730,365 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
                    <text x="735" y="325" fontSize="11" fill="#ffffff" fontWeight="900">AUSTRALIE</text>
                    <text x="735" y="340" fontSize="9" fill="#fecaca" fontWeight="bold">&gt;3200 (Carné: 1000)</text>
                  </g>
                </svg>
              </div>

              {/* Detail popup on click */}
              {inspectedRegion && (
                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-400 shadow-sm flex items-center gap-3">
                  <span className="text-3xl">{inspectedRegion.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{inspectedRegion.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{inspectedRegion.desc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3 Core Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-2">
                <span className="text-3xl">🥖</span>
                <h3 className="font-bold text-amber-950 font-fredoka text-base">1. La France</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Beaucoup de <strong>céréales</strong>, <strong>produits laitiers</strong> et <strong>viande</strong>.<br />
                  <em>En forte hausse :</em> les sucres et les plats cuisinés industriels.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-2">
                <span className="text-3xl">⚖️</span>
                <h3 className="font-bold text-blue-950 font-fredoka text-base">2. Les Inégalités Mondiales</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  L'<strong>Afrique</strong> et l'<strong>Asie</strong> consomment beaucoup moins que l'Europe et l'Amérique.<br />
                  Un Indien mange <strong>60 fois moins de viande</strong> qu'un Français !
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/80 border-2 border-rose-200 space-y-2">
                <span className="text-3xl">🗑️</span>
                <h3 className="font-bold text-rose-950 font-fredoka text-base">3. Le Paradoxe Alimentaire</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Alors que des millions d'humains <strong>souffrent de la faim</strong>, <strong>un cinquième (1/5)</strong> de toute la nourriture est gaspillée chaque jour.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 6 EXERCISES */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Exercises tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
              {[
                { id: 1, label: '1. Vrai / Faux' },
                { id: 2, label: '2. Texte à Trous' },
                { id: 3, label: '3. QCM Géo' },
                { id: 4, label: '4. Chiffres Chocs' },
                { id: 5, label: '5. Le Grand Tri' },
                { id: 6, label: '6. 🗺️ Carte du Monde' },
              ].map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExercise(ex.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition flex items-center gap-1.5 ${
                    activeExercise === ex.id
                      ? 'bg-emerald-600 text-white shadow'
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
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Vrai ou Faux ?</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-700">Score : {scores[1]}/4</span>
                </div>

                {[
                  { q: 1, text: '1. En France, la consommation de sucres et de plats préparés est en augmentation.' },
                  { q: 2, text: '2. Tous les habitants de la Terre ont un accès identique et égalitaire à la nourriture.' },
                  { q: 3, text: '3. Les Français consomment beaucoup de céréales, produits laitiers et viande.' },
                  { q: 4, text: '4. La nourriture disponible est entièrement mangée : rien n’est jeté chaque jour.' },
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

            {/* Exercise 2 */}
            {activeExercise === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      Défi 2 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Le Texte à Trous</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-blue-700">Score : {scores[2]}/4</span>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-blue-900">Clique d'abord sur un mot :</span>
                  <div className="flex flex-wrap gap-2">
                    {['inégalités', '60', 'faim', 'gaspillée'].map((word) => (
                      <button
                        key={word}
                        onClick={() => {
                          playSound('click');
                          setSelectedBankWord(word);
                        }}
                        className={`px-4 py-2 rounded-xl font-black text-sm transition ${
                          selectedBankWord === word
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-white border-2 border-blue-300 text-slate-800 hover:border-blue-600'
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base leading-loose text-slate-800 font-medium space-y-3">
                  Dans le monde, il y a de profondes{' '}
                  <button
                    onClick={() => dropWord(1)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-blue-400 bg-white text-blue-900 font-bold rounded-xl min-w-[120px] justify-center"
                  >
                    {clozeSlots[1] || '... ? ...'}
                  </button>{' '}
                  d’accès à la nourriture. Les habitants des pays riches d'Europe et d'Amérique consomment plus d'aliments. Un habitant de l’Inde consomme par exemple{' '}
                  <button
                    onClick={() => dropWord(2)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-blue-400 bg-white text-blue-900 font-bold rounded-xl min-w-[90px] justify-center"
                  >
                    {clozeSlots[2] || '... ? ...'}
                  </button>{' '}
                  fois moins de viande qu'un Français. De plus, un grand nombre de personnes souffre de la{' '}
                  <button
                    onClick={() => dropWord(3)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-blue-400 bg-white text-blue-900 font-bold rounded-xl min-w-[110px] justify-center"
                  >
                    {clozeSlots[3] || '... ? ...'}
                  </button>{' '}
                  alors que près d'un cinquième de la nourriture disponible est chaque jour{' '}
                  <button
                    onClick={() => dropWord(4)}
                    className="inline-flex px-4 py-1 border-2 border-dashed border-blue-400 bg-white text-blue-900 font-bold rounded-xl min-w-[130px] justify-center"
                  >
                    {clozeSlots[4] || '... ? ...'}
                  </button>{' '}
                  !
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={verifyCloze}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
                  >
                    Vérifier mes réponses
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setClozeSlots({ 1: '', 2: '', 3: '', 4: '' });
                      setClozeValidated(false);
                    }}
                    className="px-4 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            )}

            {/* Exercise 3 */}
            {activeExercise === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      Défi 3 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Le QCM Géographique</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-purple-700">Score : {scores[3]}/4</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="font-extrabold text-slate-900 text-base">
                    1. Quels continents sont cités dans la leçon comme consommant globalement MOINS d'aliments ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { key: 'A', text: "A) L'Europe et l'Amérique du Nord" },
                      { key: 'B', text: "B) L'Afrique et l'Asie" },
                      { key: 'C', text: "C) L'Océanie et l'Antarctique" },
                      { key: 'D', text: 'D) Le Pôle Sud et le Groenland' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => answerQCM(1, opt.key)}
                        className={`p-3.5 rounded-xl font-bold text-left transition border-2 ${
                          qcmAnswers[1] === opt.key
                            ? opt.key === 'B'
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                              : 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-white border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="font-extrabold text-slate-900 text-base">
                    2. Qu'est-ce qui caractérise l'alimentation en France selon le cours ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { key: 'A', text: 'A) On ne mange presque pas de produits laitiers' },
                      { key: 'B', text: 'B) La consommation de sucre est en très forte diminution' },
                      { key: 'C', text: 'C) On mange beaucoup de céréales, produits laitiers et viande' },
                      { key: 'D', text: 'D) Tous les repas sont exclusivement végétariens' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => answerQCM(2, opt.key)}
                        className={`p-3.5 rounded-xl font-bold text-left transition border-2 ${
                          qcmAnswers[2] === opt.key
                            ? opt.key === 'C'
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                              : 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-white border-slate-200 hover:border-purple-300'
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
                    <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      Défi 4 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Associer les Faits & Chiffres Chocs</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-700">Score : {scores[4]}/4</span>
                </div>

                <p className="text-xs text-slate-500 font-semibold">
                  Clique d'abord sur une case à gauche, puis sur son correspondant à droite.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {[
                      { key: 'inde', label: "🇮🇳 Habitant de l'Inde" },
                      { key: 'gaspillage', label: '🗑️ Nourriture mondiale disponible' },
                      { key: 'riches', label: '🏙️ Europe et Amérique' },
                      { key: 'france', label: '🇫🇷 Consommation en France' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => clickMatchLeft(item.key)}
                        className={`w-full p-4 rounded-2xl border-2 font-bold text-left text-sm transition ${
                          matchPairs[item.key]
                            ? matchPairs[item.key] === item.key
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                              : 'bg-rose-50 border-rose-400 text-rose-950'
                            : matchSelectedLeft === item.key
                            ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-md'
                            : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'gaspillage', label: "Près d'un cinquième (1/5) est gaspillé chaque jour" },
                      { key: 'inde', label: "Consomme 60 fois moins de viande qu'un Français" },
                      { key: 'france', label: 'Forte consommation de céréales, produits laitiers et viande' },
                      { key: 'riches', label: "Pays riches consommant beaucoup plus d'aliments que l'Afrique et l'Asie" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => clickMatchRight(item.key)}
                        className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-400 font-semibold text-left text-sm transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exercise 5 */}
            {activeExercise === 5 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                      Défi 5 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Le Grand Tri de l'Alimentation</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-rose-700">Score : {scores[5]}/4</span>
                </div>

                <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-slate-600">Clique d'abord sur une étiquette :</span>
                  <div className="flex flex-wrap gap-2.5">
                    {sortPoolItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          playSound('click');
                          setSelectedSortItem(item);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                          selectedSortItem?.id === item.id
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-rose-400'
                        }`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Buckets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { cat: 'france-base', title: 'Base en France', tag: 'Tradition', bg: 'bg-emerald-50 border-emerald-300' },
                    { cat: 'france-hausse', title: 'En HAUSSE en France', tag: 'Évolution', bg: 'bg-amber-50 border-amber-300' },
                    { cat: 'monde-moins', title: 'Consomment MOINS', tag: 'Inégalités', bg: 'bg-purple-50 border-purple-300' },
                  ].map((b) => (
                    <div
                      key={b.cat}
                      onClick={() => depositSortItem(b.cat)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition min-h-[160px] flex flex-col ${b.bg}`}
                    >
                      <div className="font-extrabold text-slate-800 text-sm mb-2 flex justify-between">
                        <span>{b.title}</span>
                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full">{b.tag}</span>
                      </div>
                      <div className="space-y-1.5 flex-grow">
                        {sortBuckets[b.cat].map((it) => (
                          <div key={it.id} className="p-2 bg-white rounded-xl border text-xs font-bold shadow-xs">
                            {it.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={verifySort}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                  >
                    Valider le tri
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setSortBuckets({ 'france-base': [], 'france-hausse': [], 'monde-moins': [] });
                      setSortValidated(false);
                    }}
                    className="px-4 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            )}

            {/* Exercise 6 */}
            {activeExercise === 6 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
                      Défi 6 • 4 Points
                    </span>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-800 mt-1">Analyse de la Carte Mondiale</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-cyan-700">Score : {scores[6]}/4</span>
                </div>

                {[
                  {
                    q: 1,
                    text: '1. D’après la légende (rouge foncé), quels continents consomment plus de 3 200 calories par jour ?',
                    optA: 'A) L’Amérique du Nord, l’Europe et l’Australie',
                    optB: 'B) L’Afrique subsaharienne et l’Inde',
                    correctA: true,
                  },
                  {
                    q: 2,
                    text: '2. Comment sont représentées les calories d’origine animale (viande, lait) sur cette carte ?',
                    optA: 'A) Par des cercles de différentes tailles',
                    optB: 'B) Par des hachures et trames plus ou moins denses',
                    correctA: false,
                  },
                  {
                    q: 3,
                    text: '3. Regarde l’Inde sur la carte : quelle est sa situation par rapport à l’alimentation carnée ?',
                    optA: 'A) Très faible (moins de 200 kcal carnées, sans hachures denses)',
                    optB: 'B) La plus forte du monde (plus de 1000 kcal carnées)',
                    correctA: true,
                  },
                  {
                    q: 4,
                    text: '4. Quelle couleur indique sur la carte les pays en situation de sous-alimentation (< 2 200 kcal) ?',
                    optA: 'A) Le jaune pâle (notamment en Afrique subsaharienne)',
                    optB: 'B) Le rouge foncé',
                    correctA: true,
                  },
                ].map((item) => (
                  <div key={item.q} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-800 text-sm">{item.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                      <button
                        onClick={() => answerMap(item.q, true)}
                        className={`p-3 rounded-xl border text-left transition ${
                          mapAnswers[item.q] === true
                            ? item.correctA
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                              : 'bg-rose-100 border-rose-500 text-rose-950 font-bold'
                            : 'bg-white border-slate-200 hover:border-cyan-500'
                        }`}
                      >
                        {item.optA}
                      </button>
                      <button
                        onClick={() => answerMap(item.q, false)}
                        className={`p-3 rounded-xl border text-left transition ${
                          mapAnswers[item.q] === false
                            ? !item.correctA
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                              : 'bg-rose-100 border-rose-500 text-rose-950 font-bold'
                            : 'bg-white border-slate-200 hover:border-cyan-500'
                        }`}
                      >
                        {item.optB}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TROPHIES */}
        {activeTab === 'trophies' && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Salle d'Honneur
                </span>
                <h2 className="text-3xl font-black font-fredoka mt-2">🏆 Galerie des 7 Trophées</h2>
                <p className="text-slate-300 text-sm">Accomplis les quêtes géographiques pour décrocher tous les badges.</p>
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
