import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Action, ActionPriority, ActionStatus } from '../types/atlas';

export const ActionCentreView: React.FC = () => {
  const { actions, assets, findings, approveAction, updateActionStatus, setIsActionModalOpen, setIsVerificationModalOpen } = useAtlas();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(actions[0]?.id || null);

  const filteredActions = actions.filter((act) => {
    if (filterPriority !== 'all' && act.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && act.status !== filterStatus) return false;
    return true;
  });

  const selectedAction = actions.find((a) => a.id === selectedActionId) || actions[0];
  const relatedAsset = assets.find((a) => a.id === selectedAction?.assetId);
  const relatedFinding = findings.find((f) => f.id === selectedAction?.findingId);

  const handleApprove = async (id: string) => {
    try {
      await approveAction(id, 'Verified against engineering criteria and immediate seasonal risk threshold.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ActionStatus) => {
    try {
      await updateActionStatus(id, newStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            Layer 5 — The Command Bridge
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Action Centre & Intervention Register
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Converting validated findings into accountable engineering work. Workflow progression: Finding → Review → Decision → Approval → Assignment → Execution → Verification → Closure.
          </p>
        </div>

        <button
          onClick={() => setIsActionModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          + Propose New Action
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-medium">Filter by Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#121924] text-slate-200 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
          >
            <option value="all">All Priorities</option>
            <option value="tier_1_urgent">Tier 1 Urgent</option>
            <option value="tier_2_high">Tier 2 High</option>
            <option value="tier_3_medium">Tier 3 Medium</option>
            <option value="tier_4_deferred">Tier 4 Deferred</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-medium">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121924] text-slate-200 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="verified_complete">Verified Complete</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="text-slate-400 font-mono ml-auto">
          Showing {filteredActions.length} of {actions.length} Interventions
        </div>
      </div>

      {/* Main Two-Column Master / Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Actions Master List */}
        <div className="lg:col-span-6 bg-[#121924] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {filteredActions.map((act) => {
            const isSelected = act.id === selectedAction?.id;
            const asset = assets.find((a) => a.id === act.assetId);

            return (
              <div
                key={act.id}
                onClick={() => setSelectedActionId(act.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-400/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                      <span>[{act.id}]</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 font-sans">{asset?.name}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white leading-snug">{act.title}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                      act.priority === 'tier_1_urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : act.priority === 'tier_2_high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {act.priority.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                  <div className="text-slate-400">
                    Est: <strong className="text-amber-400">${act.estimatedCostUsd.toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-400">
                    Owner: <span className="text-slate-200">{act.assignedOwner}</span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      act.status === 'verified_complete'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : act.status === 'in_progress'
                        ? 'bg-sky-500/20 text-sky-300'
                        : act.status === 'approved'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {act.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Detail Dossier */}
        <div className="lg:col-span-6 space-y-6">
          {selectedAction && (
            <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    Work Order: {selectedAction.id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Target: {selectedAction.targetCompletionDate}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                  {selectedAction.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  Responsible Owner: <strong className="text-slate-200">{selectedAction.assignedOwner}</strong> ({selectedAction.ownerRole})
                </div>
              </div>

              {/* Status & Approval Controls */}
              <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Workflow Stage:</span>
                  <span className="font-mono uppercase font-bold text-amber-300">
                    {selectedAction.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">County Approval Status:</span>
                  <span className="font-mono text-slate-300">
                    {selectedAction.currentApprovalStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Workflow Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                  {selectedAction.status === 'proposed' || selectedAction.status === 'under_review' ? (
                    <button
                      onClick={() => handleApprove(selectedAction.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                    >
                      Grant Official Approval
                    </button>
                  ) : null}

                  {selectedAction.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange(selectedAction.id, 'in_progress')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded transition-colors"
                    >
                      Issue Notice to Proceed (In Progress)
                    </button>
                  )}

                  {selectedAction.status === 'in_progress' && (
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
                    >
                      Record Follow-up Verification →
                    </button>
                  )}
                </div>
              </div>

              {/* Proposed Engineering Intervention */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-300 uppercase tracking-wider">
                  Proposed Engineering Intervention:
                </div>
                <p className="text-slate-200 bg-black/20 p-3 rounded border border-white/5 leading-relaxed">
                  {selectedAction.proposedIntervention}
                </p>
              </div>

              {/* Cost & Expected Benefit Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/30 p-3 rounded border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Preliminary Cost</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    ${selectedAction.estimatedCostUsd.toLocaleString()} USD
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Basis: {selectedAction.costAssumptionSource}
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Expected Benefit</div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {selectedAction.expectedBenefit}
                  </p>
                </div>
              </div>

              {/* Priority Criteria & Potential Adverse Effects */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 font-medium mb-1">Prioritization Rationale:</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                    {selectedAction.priorityCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-slate-400 font-medium mb-1">Potential Adverse Effects / Traffic Impact:</div>
                  <p className="text-slate-300 text-[11px] bg-black/20 p-2.5 rounded border border-white/5">
                    {selectedAction.potentialAdverseEffects}
                  </p>
                </div>
              </div>

              {/* Verification Criteria & Required Evidence */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                  Accountable Verification Criteria:
                </div>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {selectedAction.verificationCriteria}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedAction.verificationEvidenceRequired.map((ev, i) => (
                    <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                      Proof: {ev}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
