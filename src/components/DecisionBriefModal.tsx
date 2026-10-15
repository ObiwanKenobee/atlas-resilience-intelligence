import React, { useEffect, useState } from 'react';
import { useAtlas } from '../context/AtlasContext';

export const DecisionBriefModal: React.FC = () => {
  const { isBriefModalOpen, setIsBriefModalOpen, findings, exportDecisionBrief } = useAtlas();

  const [selectedFindingId, setSelectedFindingId] = useState<string>(findings[0]?.id || '');
  const [briefContent, setBriefContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Atlas_Decision_Brief.md');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isBriefModalOpen && findings.length > 0) {
      loadBrief(selectedFindingId || findings[0].id);
    }
  }, [isBriefModalOpen, selectedFindingId]);

  const loadBrief = async (findingId: string) => {
    setIsLoading(true);
    try {
      const data = await exportDecisionBrief(findingId);
      setBriefContent(data.content);
      setFileName(data.fileName);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBriefModalOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([briefContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(briefContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121924] border border-white/15 rounded-xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              Institutional Deliverable Export
            </div>
            <h3 className="text-lg font-bold text-white">Atlas Sanctum Resilience Decision Brief</h3>
          </div>
          <button
            onClick={() => setIsBriefModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-mono"
          >
            ✕
          </button>
        </div>

        {/* Finding Selector */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-slate-400 font-medium">Select Finding Scope:</label>
            <select
              value={selectedFindingId}
              onChange={(e) => setSelectedFindingId(e.target.value)}
              className="bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-1.5 outline-none focus:border-amber-400 flex-1 max-w-md"
            >
              {findings.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.severity.toUpperCase()}] {f.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors"
            >
              {copySuccess ? 'Copied ✓' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Download .MD
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-5 font-mono text-xs text-slate-200 max-h-[480px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              Generating formatted institutional brief...
            </div>
          ) : (
            briefContent
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-mono text-right">
          Standard: Atlas Evidence Sprint Specification v2.4 · Formatted for Executive & County Review
        </div>
      </div>
    </div>
  );
};
