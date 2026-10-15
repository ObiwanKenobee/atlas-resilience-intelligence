import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { ActionPriority } from '../types/atlas';

export const ActionCreateModal: React.FC = () => {
  const { isActionModalOpen, setIsActionModalOpen, assets, findings, createAction, currentUser } = useAtlas();

  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [findingId, setFindingId] = useState(findings[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedIntervention, setProposedIntervention] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('tier_2_high');
  const [estimatedCostUsd, setEstimatedCostUsd] = useState('12000');
  const [costAssumptionSource, setCostAssumptionSource] = useState('Nakuru County Standard Rate Schedule 2024');
  const [expectedBenefit, setExpectedBenefit] = useState('');
  const [potentialAdverseEffects, setPotentialAdverseEffects] = useState('Temporary lane disruption during off-peak hours');
  const [assignedOwner, setAssignedOwner] = useState(currentUser?.name || 'Eng. Dennis Ochieng');
  const [targetCompletionDate, setTargetCompletionDate] = useState('2024-11-20');
  const [verificationCriteria, setVerificationCriteria] = useState('Direct physical inspection with post-works RTK survey');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isActionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createAction({
        assetId,
        findingId,
        title,
        description,
        proposedIntervention,
        priority,
        estimatedCostUsd: Number(estimatedCostUsd),
        costAssumptionSource,
        expectedBenefit,
        potentialAdverseEffects,
        assignedOwner,
        targetCompletionDate,
        verificationCriteria,
        priorityCriteria: ['Reduces corridor flood exposure', 'Approved by Area Maintenance Engineer'],
      });
      setIsActionModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error proposing action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121924] border border-white/15 rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              Action Centre // Work Order Dispatch
            </div>
            <h3 className="text-lg font-bold text-white">Propose Accountable Engineering Action</h3>
          </div>
          <button
            onClick={() => setIsActionModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-mono"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Target Asset *</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.code}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Governing Finding *</label>
              <select
                value={findingId}
                onChange={(e) => setFindingId(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              >
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.severity.toUpperCase()}] {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Action Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Construct Concrete Scour Dissipator and Trash Rack"
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Action Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed operational statement of the intervention..."
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Proposed Engineering Intervention</label>
            <textarea
              rows={2}
              value={proposedIntervention}
              onChange={(e) => setProposedIntervention(e.target.value)}
              placeholder="Civil engineering specifications (materials, dimensions, mechanical requirements)..."
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionPriority)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              >
                <option value="tier_1_urgent">Tier 1 Urgent</option>
                <option value="tier_2_high">Tier 2 High</option>
                <option value="tier_3_medium">Tier 3 Medium</option>
                <option value="tier_4_deferred">Tier 4 Deferred</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Estimated Cost (USD)</label>
              <input
                type="number"
                value={estimatedCostUsd}
                onChange={(e) => setEstimatedCostUsd(e.target.value)}
                className="w-full bg-black/40 text-slate-200 font-mono border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Target Date</label>
              <input
                type="date"
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
                className="w-full bg-black/40 text-slate-200 font-mono border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Cost Assumption Source</label>
              <input
                type="text"
                value={costAssumptionSource}
                onChange={(e) => setCostAssumptionSource(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Responsible Owner</label>
              <input
                type="text"
                value={assignedOwner}
                onChange={(e) => setAssignedOwner(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Expected Resilience Benefit</label>
            <input
              type="text"
              value={expectedBenefit}
              onChange={(e) => setExpectedBenefit(e.target.value)}
              placeholder="e.g. Eliminates culvert overflow risk up to 1-in-25 year return storm event"
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Accountable Verification Criteria *</label>
            <input
              type="text"
              required
              value={verificationCriteria}
              onChange={(e) => setVerificationCriteria(e.target.value)}
              placeholder="Physical proof required to declare works complete"
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register Action for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
