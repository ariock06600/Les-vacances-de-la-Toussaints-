import React, { useState, useEffect } from 'react';
import {
  getActiveProfile,
  getAllProfiles,
  saveCurrentStateToActiveProfile,
  updateActiveProfileDetails,
  switchProfile,
  createNewProfile,
  deleteProfile,
  downloadSaveFile,
  exportAsCode,
  importFromJSONString,
  importFromCode,
  AVAILABLE_AVATARS,
  SaveProfile,
} from '../utils/saveSystem';
import { playSound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import {
  X,
  Save,
  Download,
  Upload,
  User,
  Users,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface SaveSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged: () => void;
}

export const SaveSystemModal: React.FC<SaveSystemModalProps> = ({
  isOpen,
  onClose,
  onProfileChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'profiles' | 'export' | 'import'>('status');

  const [activeProfile, setActiveProfile] = useState<SaveProfile>(getActiveProfile());
  const [profileName, setProfileName] = useState(activeProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(activeProfile.avatar);

  const [allProfiles, setAllProfiles] = useState<SaveProfile[]>(getAllProfiles());
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('🐿️');

  const [copyFeedback, setCopyFeedback] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [justSavedNotice, setJustSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getActiveProfile();
      setActiveProfile(current);
      setProfileName(current.name);
      setSelectedAvatar(current.avatar);
      setAllProfiles(getAllProfiles());
      setImportError(null);
      setImportSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSave = () => {
    const updated = saveCurrentStateToActiveProfile();
    setActiveProfile(updated);
    setAllProfiles(getAllProfiles());
    playSound('success');
    fireConfetti({ particleCount: 30, spread: 50 });
    setJustSavedNotice(true);
    setTimeout(() => setJustSavedNotice(false), 2500);
  };

  const handleUpdateProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateActiveProfileDetails(profileName, selectedAvatar);
    setActiveProfile(updated);
    setAllProfiles(getAllProfiles());
    playSound('click');
    onProfileChanged();
    setJustSavedNotice(true);
    setTimeout(() => setJustSavedNotice(false), 2000);
  };

  const handleSwitch = (id: string) => {
    playSound('click');
    const switched = switchProfile(id);
    if (switched) {
      setActiveProfile(switched);
      setProfileName(switched.name);
      setSelectedAvatar(switched.avatar);
      setAllProfiles(getAllProfiles());
      onProfileChanged();
      fireConfetti({ particleCount: 40, spread: 60 });
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    playSound('success');
    const created = createNewProfile(newProfileName, newProfileAvatar);
    setActiveProfile(created);
    setProfileName(created.name);
    setSelectedAvatar(created.avatar);
    setAllProfiles(getAllProfiles());
    setNewProfileName('');
    setActiveTab('status');
    onProfileChanged();
    fireConfetti({ particleCount: 50, spread: 70 });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Supprimer définitivement le profil de "${name}" ?`)) {
      playSound('error');
      deleteProfile(id);
      setActiveProfile(getActiveProfile());
      setAllProfiles(getAllProfiles());
      onProfileChanged();
    }
  };

  const handleCopyCode = () => {
    const code = exportAsCode();
    navigator.clipboard.writeText(code);
    playSound('success');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleImportCode = () => {
    setImportError(null);
    const res = importFromCode(importCode);
    if (res.success) {
      playSound('fanfare');
      fireConfetti();
      setImportSuccess(true);
      setActiveProfile(getActiveProfile());
      setAllProfiles(getAllProfiles());
      onProfileChanged();
      setTimeout(() => {
        setImportSuccess(false);
        setActiveTab('status');
      }, 1500);
    } else {
      playSound('error');
      setImportError(res.error || 'Erreur lors de l’importation');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromJSONString(content);
      if (res.success) {
        playSound('fanfare');
        fireConfetti();
        setImportSuccess(true);
        setActiveProfile(getActiveProfile());
        setAllProfiles(getAllProfiles());
        onProfileChanged();
        setTimeout(() => {
          setImportSuccess(false);
          setActiveTab('status');
        }, 1500);
      } else {
        playSound('error');
        setImportError(res.error || 'Fichier JSON non valide.');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'À l’instant';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl border-3 border-amber-300 shadow-2xl flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/20 rounded-2xl shadow-inner">💾</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-fredoka leading-tight">
                Système de Sauvegarde CM1
              </h2>
              <p className="text-emerald-100 text-xs font-medium">
                Profils, sauvegarde automatique, export et restauration
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 pt-2 flex gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'status', label: 'Mon Profil & Sauvegarde', icon: '👤' },
            { id: 'profiles', label: 'Changer de Profil', icon: '👥' },
            { id: 'export', label: 'Exporter / Sauvegarder', icon: '📥' },
            { id: 'import', label: 'Restaurer / Importer', icon: '📤' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3.5 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
                activeTab === tab.id
                  ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu Déroulant */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-5">
          {/* ======================================================== */}
          {/* ONGLET 1 : STATUT & MON PROFIL                           */}
          {/* ======================================================== */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Statut En direct */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-emerald-100 rounded-2xl animate-pulse">
                    🟢
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm font-fredoka">
                      Sauvegarde automatique active
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Dernier enregistrement : {formatDate(activeProfile.lastSavedAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleManualSave}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>

              {justSavedNotice && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  Progression et trophées enregistrés avec succès !
                </div>
              )}

              {/* Formulaire de modification du profil */}
              <form onSubmit={handleUpdateProfileDetails} className="space-y-4 bg-stone-50 p-5 rounded-3xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm font-fredoka flex items-center gap-2">
                  <span>✏️</span> Personnaliser le prénom et l'avatar
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Prénom de l'élève :
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    maxLength={20}
                    placeholder="Ex: Lucas, Léa, Arthur..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden text-sm font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">
                    Choisis ta mascotte :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`text-2xl p-2 rounded-2xl transition cursor-pointer ${
                          selectedAvatar === av
                            ? 'bg-amber-400 scale-110 shadow-sm border-2 border-amber-500'
                            : 'bg-white border border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Mettre à jour mon profil
                  </button>
                </div>
              </form>

              {/* Résumé des acquis du profil actuel */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">XP accumulés</span>
                  <span className="text-base font-black text-orange-600 font-fredoka">⚡ {activeProfile.xp} XP</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Missions faites</span>
                  <span className="text-base font-black text-emerald-700 font-fredoka">
                    🎒 {Object.values(activeProfile.missions || {}).filter(Boolean).length} / 8
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Trophées</span>
                  <span className="text-base font-black text-amber-700 font-fredoka">
                    🏆 {Object.keys(activeProfile.trophies || {}).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 2 : CHANGER DE PROFIL / FRATRIE                   */}
          {/* ======================================================== */}
          {activeTab === 'profiles' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-fredoka mb-1">
                  Profils enregistrés sur cet appareil :
                </h4>
                <p className="text-xs text-stone-500">
                  Pratique pour les frères et sœurs : chacun a ses propres trophées et sa progression !
                </p>
              </div>

              <div className="space-y-2.5">
                {allProfiles.map((p) => {
                  const isActive = p.id === activeProfile.id;
                  const completedMissionsCount = Object.values(p.missions || {}).filter(Boolean).length;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs">
                          {p.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">{p.name}</span>
                            {isActive && (
                              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase">
                                En cours
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            ⚡ {p.xp} XP · 🎒 {completedMissionsCount}/8 missions · 🏆 {Object.keys(p.trophies || {}).length} trophées
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive ? (
                          <button
                            onClick={() => handleSwitch(p.id)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                          >
                            Choisir
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Actif
                          </span>
                        )}

                        {allProfiles.length > 1 && (
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer ce profil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formulaire nouveau profil */}
              <form onSubmit={handleCreateProfile} className="bg-amber-50 p-4 rounded-3xl border border-amber-200 space-y-3">
                <h5 className="font-bold text-amber-950 text-xs font-fredoka uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-700" /> Ajouter un nouveau joueur :
                </h5>

                <div className="flex gap-2">
                  <select
                    value={newProfileAvatar}
                    onChange={(e) => setNewProfileAvatar(e.target.value)}
                    className="p-2 text-xl bg-white border border-amber-300 rounded-xl"
                  >
                    {AVAILABLE_AVATARS.map((av) => (
                      <option key={av} value={av}>{av}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Prénom du nouvel élève..."
                    className="flex-1 px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-hidden"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-95"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 3 : EXPORTER / SAUVEGARDER                        */}
          {/* ======================================================== */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-emerald-700" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm font-fredoka">
                      Télécharger le fichier de sauvegarde (.json)
                    </h4>
                    <p className="text-xs text-stone-500">
                      Garde un fichier sur ton ordinateur ou ta clé USB pour ne jamais perdre tes points.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playSound('success');
                    downloadSaveFile();
                  }}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger ma sauvegarde ({activeProfile.name})</span>
                </button>
              </div>

              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Copy className="w-6 h-6 text-amber-700" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm font-fredoka">
                      Copier le code de sauvegarde
                    </h4>
                    <p className="text-xs text-stone-500">
                      Idéal sur tablette : copie un texte magique pour transférer ta partie sur un autre appareil !
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4" /> <span>Code copié dans le presse-papiers !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> <span>Copier mon code secret de sauvegarde</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 4 : RESTAURER / IMPORTER                          */}
          {/* ======================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  Sauvegarde restaurée avec succès !
                </div>
              )}

              {/* Option 1: File Upload */}
              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-sm font-fredoka flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-700" /> Option 1 : Charger un fichier (.json)
                </h4>
                <p className="text-xs text-stone-500">
                  Sélectionne le fichier téléchargé précédemment sur ton ordinateur.
                </p>

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                />
              </div>

              {/* Option 2: Paste Code */}
              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-sm font-fredoka flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-700" /> Option 2 : Coller un code de sauvegarde
                </h4>
                <p className="text-xs text-stone-500">
                  Colle le texte secret que tu as copié depuis un autre appareil.
                </p>

                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Colle ton code ici..."
                  rows={3}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-amber-500"
                />

                <button
                  onClick={handleImportCode}
                  disabled={!importCode.trim()}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-95"
                >
                  Restaurer à partir du code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pied de la fenêtre modale */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs text-stone-500">
          <span>🔒 Tes données sont conservées en toute sécurité sur ton appareil.</span>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
