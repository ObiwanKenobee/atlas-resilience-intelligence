import React from 'react';
import { useAtlas, NavigationTab } from '../context/AtlasContext';

interface TopBarProps {
  onOpenShortcuts?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenShortcuts }) => {
  const { activeTab, setActiveTab, setIsBriefModalOpen } = useAtlas();

  const navItems: { id: NavigationTab; label: string; shortcut: string }[] = [
    { id: 'command_centre', label: 'Command Centre', shortcut: '1' },
    { id: 'living_atlas', label: 'Living Atlas', shortcut: '2' },
    { id: 'risk_observatory', label: 'Risk', shortcut: '3' },
    { id: 'evidence_library', label: 'Evidence', shortcut: '4' },
    { id: 'research_lab', label: 'Research', shortcut: '5' },
    { id: 'action_centre', label: 'Actions', shortcut: '6' },
    { id: 'impact_ledger', label: 'Impact', shortcut: '7' },
    { id: 'institutional_workspace', label: 'Workspace', shortcut: '8' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0e141c] border-b border-white/10 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('command_centre')}
          className="text-base font-bold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 bg-amber-400 rotate-45 inline-block" />
          ATLAS AEGIS
        </button>
      </div>

      {/* Zone 2: Clean single-line text navigation links with keyboard shortcuts */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'text-white border-amber-400 font-semibold'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 text-slate-500 bg-white/5 border border-white/10 rounded">
                {item.shortcut}
              </kbd>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action & shortcuts trigger */}
      <div className="flex items-center gap-3 shrink-0">
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            title="Press '?' for keyboard shortcuts"
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/5 border border-white/10 transition-colors"
          >
            <span>Keybindings</span>
            <kbd className="text-[10px] text-amber-300 font-bold">?</kbd>
          </button>
        )}
        <button
          onClick={() => setIsBriefModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-md hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          Export Decision Brief
        </button>
      </div>
    </header>
  );
};
