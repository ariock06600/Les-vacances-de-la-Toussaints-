import React, { useState, useEffect } from 'react';
import { FallingLeaves } from './components/FallingLeaves';
import { Hub } from './components/Hub';
import { AutodicteeModule } from './components/modules/AutodicteeModule';
import { ConjugaisonModule } from './components/modules/ConjugaisonModule';
import { HistoirePopulationsGauleModule } from './components/modules/HistoirePopulationsGauleModule';
import { HistoireConqueteGauleModule } from './components/modules/HistoireConqueteGauleModule';
import { GeoLecon1Module } from './components/modules/GeoLecon1Module';
import { GeoLecon2Module } from './components/modules/GeoLecon2Module';
import { TablesMultiplicationModule } from './components/modules/TablesMultiplicationModule';
import { Multiplier101001000Module } from './components/modules/Multiplier101001000Module';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { SaveSystemModal } from './components/SaveSystemModal';
import { XPToast } from './components/XPToast';
import {
  MissionId,
  getMissionsProgress,
  toggleMissionProgress,
  resetAllMissionsProgress,
  setMissionCompleted,
} from './utils/storage';
import { saveCurrentStateToActiveProfile } from './utils/saveSystem';

export type CurrentView = 'hub' | MissionId;

export function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('hub');
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isTrophiesOpen, setIsTrophiesOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [, setProfileVersion] = useState(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(getMissionsProgress());

    // Listen to hash changes if user uses back/forward buttons
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as CurrentView;
      const validViews: CurrentView[] = [
        'hub',
        'autodictee1',
        'conjugaison',
        'histoire1',
        'histoire2',
        'geo1',
        'geo2',
        'tables',
        'multiplier',
      ];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else {
        setCurrentView('hub');
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentStateToActiveProfile();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update URL hash when view changes
  const navigateTo = (view: CurrentView) => {
    setCurrentView(view);
    window.location.hash = view === 'hub' ? '' : view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setProgress(getMissionsProgress());
    saveCurrentStateToActiveProfile();
  };

  const handleToggleMission = (missionId: MissionId) => {
    const updated = toggleMissionProgress(missionId);
    setProgress({ ...updated });
    saveCurrentStateToActiveProfile();
  };

  const handleResetProgress = () => {
    resetAllMissionsProgress();
    setProgress({});
    saveCurrentStateToActiveProfile();
  };

  const handleModuleComplete = (missionId: MissionId) => {
    setMissionCompleted(missionId, true);
    setProgress(getMissionsProgress());
    saveCurrentStateToActiveProfile();
  };

  const handleProfileChanged = () => {
    setProgress(getMissionsProgress());
    setProfileVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-stone-900 selection:bg-orange-200 relative">
      {/* Background Falling Autumn Leaves */}
      <FallingLeaves />

      {/* Floating XP & Trophy unlock notification toasts */}
      <XPToast />

      {/* Trophy Room Modal */}
      <TrophyRoomModal
        isOpen={isTrophiesOpen}
        onClose={() => setIsTrophiesOpen(false)}
      />

      {/* Save System Modal */}
      <SaveSystemModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onProfileChanged={handleProfileChanged}
      />

      {/* Main Content Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'hub' && (
          <Hub
            progress={progress}
            onToggleMission={handleToggleMission}
            onOpenModule={(id: MissionId) => navigateTo(id)}
            onResetProgress={handleResetProgress}
            onOpenTrophies={() => setIsTrophiesOpen(true)}
            onOpenSave={() => setIsSaveOpen(true)}
          />
        )}

        {currentView === 'autodictee1' && (
          <AutodicteeModule
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('autodictee1')}
          />
        )}

        {currentView === 'conjugaison' && (
          <ConjugaisonModule
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('conjugaison')}
          />
        )}

        {currentView === 'histoire1' && (
          <HistoirePopulationsGauleModule
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('histoire1')}
          />
        )}

        {currentView === 'histoire2' && (
          <HistoireConqueteGauleModule
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('histoire2')}
          />
        )}

        {currentView === 'geo1' && (
          <GeoLecon1Module
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('geo1')}
          />
        )}

        {currentView === 'geo2' && (
          <GeoLecon2Module
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('geo2')}
          />
        )}

        {currentView === 'tables' && (
          <TablesMultiplicationModule
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('tables')}
          />
        )}

        {currentView === 'multiplier' && (
          <Multiplier101001000Module
            onHome={() => navigateTo('hub')}
            onComplete={() => handleModuleComplete('multiplier')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
