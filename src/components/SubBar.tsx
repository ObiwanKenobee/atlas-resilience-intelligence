import React from 'react';
import { useAtlas, NavigationTab } from '../context/AtlasContext';

export const SubBar: React.FC = () => {
  const { activeTab, setActiveTab, activeProject, currentUser, sources, actions } = useAtlas();

  const validatedSourcesCount = sources.filter((s) => s.validationStatus === 'validated').length;
  const pendingActionsCount = actions.filter((a) => a.status === 'proposed' || a.status === 'under_review').length;

  const mobileTabs: { id: NavigationTab; label: string }[] = [
    { id: 'command_centre', label: 'Command' },
    { id: 'living_atlas', label: 'Atlas' },
    { id: 'risk_observatory', label: 'Risk' },
    { id: 'evidence_library', label: 'Evidence' },
    { id: 'research_lab', label: 'Research' },
    { id: 'action_centre', label: 'Actions' },
    { id: 'impact_ledger', label: 'Impact' },
    { id: 'institutional_workspace', label: 'Workspace' },
  ];

  return (
    <div className="bg-[#121924] border-b border-white/5 px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Project & Operational Context */}
        <div className="flex items-center gap-3 text-slate-300">
          <span className="font-semibold text-amber-400">
            {activeProject ? activeProject.code : 'KEN-SPRINT-01'}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-medium">
            {activeProject ? activeProject.name : 'Nakuru Infrastructure Resilience'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Nakuru County, Kenya</span>
        </div>

        {/* Live Operational Metrics & User Identity */}
        <div className="flex items-center gap-5 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Verified Evidence:</span>
            <span className="font-mono text-slate-200 font-semibold tabular-nums">{validatedSourcesCount} / {sources.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Awaiting Decision:</span>
            <span className="font-mono text-amber-300 font-semibold tabular-nums">{pendingActionsCount}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4 text-slate-300">
            <span className="text-slate-500">Officer:</span>
            <span>{currentUser?.name || 'Engineer'}</span>
          </div>
        </div>
      </div>

      {/* Mobile-visible Tab Strip */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pt-2.5 mt-2 border-t border-white/5 scrollbar-none">
        {mobileTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-amber-400/15 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};
