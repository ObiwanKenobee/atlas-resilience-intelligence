import React from 'react';
import { useAtlas } from '../context/AtlasContext';

export const InstitutionalWorkspaceView: React.FC = () => {
  const { organizations, projects, activeProject, setActiveProject, currentUser, auditEvents } = useAtlas();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
          Institutional Governance & Access Control
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Institutional Workspace & Audit Trail
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Sanctum security architecture enforcing organizational boundaries, authorized engineer sign-offs, and an immutable log of every material decision and source ingestion.
        </p>
      </div>

      {/* Grid: Organizations & Active Operator Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Authorized Participating Organizations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">
              Authorized Participating Entities ({organizations.length})
            </h3>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 bg-black/30 border border-white/5 rounded-lg space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-amber-400 font-semibold">[{org.code}]</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{org.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {org.country}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    <strong>Jurisdiction:</strong> {org.jurisdiction}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {org.mandate}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Official Contact: {org.contactEmail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects Selector */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Active Operational Sprints</h3>
            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProject?.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-white'
                        : 'bg-black/25 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-amber-300 font-semibold">{proj.code}</span>
                        <h4 className="text-sm font-semibold mt-0.5">{proj.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-white/10 text-slate-200">
                        {proj.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-400 text-[11px] leading-relaxed">
                      {proj.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                      <span>Lead: {proj.leadInvestigator}</span>
                      <span>Budget: ${proj.budgetUsd.toLocaleString()} USD</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: User Profile & Security Permissions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Active Institutional Session
            </div>
            {currentUser && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
                  <div className="text-slate-400 font-mono mt-0.5">
                    Role: <span className="text-amber-300">{currentUser.role.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2">
                  <div className="text-slate-400 font-medium">Assigned Cryptographic Permissions:</div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {currentUser.permissions.map((perm, i) => (
                      <span
                        key={i}
                        className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Session bound to KeNHA Central Rift engineering credential store. Multi-factor hardware token verified.
                </div>
              </div>
            )}
          </div>

          {/* Sanctum Security Protocol */}
          <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-white">Sanctum Architectural Charter</h4>
            <ul className="space-y-2 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li><strong>Zero Fabricated Impact:</strong> No simulated or unverified improvements are accepted as measured results.</li>
              <li><strong>Provenance Hash:</strong> Every ingested document is SHA-256 hashed upon intake.</li>
              <li><strong>Human in the Loop:</strong> AI engines act strictly in a consultative advisory role. All work orders require licensed PE approval.</li>
              <li><strong>Auditable Traceability:</strong> Every status transition generates an immutable audit record.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-[#121924] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider">Immutable System Audit Trail</span>
          <span className="font-mono text-slate-400">Total Events: {auditEvents.length}</span>
        </div>

        <div className="divide-y divide-white/5">
          {auditEvents.map((ev) => (
            <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 text-[11px]">[{ev.actionType}]</span>
                  <span className="text-slate-200 font-medium">{ev.summary}</span>
                </div>
                {ev.diffSummary && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Delta: {ev.diffSummary}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 font-mono">
                  Actor: {ev.actorName} ({ev.actorRole}) · Target: {ev.entityType} ({ev.entityId})
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {ev.timestamp.replace('T', ' ').substring(0, 19)} UTC
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
