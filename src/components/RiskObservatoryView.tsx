import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Assessment, Scenario } from '../types/atlas';

export const RiskObservatoryView: React.FC = () => {
  const { assessments, findings, assets, scenarios, selectedFindingId, setSelectedFindingId, setActiveTab } = useAtlas();

  // Active finding & assessment selection
  const activeFindingId = selectedFindingId || (findings.length > 0 ? findings[0].id : null);
  const activeFinding = findings.find((f) => f.id === activeFindingId);
  const activeAssessment = assessments.find((a) => a.findingId === activeFindingId);
  const activeAsset = assets.find((a) => a.id === activeFinding?.assetId);

  // Scenario Simulator state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[1]?.id || scenarios[0]?.id || '');
  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Custom sensitivity sliders for interactive explainability
  const [hazardWeight, setHazardWeight] = useState<number>(30);
  const [exposureWeight, setExposureWeight] = useState<number>(25);
  const [vulnerabilityWeight, setVulnerabilityWeight] = useState<number>(25);
  const [consequenceWeight, setConsequenceWeight] = useState<number>(20);

  // Re-calculate composite score based on dynamic weights
  const calculateDynamicScore = (as: Assessment | undefined) => {
    if (!as) return 0;
    const b = as.riskBreakdown;
    const totalWeight = hazardWeight + exposureWeight + vulnerabilityWeight + consequenceWeight;
    if (totalWeight === 0) return 0;
    const weightedSum =
      (b.hazardScore * hazardWeight +
        b.exposureScore * exposureWeight +
        b.vulnerabilityScore * vulnerabilityWeight +
        b.consequenceScore * consequenceWeight) /
      totalWeight;
    // factor in resilience mitigating capacity
    const finalScore = weightedSum * (1 - b.resilienceCapacityScore / 200);
    return parseFloat(finalScore.toFixed(1));
  };

  const dynamicScore = calculateDynamicScore(activeAssessment);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Charter Statement */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            Layer 3 — Aegis Analytical Framework
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Risk & Resilience Observatory
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Transparent, multi-dimensional assessment separating Hazard, Exposure, Vulnerability, Consequence, and Mitigating Resilience Capacity. Zero opaque black-box scoring.
          </p>
        </div>

        {/* Finding Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Select Finding:</label>
          <select
            value={activeFindingId || ''}
            onChange={(e) => setSelectedFindingId(e.target.value)}
            className="bg-[#121924] text-slate-200 border border-white/15 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-400"
          >
            {findings.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.severity.toUpperCase()}] {f.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mathematical Breakdown & Sensitivity Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Composite Score Card */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Composite Risk Rating
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-4xl font-bold font-mono text-white tabular-nums">
                    {dynamicScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100 max</span>
                  <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    Confidence: {activeAssessment?.riskBreakdown.confidenceLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>Uncertainty Margin: ±{activeAssessment?.riskBreakdown.uncertaintyMarginPct}%</div>
                <div className="mt-0.5 text-slate-300">Version: v{activeAssessment?.version}.0</div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="mt-4 p-3 bg-black/30 rounded border border-white/5 text-xs text-slate-300 font-mono">
              <span className="text-slate-400">Governing Formula:</span>{' '}
              <span className="text-amber-300 font-semibold">
                Risk = (Hazard·w₁ + Exposure·w₂ + Vulnerability·w₃ + Consequence·w₄) × (1 - Resilience/200)
              </span>
            </div>

            {/* Dimension Breakdown Bars */}
            {activeAssessment && (
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">1. Hazard (Damaging Physical Event):</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {activeAssessment.riskBreakdown.hazardScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeAssessment.riskBreakdown.hazardScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    1-in-10 to 1-in-25 year rainfall intensity across volcanic escarpment catchment
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">2. Exposure (Affected People & Corridors):</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {activeAssessment.riskBreakdown.exposureScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeAssessment.riskBreakdown.exposureScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    18,400 Average Daily Traffic on A104/B3 route + downstream rural settlements
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">3. Vulnerability (Structural Susceptibility):</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {activeAssessment.riskBreakdown.vulnerabilityScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeAssessment.riskBreakdown.vulnerabilityScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    68% silt infill, zero cohesion volcanic ash subgrade, piping risk
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">4. Consequence (Economic & Life Safety Harm):</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {activeAssessment.riskBreakdown.consequenceScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeAssessment.riskBreakdown.consequenceScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Total severance of Kenya-Uganda freight corridor; estimated $1.85M regional disruption
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">5. Mitigating Resilience Capacity:</span>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      {activeAssessment.riskBreakdown.resilienceCapacityScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeAssessment.riskBreakdown.resilienceCapacityScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Local contractor mobilization speed, emergency detour feasibility
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Weight Adjustment */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Weight Sensitivity Adjustment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inspect how prioritization shifts when policy weights favor Consequence vs Hazard frequency:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Hazard ({hazardWeight}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={hazardWeight}
                  onChange={(e) => setHazardWeight(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Exposure ({exposureWeight}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={exposureWeight}
                  onChange={(e) => setExposureWeight(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Vulnerability ({vulnerabilityWeight}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={vulnerabilityWeight}
                  onChange={(e) => setVulnerabilityWeight(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Consequence ({consequenceWeight}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={consequenceWeight}
                  onChange={(e) => setConsequenceWeight(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Simulator & Documented Assumptions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scenario Comparison Engine */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Scenario Simulator</h3>
                <p className="text-xs text-slate-400 mt-0.5">Evaluate potential futures under explicit parameters</p>
              </div>
            </div>

            {/* Scenario Segmented Selector */}
            <div className="space-y-2">
              {scenarios.map((scn) => {
                const isSelected = scn.id === selectedScenarioId;
                return (
                  <button
                    key={scn.id}
                    onClick={() => setSelectedScenarioId(scn.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-white'
                        : 'bg-black/25 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs">{scn.name}</div>
                      <span className="font-mono text-xs text-amber-300">
                        {scn.rainfallMultiplier}× Rain
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                      {scn.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario Impact Metrics */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <div className="text-xs font-semibold uppercase text-slate-300">
                Projected Impact: {activeScenario.name}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <div className="text-[10px] text-slate-400">Damage Est.</div>
                  <div className="text-xs font-bold text-rose-400 mt-1 tabular-nums">
                    ${(activeScenario.projectedDamageUsd / 1000).toFixed(0)}k USD
                  </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <div className="text-[10px] text-slate-400">Corridor Halt</div>
                  <div className="text-xs font-bold text-amber-300 mt-1 tabular-nums">
                    {activeScenario.disruptionDaysEst} days
                  </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <div className="text-[10px] text-slate-400">Exposed Pop.</div>
                  <div className="text-xs font-bold text-slate-200 mt-1 tabular-nums">
                    {activeScenario.affectedPopulation.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documented Assumptions & Failure Modes */}
          {activeAssessment && (
            <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Disclosed Analytical Assumptions
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {activeAssessment.assumptions.map((assump, i) => (
                    <li key={i} className="leading-relaxed">{assump}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Postulated Failure Modes
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-rose-300/90 list-disc list-inside">
                  {activeAssessment.failureModes.map((mode, i) => (
                    <li key={i} className="leading-relaxed">{mode}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={() => setActiveTab('action_centre')}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center"
                >
                  Translate to Accountable Actions →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
