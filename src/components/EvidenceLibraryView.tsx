import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Source, Observation } from '../types/atlas';

export const EvidenceLibraryView: React.FC = () => {
  const { sources, observations, assets, setIsUploadModalOpen } = useAtlas();
  const [activeTabSub, setActiveTabSub] = useState<'sources' | 'observations'>('sources');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(sources[0]?.id || null);

  const selectedSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            Layer 1 — The Observatory
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Evidence Library & Data Quality Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Every material conclusion must disclose its basis. Inspect data provenance, acquisition licenses, schema validation reports, and georeferenced field ground truth.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          Ingest & Validate Evidence
        </button>
      </div>

      {/* Sub-navigation tabs: Sources vs Observations */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTabSub('sources')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTabSub === 'sources'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Validated Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTabSub('observations')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTabSub === 'observations'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Georeferenced Field Observations ({observations.length})
        </button>
      </div>

      {activeTabSub === 'sources' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sources List Table */}
          <div className="lg:col-span-7 bg-[#121924] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold uppercase tracking-wider">Ingested Datasets & Reports</span>
              <span className="font-mono text-slate-400">Total: {sources.length}</span>
            </div>

            <div className="divide-y divide-white/5">
              {sources.map((src) => {
                const isSelected = src.id === selectedSource?.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSourceId(src.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-400/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono text-amber-400 mb-0.5">[{src.id}]</div>
                        <h4 className="text-sm font-semibold text-white leading-snug">{src.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                          src.validationStatus === 'validated'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : src.validationStatus === 'validated_with_warnings'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {src.validationStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Owner: <strong className="text-slate-300">{src.owner}</strong></span>
                      <span>·</span>
                      <span>Format: {src.fileFormat}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold">Confidence: {src.confidenceScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Source Provenance & Data-Quality Report */}
          <div className="lg:col-span-5 space-y-6">
            {selectedSource && (
              <div className="bg-[#121924] border border-white/10 rounded-xl p-6 space-y-5">
                <div>
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                    Provenance Dossier // [{selectedSource.id}]
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedSource.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Acquisition Date: {selectedSource.acquisitionDate}
                  </div>
                </div>

                {/* Validation Quality Scorecard */}
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Defensible Confidence</span>
                    <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                      {selectedSource.confidenceScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedSource.confidenceScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Provenance Hash: {selectedSource.provenanceHash}
                  </div>
                </div>

                {/* Metadata Attributes */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Institutional Owner:</span>
                    <span className="text-slate-200 font-medium">{selectedSource.owner}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">License / Permission:</span>
                    <span className="text-slate-200 font-medium">{selectedSource.license}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Spatial Coverage:</span>
                    <span className="text-slate-200 font-medium">{selectedSource.spatialCoverage}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Temporal Coverage:</span>
                    <span className="text-slate-200 font-medium">{selectedSource.temporalCoverage}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Payload Size:</span>
                    <span className="font-mono text-slate-200">
                      {(selectedSource.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                {/* Known Limitations */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Known Limitations & Caveats
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                    {selectedSource.limitations}
                  </p>
                </div>

                {/* Validation Warnings if any */}
                {selectedSource.validationErrors && selectedSource.validationErrors.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-amber-300">Validation Flags Detected:</div>
                    <ul className="list-disc list-inside text-amber-200/90 text-[11px] space-y-0.5">
                      {selectedSource.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Georeferenced Field Observations Ledger */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {observations.map((obs) => {
              const asset = assets.find((a) => a.id === obs.assetId);
              return (
                <div
                  key={obs.id}
                  className="bg-[#121924] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {obs.photoUrl ? (
                      <div className="h-44 w-full bg-slate-900 overflow-hidden relative">
                        <img
                          src={obs.photoUrl}
                          alt={obs.observedMetric}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-white/10">
                          {obs.verificationMethod.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-black/30 flex items-center justify-center text-xs text-slate-500 font-mono">
                        No Attached Photo Evidence
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[11px] font-mono text-amber-400">
                          [{obs.id}] · {obs.recordedAt.split('T')[0]}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {obs.observedMetric}
                        </h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Target Asset: <strong className="text-slate-200">{asset?.name}</strong>
                        </div>
                      </div>

                      {/* Measured Metric Badge */}
                      <div className="bg-black/40 p-3 rounded border border-white/5 flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">Observed Value:</span>
                        <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                          {obs.value} <span className="text-xs font-normal text-slate-400">{obs.unit}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        "{obs.fieldNotes}"
                      </p>

                      <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 space-y-1">
                        <div>
                          <strong>Observer:</strong> {obs.observerName} ({obs.observerRole})
                        </div>
                        <div>
                          <strong>Coordinates:</strong>{' '}
                          <span className="font-mono text-slate-300">
                            [{obs.location[0].toFixed(4)}, {obs.location[1].toFixed(4)}]
                          </span>
                        </div>
                        <div className="text-amber-400/90 font-mono text-[10px]">
                          <strong>Uncertainty:</strong> {obs.uncertaintyDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
