import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';

export const ResearchLabView: React.FC = () => {
  const { assets, findings, sources, runAiResearch, isUploadModalOpen } = useAtlas();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [selectedFindingId, setSelectedFindingId] = useState<string>(findings[0]?.id || '');
  const [promptText, setPromptText] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [synthesisResult, setSynthesisResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const taskPresets = [
    {
      title: 'Corridor Decision Brief',
      prompt: 'Synthesize a formal engineering decision brief for the selected asset and finding. Provide: 1. Grounded Situational Assessment, 2. Evidence Lineage & Contradictions, 3. Recommended Interventions with Explicit Assumptions, 4. Verification Protocol.',
    },
    {
      title: 'Extract Candidate Facts & Citations',
      prompt: 'Extract all candidate verifiable facts from the available sources for this asset. Format as structured claims with [src-XXX] citations, page/record references, and uncertainty margins.',
    },
    {
      title: 'Detect Contradictions across Sources',
      prompt: 'Cross-examine the historical KeNHA reports against recent RTK field observations and meteorological records. Flag any conflicting assumptions regarding soil cohesion, flood return intervals, or apron integrity.',
    },
    {
      title: 'Field Inspection Checklist',
      prompt: 'Generate an accountable, georeferenced field inspection protocol for civil surveyors prior to the upcoming short rains. Include specific physical measurement tolerances and safety thresholds.',
    },
  ];

  const handleExecute = async (overridePrompt?: string) => {
    const textToRun = overridePrompt || promptText || taskPresets[0].prompt;
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await runAiResearch({
        prompt: textToRun,
        focusAssetId: selectedAssetId,
        focusFindingId: selectedFindingId,
      });
      setSynthesisResult(res.synthesis);
      setModelUsed(res.model);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate research synthesis');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            Layer 4 — The Intelligence Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            AI Research Lab & Grounded Synthesis
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Strict evidence-grounded AI synthesis powered by server-side Gemini 3.8. Never hallucinates citations or fabricates measurements. Maintains complete boundary between raw source data and AI interpretations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Engine:</span>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
            gemini-3.8-flash (Constrained)
          </span>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Context Configuration & Prompt Presets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Asset & Finding Bindings */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Target Evidence Scope</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Infrastructure Asset:</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.code}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Governing Finding:</label>
              <select
                value={selectedFindingId}
                onChange={(e) => setSelectedFindingId(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
              >
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.severity.toUpperCase()}] {f.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
              Grounding Pool: {sources.length} sources · {assets.length} assets · {findings.length} findings
            </div>
          </div>

          {/* Research Task Presets */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Constrained Task Workflows</h3>
            <div className="space-y-2">
              {taskPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(preset.prompt);
                    handleExecute(preset.prompt);
                  }}
                  disabled={isRunning}
                  className="w-full text-left p-3 rounded-lg border border-white/5 bg-black/30 hover:bg-black/50 hover:border-amber-400/40 transition-all text-xs"
                >
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{preset.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono">Run →</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {preset.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Query Box */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Custom Analytical Query</h3>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Formulate specific research inquiry grounded in available Kenyan corridor data..."
              rows={4}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-3 text-xs outline-none focus:border-amber-400 resize-none font-sans"
            />
            <button
              onClick={() => handleExecute()}
              disabled={isRunning}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors text-center shadow-sm"
            >
              {isRunning ? 'Synthesizing with Grounded Evidence...' : 'Run Grounded AI Synthesis'}
            </button>
          </div>
        </div>

        {/* Right Column: Grounded Synthesis Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 flex flex-col min-h-[560px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-semibold text-white">Synthesized Research Output</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Traceable to verified source records
                </div>
              </div>
              {modelUsed && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  Model: {modelUsed}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="my-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded text-xs">
                {errorMsg}
              </div>
            )}

            {isRunning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-sm font-medium text-slate-200">
                  Cross-referencing geotechnical logs and hydrological models...
                </div>
                <div className="text-xs text-slate-400 font-mono max-w-sm">
                  Checking claims against KeNHA reports, KMD rainfall thresholds, and RTK survey observations.
                </div>
              </div>
            ) : synthesisResult ? (
              <div className="flex-1 overflow-y-auto py-4 text-xs text-slate-200 space-y-4 font-sans leading-relaxed">
                <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                  {synthesisResult}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Charter Enforcement: Zero unverified claims accepted.
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(synthesisResult);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-200 bg-white/10 hover:bg-white/15 rounded border border-white/10 transition-colors"
                  >
                    Copy Markdown Output
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-400 font-mono text-sm">
                  ◈
                </div>
                <div className="text-sm font-medium text-slate-200">Awaiting Synthesis Query</div>
                <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
                  Select a constrained task preset on the left or enter a custom query to generate a decision brief, fact extraction, or field inspection checklist.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
