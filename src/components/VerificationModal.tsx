import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';

export const VerificationModal: React.FC = () => {
  const { isVerificationModalOpen, setIsVerificationModalOpen, actions, recordVerification } = useAtlas();

  const inProgressActions = actions.filter(
    (a) => a.status === 'in_progress' || a.status === 'approved'
  );
  const fallbackAction = actions[0];

  const [actionId, setActionId] = useState(inProgressActions[0]?.id || fallbackAction?.id || '');
  const [preInterventionBaseline, setPreInterventionBaseline] = useState(
    '68% sediment choke at inlet throat; hydraulic conveyance reduced to 5.9 m³/s.'
  );
  const [postInterventionCondition, setPostInterventionCondition] = useState(
    '100% invert clearance completed with tracked mini-excavator; concrete apron flushed clean.'
  );
  const [observedMetricDelta, setObservedMetricDelta] = useState(
    'Capacity restored from 5.9 m³/s to 18.5 m³/s (+213% flow rate improvement).'
  );
  const [causalityAssessment, setCausalityAssessment] = useState(
    'Hydraulic conveyance increase is directly attributable to physical extraction of 42 m³ pyroclastic sediment and unblocking of corrugated pipe barrel.'
  );
  const [limitationsAndConfounders, setLimitationsAndConfounders] = useState(
    'Dry season observation; true performance during peak 50-year rainfall cluster will require ultrasonic water level logger confirmation.'
  );
  const [outcomeClassification, setOutcomeClassification] = useState<
    'verified_resolved' | 'partially_improved' | 'no_significant_change' | 'requires_remedial_work'
  >('verified_resolved');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isVerificationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await recordVerification({
        actionId,
        preInterventionBaseline,
        postInterventionCondition,
        observedMetricDelta,
        causalityAssessment,
        limitationsAndConfounders,
        outcomeClassification,
        supportingEvidenceUrls: ['/src/assets/images/kenya_corridor_survey_1792070268236.jpg'],
      });
      setIsVerificationModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121924] border border-white/15 rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              Impact Ledger // Follow-up Verification
            </div>
            <h3 className="text-lg font-bold text-white">Record Verified Engineering Outcome</h3>
          </div>
          <button
            onClick={() => setIsVerificationModalOpen(false)}
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

          <div>
            <label className="text-slate-300 font-medium block mb-1">Target Action to Verify *</label>
            <select
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            >
              {actions.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.id}] {a.title} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Pre-Intervention Baseline Condition *</label>
            <textarea
              rows={2}
              required
              value={preInterventionBaseline}
              onChange={(e) => setPreInterventionBaseline(e.target.value)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Post-Intervention Ground Truth Observed *</label>
            <textarea
              rows={2}
              required
              value={postInterventionCondition}
              onChange={(e) => setPostInterventionCondition(e.target.value)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Measured Physical Metric Delta *</label>
            <input
              type="text"
              required
              value={observedMetricDelta}
              onChange={(e) => setObservedMetricDelta(e.target.value)}
              placeholder="e.g. Capacity restored from 5.9 m³/s to 18.5 m³/s"
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Causality Assessment (Separating Correlation from Proved Causation) *
            </label>
            <textarea
              rows={2}
              required
              value={causalityAssessment}
              onChange={(e) => setCausalityAssessment(e.target.value)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Documented Confounders & Scientific Limitations
            </label>
            <textarea
              rows={2}
              value={limitationsAndConfounders}
              onChange={(e) => setLimitationsAndConfounders(e.target.value)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Outcome Classification</label>
            <select
              value={outcomeClassification}
              onChange={(e) => setOutcomeClassification(e.target.value as any)}
              className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
            >
              <option value="verified_resolved">Verified Resolved (Criteria 100% Satisfied)</option>
              <option value="partially_improved">Partially Improved (Residual Risk Remains)</option>
              <option value="no_significant_change">No Significant Change</option>
              <option value="requires_remedial_work">Requires Remedial Work</option>
            </select>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Commit Verification to Impact Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
