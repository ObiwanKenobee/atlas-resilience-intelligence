import React from 'react';
import { useAtlas } from '../context/AtlasContext';

export const CommandCentreView: React.FC = () => {
  const {
    assets,
    sources,
    findings,
    actions,
    verifications,
    setActiveTab,
    setSelectedAssetId,
    setSelectedFindingId,
    setIsBriefModalOpen,
    setIsUploadModalOpen,
  } = useAtlas();

  const criticalFindings = findings.filter((f) => f.severity === 'critical');
  const pendingActions = actions.filter(
    (a) => a.status === 'proposed' || a.status === 'under_review'
  );
  const vitalAssets = assets.filter((a) => a.criticality === 'vital');

  const totalActionBudget = actions.reduce((sum, a) => sum + a.estimatedCostUsd, 0);

  const heroFinding = findings[0]; // Mai Mahiu Culvert #14
  const heroAsset = assets.find((a) => a.id === heroFinding?.assetId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-8">
      {/* Institutional Mission Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
              Atlas Sanctum · Operational Mission Brief
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Nakuru-Naivasha Corridor Infrastructure & Climate Resilience
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              Transforming fragmented geotechnical surveys, meteorological records, and field inspections into defensible engineering interventions across the Great Rift Valley escarpment.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap"
            >
              Ingest Evidence
            </button>
            <button
              onClick={() => setActiveTab('living_atlas')}
              className="px-3.5 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Launch Living Atlas
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Live Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121924] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Monitored Corridor Assets</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">{assets.length}</span>
            <span className="text-xs text-amber-400/90 font-mono">({vitalAssets.length} Vital)</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Trunk roads, culverts & bridge abutments
          </div>
        </div>

        <div className="bg-[#121924] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Validated Evidence Sources</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">{sources.length}</span>
            <span className="text-xs text-emerald-400 font-mono">
              (92% avg confidence)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            KeNHA audits, KMD records & RTK surveys
          </div>
        </div>

        <div className="bg-[#121924] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Critical Interventions Queue</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {pendingActions.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              of {actions.length} total
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            ${totalActionBudget.toLocaleString()} preliminary estimated works
          </div>
        </div>

        <div className="bg-[#121924] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Verified Field Outcomes</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {verifications.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Bondeni Box Drain)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Documented baseline vs post-works delta
          </div>
        </div>
      </div>

      {/* Featured Strategic Investigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121924] border border-white/10 rounded-xl overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-xs text-rose-400 font-mono uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Highest Priority Unresolved Vulnerability
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {heroFinding?.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Asset: <strong className="text-slate-200">{heroAsset?.name}</strong></span>
              <span>·</span>
              <span className="font-mono">{heroAsset?.code}</span>
              <span>·</span>
              <span>Elevation: {heroAsset?.elevationMeters}m</span>
              <span>·</span>
              <span>Design: {heroAsset?.designCapacity}</span>
            </div>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {heroFinding?.summary}
            </p>

            {/* Traceable Grounded Claims */}
            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Grounded Evidentiary Basis:
              </div>
              {heroFinding?.materialClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="text-xs text-slate-300 bg-black/30 p-2.5 rounded border border-white/5 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-100">{claim.claimText}</span>
                    <span className="text-[11px] font-mono text-amber-400 shrink-0">
                      [{claim.sourceId}]
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Ref: {claim.pageOrRecordRef}</span>
                    <span>·</span>
                    <span>Method: {claim.analyticalMethod}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-mono">Conf: {claim.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (heroAsset) setSelectedAssetId(heroAsset.id);
                if (heroFinding) setSelectedFindingId(heroFinding.id);
                setActiveTab('living_atlas');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Inspect on Living Atlas
            </button>
            <button
              onClick={() => {
                if (heroFinding) setSelectedFindingId(heroFinding.id);
                setActiveTab('risk_observatory');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors whitespace-nowrap"
            >
              Analyze Risk Model (Score: 87.4)
            </button>
            <button
              onClick={() => {
                setActiveTab('action_centre');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
            >
              View Associated Action Plan
            </button>
          </div>
        </div>

        {/* Hero Visual Asset */}
        <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10">
          <img
            src="/src/assets/images/field_inspection_sensor_1792070267767.jpg"
            alt="Field inspection of storm water drainage culvert in Kenya"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e141c] via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs">
            <div className="font-mono text-amber-300 text-[11px]">
              OBS-001 // RTK Cross-Section Survey
            </div>
            <div className="text-slate-200 font-medium">
              Mai Mahiu Escarpment Culvert #14
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Recorded by Eng. Dennis Ochieng · 68% blockage verified
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Operational Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Vulnerability Register */}
        <div className="bg-[#121924] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Active Vulnerability Register</h3>
              <p className="text-xs text-slate-400 mt-0.5">Prioritized by multi-attribute consequence screening</p>
            </div>
            <button
              onClick={() => setActiveTab('risk_observatory')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              View Full Register →
            </button>
          </div>

          <div className="space-y-3">
            {findings.slice(0, 4).map((f) => {
              const asset = assets.find((a) => a.id === f.assetId);
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelectedFindingId(f.id);
                    if (asset) setSelectedAssetId(asset.id);
                    setActiveTab('living_atlas');
                  }}
                  className="p-3.5 bg-black/25 hover:bg-black/40 border border-white/5 hover:border-white/20 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium text-sm text-slate-200 hover:text-amber-300 transition-colors">
                      {f.title}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                        f.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : f.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{asset?.name}</span>
                    <span>·</span>
                    <span>{f.materialClaims.length} Claims Verified</span>
                    <span>·</span>
                    <span className="text-amber-400">{f.unresolvedGaps.length} Gaps</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Urgent Decisions Awaiting Approval */}
        <div className="bg-[#121924] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Pending Action Decisions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Interventions requiring authorized sign-off</p>
            </div>
            <button
              onClick={() => setActiveTab('action_centre')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Action Bridge →
            </button>
          </div>

          <div className="space-y-3">
            {actions.slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="p-3.5 bg-black/25 border border-white/5 rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-sm text-slate-200">{act.title}</div>
                  <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums shrink-0">
                    ${act.estimatedCostUsd.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{act.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div className="text-slate-400">
                    Owner: <strong className="text-slate-300">{act.assignedOwner}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">Target: {act.targetCompletionDate}</span>
                    <button
                      onClick={() => setActiveTab('action_centre')}
                      className="px-2 py-0.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded font-medium"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
