import React from 'react';
import { AtlasProvider, useAtlas } from './context/AtlasContext';
import { TopBar } from './components/TopBar';
import { SubBar } from './components/SubBar';
import { CommandCentreView } from './components/CommandCentreView';
import { LivingAtlasView } from './components/LivingAtlasView';
import { RiskObservatoryView } from './components/RiskObservatoryView';
import { EvidenceLibraryView } from './components/EvidenceLibraryView';
import { ResearchLabView } from './components/ResearchLabView';
import { ActionCentreView } from './components/ActionCentreView';
import { ImpactLedgerView } from './components/ImpactLedgerView';
import { InstitutionalWorkspaceView } from './components/InstitutionalWorkspaceView';
import { EvidenceUploadModal } from './components/EvidenceUploadModal';
import { ActionCreateModal } from './components/ActionCreateModal';
import { VerificationModal } from './components/VerificationModal';
import { DecisionBriefModal } from './components/DecisionBriefModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

const AppContent: React.FC = () => {
  const { activeTab, isLoading } = useAtlas();
  const { isHelpOpen, setIsHelpOpen } = useGlobalShortcuts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-mono text-slate-300">
          Initializing Atlas Sanctum Observatory State...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f14] text-slate-100 font-sans">
      <TopBar onOpenShortcuts={() => setIsHelpOpen(true)} />
      <SubBar />

      <main className="flex-1">
        {activeTab === 'command_centre' && <CommandCentreView />}
        {activeTab === 'living_atlas' && <LivingAtlasView />}
        {activeTab === 'risk_observatory' && <RiskObservatoryView />}
        {activeTab === 'evidence_library' && <EvidenceLibraryView />}
        {activeTab === 'research_lab' && <ResearchLabView />}
        {activeTab === 'action_centre' && <ActionCentreView />}
        {activeTab === 'impact_ledger' && <ImpactLedgerView />}
        {activeTab === 'institutional_workspace' && <InstitutionalWorkspaceView />}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-white/5 bg-[#080c10] px-6 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">ATLAS SANCTUM</span>
            <span>·</span>
            <span>Intelligence in service of life</span>
            <span>·</span>
            <span className="font-mono text-slate-400">Kenya Infrastructure Deployment Desk</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Observed → Understand → Decide → Coordinate → Verify → Learn</span>
            <span>·</span>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-amber-400/80 hover:text-amber-300 transition-colors"
            >
              Shortcuts (?)
            </button>
            <span>·</span>
            <span>v1.0-RC</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EvidenceUploadModal />
      <ActionCreateModal />
      <VerificationModal />
      <DecisionBriefModal />
      <KeyboardShortcutsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AtlasProvider>
      <AppContent />
    </AtlasProvider>
  );
}
