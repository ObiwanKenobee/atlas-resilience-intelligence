import React from 'react';
import { useAtlas } from '../context/AtlasContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setActiveTab } = useAtlas();

  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', action: 'Command Centre', desc: 'Strategic overview & mission KPI strip' },
    { key: '2', action: 'Living Atlas', desc: 'Geospatial workspace with analytical layer controls' },
    { key: '3', action: 'Risk Observatory', desc: 'Multi-attribute risk scoring & scenario simulator' },
    { key: '4', action: 'Evidence Library', desc: 'Source provenance & georeferenced observations' },
    { key: '5', action: 'Research Lab', desc: 'Grounded AI synthesis & fact extraction' },
    { key: '6', action: 'Action Centre', desc: 'Intervention register & approval workflow' },
    { key: '7', action: 'Impact Ledger', desc: 'Before/after verified outcomes & indicators' },
    { key: '8', action: 'Institutional Workspace', desc: 'Organization permissions & immutable audit log' },
    { key: '?', action: 'Toggle Shortcuts Guide', desc: 'Show or hide this keyboard reference modal' },
    { key: 'Esc', action: 'Close Modal / Drawer', desc: 'Dismiss active modal window or selection' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121924] border border-white/15 rounded-xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              Atlas Command Bridge
            </div>
            <h3 className="text-base font-bold text-white">Global Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Navigate rapidly across all eight platform layers using single-digit keystrokes when not editing text:
        </p>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-black/30 border border-white/5 rounded-lg text-xs"
            >
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded font-mono text-amber-300 font-bold text-xs shadow-sm min-w-[28px] text-center">
                  {s.key}
                </kbd>
                <div>
                  <div className="font-semibold text-slate-100">{s.action}</div>
                  <div className="text-[11px] text-slate-400">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
