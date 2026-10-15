import React from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Verification, Indicator } from '../types/atlas';

export const ImpactLedgerView: React.FC = () => {
  const { verifications, indicators, actions, setIsVerificationModalOpen } = useAtlas();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            Layer 6 — The Memory of the Land
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Impact Ledger & Verification Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Strict separation of operational monitoring from causal claims. No simulated or unverified improvements are ever recorded as achievements.
          </p>
        </div>

        <button
          onClick={() => setIsVerificationModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          + Record Field Verification
        </button>
      </div>

      {/* Corridor Resilience Indicators Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Corridor Resilience Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => {
            const progressPct = Math.min(100, Math.round((ind.currentValue / ind.targetValue) * 100));
            return (
              <div key={ind.id} className="bg-[#121924] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-amber-400 font-semibold">{ind.code}</span>
                  <span>Target: {ind.targetValue}</span>
                </div>
                <h4 className="text-sm font-semibold text-white leading-snug">{ind.name}</h4>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                      {ind.currentValue}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">{ind.unit}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Base: {ind.baselineValue}</span>
                </div>

                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 leading-tight">
                  <span className="text-slate-500">Method:</span> {ind.collectionMethod}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded Verification Records */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Verified Field Interventions ({verifications.length})
        </h3>

        <div className="space-y-6">
          {verifications.map((ver) => {
            const action = actions.find((a) => a.id === ver.actionId);
            return (
              <div
                key={ver.id}
                className="bg-[#121924] border border-white/10 rounded-xl overflow-hidden p-6 space-y-6"
              >
                {/* Title & Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                      <span>[{ver.id}]</span>
                      <span>·</span>
                      <span>Action Ref: {action?.id}</span>
                      <span>·</span>
                      <span>Verified: {ver.verifiedAt.split('T')[0]}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white leading-snug">
                      {action?.title || 'Infrastructure Remediation'}
                    </h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Auditing Engineer: <strong className="text-slate-200">{ver.verifierName}</strong> ({ver.verifierRole})
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded text-xs font-mono font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                    {ver.outcomeClassification.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Before / After Condition Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-2">
                    <div className="text-xs font-mono uppercase text-rose-400 font-semibold">
                      1. Pre-Intervention Baseline Condition:
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ver.preInterventionBaseline}
                    </p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-2">
                    <div className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                      2. Post-Intervention Ground Truth:
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ver.postInterventionCondition}
                    </p>
                  </div>
                </div>

                {/* Measured Delta & Photos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 space-y-4">
                    {/* Metric Delta Highlight */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                        Measured Physical Delta:
                      </div>
                      <div className="text-sm font-mono text-emerald-100 font-semibold">
                        {ver.observedMetricDelta}
                      </div>
                    </div>

                    {/* Scientific Causality Assessment */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-300 uppercase tracking-wider">
                        Causality Assessment (Separating Correlation from Proved Impact):
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                        {ver.causalityAssessment}
                      </p>
                    </div>

                    {/* Confounders and Limitations */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-400 uppercase tracking-wider">
                        Documented Confounders & Scientific Limitations:
                      </div>
                      <p className="text-slate-400 leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                        {ver.limitationsAndConfounders}
                      </p>
                    </div>
                  </div>

                  {/* Supporting Evidence Image Strip */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Photographic Verification Proof:
                    </div>
                    {ver.supportingEvidenceUrls.map((url, i) => (
                      <div key={i} className="h-44 rounded-lg overflow-hidden border border-white/10 relative">
                        <img
                          src={url}
                          alt="Verification evidence"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
                          Proof Attachment #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
