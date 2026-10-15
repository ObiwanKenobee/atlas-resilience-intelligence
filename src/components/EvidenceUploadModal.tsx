import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { SourceType } from '../types/atlas';

export const EvidenceUploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, uploadSource } = useAtlas();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<SourceType>('engineering_report');
  const [owner, setOwner] = useState('Kenya National Highways Authority (KeNHA)');
  const [license, setLicense] = useState('Official Public Infrastructure Survey');
  const [spatialCoverage, setSpatialCoverage] = useState('Nakuru County — Naivasha Escarpment');
  const [temporalCoverage, setTemporalCoverage] = useState('2024 Q3 Survey');
  const [fileFormat, setFileFormat] = useState('CSV Tabular Data');
  const [limitations, setLimitations] = useState('Direct field inspection under dry conditions.');
  const [csvContent, setCsvContent] = useState(
    'assetCode,latitude,longitude,culvert_diameter_mm,measured_silt_depth_cm\nAST-MM-01,-0.9856,36.5912,1800,122\nAST-MM-02,-0.9782,36.5841,1200,45\nAST-SUSWA-03,-0.8521,36.3892,1500,90'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isUploadModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Parse CSV rows for coordinate validation
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i];
      });
      return obj;
    });

    try {
      const res = await uploadSource({
        title,
        type,
        owner,
        license,
        spatialCoverage,
        temporalCoverage,
        fileFormat,
        fileSizeBytes: csvContent.length * 40,
        limitations,
        rawContent: csvContent,
        rows,
      });

      setReportResult(res.report);
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation error');
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
              Observatory Intake Gateway
            </div>
            <h3 className="text-lg font-bold text-white">Ingest & Validate Evidence</h3>
          </div>
          <button
            onClick={() => {
              setIsUploadModalOpen(false);
              setReportResult(null);
            }}
            className="text-slate-400 hover:text-white text-lg font-mono"
          >
            ✕
          </button>
        </div>

        {reportResult ? (
          /* Validation Audit Report Screen */
          <div className="space-y-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Validation Status:</span>
                <span
                  className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
                    reportResult.validationStatus === 'validated'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : reportResult.validationStatus === 'validated_with_warnings'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {reportResult.validationStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/5">
                <div>
                  <span className="text-slate-400">Kenya Georeferences:</span>{' '}
                  <span className="text-slate-200">{reportResult.validKenyaCoordsCount} / {reportResult.detectedCoordinatesCount}</span>
                </div>
                <div>
                  <span className="text-slate-400">Calculated Confidence:</span>{' '}
                  <span className="text-emerald-400 font-bold">{reportResult.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {reportResult.errors && reportResult.errors.length > 0 && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded text-xs text-rose-300 space-y-1">
                <div className="font-semibold">Detected Schema / Territorial Errors:</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {reportResult.errors.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {reportResult.warnings && reportResult.warnings.length > 0 && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded text-xs text-amber-300 space-y-1">
                <div className="font-semibold">Validation Caveats:</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {reportResult.warnings.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setReportResult(null);
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center"
            >
              Complete & View In Evidence Library
            </button>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-slate-300 font-medium block mb-1">Source Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. KeNHA Escarpment Culvert Capacity Ground Survey Oct 2024"
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Source Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SourceType)}
                  className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                >
                  <option value="engineering_report">Engineering Report</option>
                  <option value="field_observation">Field Observation</option>
                  <option value="weather_record">Weather Record (KMD)</option>
                  <option value="cadastral_survey">Cadastral Survey</option>
                  <option value="hydrological_model">Hydrological Model</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Institutional Owner</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Spatial Coverage</label>
                <input
                  type="text"
                  value={spatialCoverage}
                  onChange={(e) => setSpatialCoverage(e.target.value)}
                  className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Temporal Coverage</label>
                <input
                  type="text"
                  value={temporalCoverage}
                  onChange={(e) => setTemporalCoverage(e.target.value)}
                  className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Tabular / Georeferenced Payload (CSV format with latitude & longitude columns)
              </label>
              <textarea
                rows={5}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full bg-black/40 text-slate-200 font-mono text-[11px] border border-white/15 rounded-lg p-2.5 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Known Limitations / Uncertainties</label>
              <input
                type="text"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                className="w-full bg-black/40 text-slate-200 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Validating against Schema...' : 'Validate & Commit to Library'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
