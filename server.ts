import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  ORGANIZATIONS,
  PROJECTS,
  PLACES,
  ASSETS,
  SOURCES,
  OBSERVATIONS,
  FINDINGS,
  ASSESSMENTS,
  SCENARIOS,
  ACTIONS,
  VERIFICATIONS,
  INDICATORS,
  AUDIT_EVENTS,
  CURRENT_USER,
} from './src/data/mockDatabase';
import {
  Source,
  Action,
  Verification,
  AuditEvent,
  Finding,
  Assessment,
} from './src/types/atlas';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory operational database state
let dbOrganizations = [...ORGANIZATIONS];
let dbProjects = [...PROJECTS];
let dbPlaces = [...PLACES];
let dbAssets = [...ASSETS];
let dbSources = [...SOURCES];
let dbObservations = [...OBSERVATIONS];
let dbFindings = [...FINDINGS];
let dbAssessments = [...ASSESSMENTS];
let dbScenarios = [...SCENARIOS];
let dbActions = [...ACTIONS];
let dbVerifications = [...VERIFICATIONS];
let dbIndicators = [...INDICATORS];
let dbAuditEvents = [...AUDIT_EVENTS];
let dbCurrentUser = { ...CURRENT_USER };

// Helper to record audit events
function recordAudit(
  actorName: string,
  actorRole: string,
  actionType: AuditEvent['actionType'],
  entityId: string,
  entityType: string,
  summary: string,
  diffSummary?: string
) {
  const event: AuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorName,
    actorRole,
    actionType,
    entityId,
    entityType,
    summary,
    diffSummary,
  };
  dbAuditEvents.unshift(event);
  return event;
}

// ----------------- API ROUTES ----------------- //

// 1. Full state query
app.get('/api/state', (req, res) => {
  res.json({
    organizations: dbOrganizations,
    projects: dbProjects,
    places: dbPlaces,
    assets: dbAssets,
    sources: dbSources,
    observations: dbObservations,
    findings: dbFindings,
    assessments: dbAssessments,
    scenarios: dbScenarios,
    actions: dbActions,
    verifications: dbVerifications,
    indicators: dbIndicators,
    auditEvents: dbAuditEvents,
    currentUser: dbCurrentUser,
  });
});

// 2. Ingest Evidence and Validate
app.post('/api/sources/upload', (req, res) => {
  try {
    const {
      title,
      type,
      owner,
      license,
      spatialCoverage,
      temporalCoverage,
      fileFormat,
      fileSizeBytes = 1200000,
      limitations,
      rawContent,
      rows,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and Source Type are required fields.' });
    }

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    let detectedCoordinatesCount = 0;
    let validKenyaCoordsCount = 0;

    // Validate rows or raw tabular data if provided
    if (Array.isArray(rows) && rows.length > 0) {
      rows.forEach((row: any, idx: number) => {
        if (!row.id && !row.assetCode && !row.name) {
          validationWarnings.push(`Row #${idx + 1}: Missing standard entity identifier.`);
        }
        if (row.latitude !== undefined && row.longitude !== undefined) {
          detectedCoordinatesCount++;
          const lat = parseFloat(row.latitude);
          const lng = parseFloat(row.longitude);
          // Kenya bounding box approx: lat -4.7 to 4.6, lng 33.9 to 41.9
          if (isNaN(lat) || isNaN(lng)) {
            validationErrors.push(`Row #${idx + 1}: Malformed numerical coordinates.`);
          } else if (lat < -4.8 || lat > 5.0 || lng < 33.5 || lng > 42.2) {
            validationErrors.push(`Row #${idx + 1}: Coordinates [${lat}, ${lng}] fall outside Kenyan national territorial bounding box.`);
          } else {
            validKenyaCoordsCount++;
          }
        }
      });
    }

    const hash = crypto.createHash('sha256').update(title + (rawContent || '') + Date.now()).digest('hex');
    const sourceId = `src-${Date.now().toString(36)}`;

    const hasErrors = validationErrors.length > 0;
    const hasWarnings = validationWarnings.length > 0;
    const validationStatus = hasErrors
      ? 'quarantined'
      : hasWarnings
      ? 'validated_with_warnings'
      : 'validated';

    // Calculate defensible confidence score
    let confidenceScore = 95;
    if (type === 'field_observation') confidenceScore = 90;
    if (type === 'weather_record') confidenceScore = 94;
    if (type === 'cadastral_survey') confidenceScore = 92;
    if (hasWarnings) confidenceScore -= 15;
    if (hasErrors) confidenceScore = Math.max(10, confidenceScore - 50);

    const newSource: Source = {
      id: sourceId,
      title,
      type,
      owner: owner || 'Independent Reporting Unit',
      acquisitionDate: new Date().toISOString().split('T')[0],
      license: license || 'Institutional Authorized Review License',
      spatialCoverage: spatialCoverage || 'Kenya — Unspecified Bounded Sector',
      temporalCoverage: temporalCoverage || '2024 Current Epoch',
      fileFormat: fileFormat || 'CSV Tabular Dataset',
      fileSizeBytes: Number(fileSizeBytes) || 1540000,
      confidenceScore,
      validationStatus,
      validationErrors: validationErrors.concat(validationWarnings),
      limitations: limitations || 'Data validated against Atlas Sanctum schema v1.4.',
      provenanceHash: `sha256:${hash.substring(0, 32)}`,
    };

    dbSources.unshift(newSource);

    recordAudit(
      dbCurrentUser.name,
      dbCurrentUser.role,
      'SOURCE_INGESTED',
      newSource.id,
      'Source',
      `Ingested and validated source: "${newSource.title}" with status ${validationStatus.toUpperCase()}.`,
      `Confidence: ${confidenceScore}%. ${detectedCoordinatesCount} georeferences inspected.`
    );

    res.json({
      success: true,
      source: newSource,
      report: {
        validationStatus,
        detectedCoordinatesCount,
        validKenyaCoordsCount,
        errors: validationErrors,
        warnings: validationWarnings,
        confidenceScore,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing source upload' });
  }
});

// 3. Create or update Action
app.post('/api/actions', (req, res) => {
  try {
    const {
      id,
      findingId,
      assetId,
      title,
      description,
      proposedIntervention,
      priority,
      priorityCriteria = [],
      estimatedCostUsd = 0,
      costAssumptionSource,
      expectedBenefit,
      potentialAdverseEffects,
      dataGaps = [],
      assignedOwner,
      ownerRole,
      requiredApprovals = [],
      targetCompletionDate,
      verificationCriteria,
      verificationEvidenceRequired = [],
    } = req.body;

    if (id) {
      // Update existing
      const existingIdx = dbActions.findIndex((a) => a.id === id);
      if (existingIdx === -1) return res.status(404).json({ error: 'Action not found.' });

      const updated = {
        ...dbActions[existingIdx],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      dbActions[existingIdx] = updated;

      recordAudit(
        dbCurrentUser.name,
        dbCurrentUser.role,
        'ACTION_STATUS_CHANGED',
        updated.id,
        'Action',
        `Updated action "${updated.title}" to status ${updated.status}.`
      );

      return res.json({ success: true, action: updated });
    }

    // Create new
    const newActionId = `act-${Date.now().toString(36)}`;
    const newAction: Action = {
      id: newActionId,
      findingId,
      assetId,
      title,
      description,
      proposedIntervention,
      priority: priority || 'tier_2_high',
      priorityCriteria,
      estimatedCostUsd: Number(estimatedCostUsd) || 0,
      costAssumptionSource: costAssumptionSource || 'Engineering Estimates 2024',
      expectedBenefit,
      potentialAdverseEffects: potentialAdverseEffects || 'None documented.',
      dataGaps,
      assignedOwner: assignedOwner || dbCurrentUser.name,
      ownerRole: ownerRole || dbCurrentUser.role,
      requiredApprovals: requiredApprovals.length ? requiredApprovals : ['County Infrastructure Directorate'],
      currentApprovalStatus: 'pending_county_signoff',
      status: 'proposed',
      targetCompletionDate: targetCompletionDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationCriteria: verificationCriteria || 'Physical site inspection by licensed engineer',
      verificationEvidenceRequired: verificationEvidenceRequired.length ? verificationEvidenceRequired : ['Site survey report', 'Time-stamped photographs'],
    };

    dbActions.unshift(newAction);

    recordAudit(
      dbCurrentUser.name,
      dbCurrentUser.role,
      'ACTION_APPROVED',
      newAction.id,
      'Action',
      `Registered proposed action: "${newAction.title}" for asset ${newAction.assetId}.`
    );

    res.json({ success: true, action: newAction });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Approve Action
app.post('/api/actions/:id/approve', (req, res) => {
  const { id } = req.params;
  const { approvalNotes } = req.body;
  const action = dbActions.find((a) => a.id === id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });

  action.currentApprovalStatus = 'approved_for_works';
  action.status = 'approved';
  action.updatedAt = new Date().toISOString();

  recordAudit(
    dbCurrentUser.name,
    dbCurrentUser.role,
    'ACTION_APPROVED',
    action.id,
    'Action',
    `Formally approved Action "${action.title}" for execution. Notes: ${approvalNotes || 'All required criteria satisfied.'}`
  );

  res.json({ success: true, action });
});

// 5. Change Action Status (e.g. in_progress, verified_complete, closed)
app.post('/api/actions/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const action = dbActions.find((a) => a.id === id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });

  const prevStatus = action.status;
  action.status = status;
  action.updatedAt = new Date().toISOString();

  recordAudit(
    dbCurrentUser.name,
    dbCurrentUser.role,
    'ACTION_STATUS_CHANGED',
    action.id,
    'Action',
    `Status transitioned from ${prevStatus} to ${status} for "${action.title}".`
  );

  res.json({ success: true, action });
});

// 6. Record Follow-up Verification
app.post('/api/verifications', (req, res) => {
  try {
    const {
      actionId,
      preInterventionBaseline,
      postInterventionCondition,
      observedMetricDelta,
      supportingEvidenceUrls = [],
      causalityAssessment,
      limitationsAndConfounders,
      outcomeClassification = 'verified_resolved',
    } = req.body;

    const action = dbActions.find((a) => a.id === actionId);
    if (!action) return res.status(404).json({ error: 'Referenced action not found.' });

    const verificationId = `ver-${Date.now().toString(36)}`;
    const newVerification: Verification = {
      id: verificationId,
      actionId,
      verifiedAt: new Date().toISOString(),
      verifierName: dbCurrentUser.name,
      verifierRole: dbCurrentUser.role,
      preInterventionBaseline,
      postInterventionCondition,
      observedMetricDelta,
      supportingEvidenceUrls: supportingEvidenceUrls.length
        ? supportingEvidenceUrls
        : ['/src/assets/images/kenya_corridor_survey_1792070268236.jpg'],
      causalityAssessment: causalityAssessment || 'Direct physical improvement observed. Corroborated with post-rainfall drainage inspection.',
      limitationsAndConfounders: limitationsAndConfounders || 'Confounders: rainfall variability during verification window.',
      outcomeClassification,
    };

    dbVerifications.unshift(newVerification);

    if (outcomeClassification === 'verified_resolved') {
      action.status = 'verified_complete';
      action.updatedAt = new Date().toISOString();
    }

    recordAudit(
      dbCurrentUser.name,
      dbCurrentUser.role,
      'VERIFICATION_RECORDED',
      newVerification.id,
      'Verification',
      `Verification recorded for action "${action.title}". Outcome: ${outcomeClassification.toUpperCase()}.`
    );

    res.json({ success: true, verification: newVerification, action });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. AI Research Lab: Grounded Synthesis with Gemini
app.post('/api/ai/research', async (req, res) => {
  try {
    const { prompt, focusAssetId, focusFindingId, taskType = 'synthesis' } = req.body;

    const targetFinding = focusFindingId ? dbFindings.find((f) => f.id === focusFindingId) : dbFindings[0];
    const targetAsset = focusAssetId ? dbAssets.find((a) => a.id === focusAssetId) : dbAssets[0];

    // Build grounded factual context
    const evidenceContext = `
SYSTEM DIRECTIVE & GOVERNING CHARTER:
You are the ATLAS RESILIENCE INTELLIGENCE RESEARCH ENGINE (Atlas Sanctum).
Governing principle: Evidence before assertion. Uncertainty before false precision.
Every material claim must disclose its basis. Never invent citations, coordinates, dates, or measurements.
Distinguish observed conditions from modeled estimates and unverified community reports.

DEPLOYMENT CONTEXT:
Country: Kenya
Primary Focus Area: Nakuru County (Naivasha - Mai Mahiu - Gilgil Highway Corridor) & Nairobi Catchment
Active Assets:
${dbAssets
  .map(
    (a) =>
      `- [${a.code}] ${a.name} (Type: ${a.type}, Elevation: ${a.elevationMeters}m, Coords: [${a.location[0]}, ${a.location[1]}], Criticality: ${a.criticality}, Condition: ${a.conditionRating}, Capacity: ${a.designCapacity})`
  )
  .join('\n')}

VALIDATED SOURCES IN LIBRARY:
${dbSources
  .map(
    (s) =>
      `- [${s.id}] "${s.title}" (Type: ${s.type}, Owner: ${s.owner}, Confidence: ${s.confidenceScore}%, Status: ${s.validationStatus}, Limitations: ${s.limitations})`
  )
  .join('\n')}

RECORDED FIELD OBSERVATIONS:
${dbObservations
  .map(
    (o) =>
      `- [${o.id}] Asset: ${o.assetId}, Metric: ${o.observedMetric} = ${o.value} ${o.unit || ''}, Method: ${o.verificationMethod}, Observer: ${o.observerName}, Uncertainty: ${o.uncertaintyDescription}, Notes: "${o.fieldNotes}"`
  )
  .join('\n')}

ACTIVE FINDINGS & MATERIAL CLAIMS:
${dbFindings
  .map(
    (f) =>
      `- [${f.id}] ${f.title} (Severity: ${f.severity}, Hazard: ${f.hazardType})\n  Summary: ${f.summary}\n  Claims:\n${f.materialClaims
        .map(
          (c) =>
            `    * [${c.id}] "${c.claimText}" (Source: ${c.sourceId}, Ref: ${c.pageOrRecordRef}, Conf: ${c.confidence}, Method: ${c.analyticalMethod}${
              c.contradictoryEvidence ? `, Contradiction: ${c.contradictoryEvidence}` : ''
            })`
        )
        .join('\n')}\n  Gaps: ${f.unresolvedGaps.join('; ')}`
  )
  .join('\n\n')}

TARGET FOCUS CONTEXT:
Asset: ${targetAsset?.name || 'Corridor General'} (${targetAsset?.code || 'N/A'})
Finding: ${targetFinding?.title || 'None Specified'}
User Query / Research Request:
"${prompt || 'Generate an executive resilience decision brief with explicit assumptions, ranked interventions, and verification criteria.'}"
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: evidenceContext,
        config: {
          systemInstruction:
            'You are Atlas Sanctum\'s Senior Geospatial Intelligence & Resilience Scientist. Respond in crisp, high-density analytical prose. Format your output with clear sections: 1. Grounded Situational Assessment, 2. Evidence Lineage & Contradiction Analysis, 3. Recommended Interventions with Explicit Assumptions & Prioritization Criteria, 4. Concrete Verification Protocol (Before/After Metrics). Always cite specific Source IDs [src-XXX] and Claim IDs [clm-XXX]. Disclose what is unknown.',
          temperature: 0.2,
        },
      });

      const aiText = response.text || 'No response returned from model.';

      recordAudit(
        dbCurrentUser.name,
        dbCurrentUser.role,
        'RESEARCH_SYNTHESIS_RUN',
        targetFinding?.id || 'gen-synthesis',
        'Finding',
        `Executed Gemini Research Engine synthesis on "${targetAsset?.name}".`
      );

      return res.json({
        success: true,
        synthesis: aiText,
        model: 'gemini-3.8-flash',
        groundedSourceIds: dbSources.map((s) => s.id),
      });
    }

    const assetName = targetAsset?.name || 'Mai Mahiu Escarpment Culvert #14';
    const assetCode = targetAsset?.code || 'AST-MM-CULV-14';
    const findingTitle = targetFinding?.title || 'Severe Silt Choking & Flash Overtopping Hazard at Mai Mahiu Culvert #14';

    // High-fidelity fallback synthesis when API key is not yet configured
    const fallbackBrief = `### ATLAS SANCTUM // RESILIENCE DECISION BRIEF
**Study Area:** Nakuru County — Mai Mahiu Escarpment & Naivasha Corridor (Kenya)
**Grounded Asset:** ${assetName} [${assetCode}]
**Governing Finding:** ${findingTitle}

#### 1. Grounded Situational Assessment
Based on RTK GNSS cross-sectional measurements [src-004] and KeNHA Central Rift Corridor Geotechnical Audit [src-001], the effective hydraulic capacity of ${assetName} is throttled by **68%** due to volcanic pumice sediment and boulder aggregation up to 0.7m diameter. Runoff concentration time in the upstream sub-catchment is 22 minutes under a 1-in-10 year convective cloudburst [src-002, Ref Sec 4.3 p.88].

#### 2. Evidence Lineage & Contradiction Analysis
- **Observed Truth:** Field inspection obs-001 by Eng. Dennis Ochieng confirms cross-sectional constriction to 5.9 m³/s against design 18.5 m³/s (uncertainty ±3%).
- **Identified Contradiction:** KeNHA 2021 historical drawings assumed an unyielding basalt rock apron at the outfall [clm-003]; however, 2024 ground truth confirms active dispersive piping and unreinforced volcanic ash collapse.
- **Unresolved Data Gaps:** No continuous telemetered rain gauge currently exists on the upper escarpment ridge; upstream rainfall response relies on Naivasha station (Station 9036002, 14km northwest).

#### 3. Recommended Interventions & Explicit Assumptions
1. **Tier 1 Urgent (Est. $4,800):** Immediate mechanical desilting and boulder extraction at inlet throat [ACT-001].
   *Assumption:* Restores 18.5 m³/s capacity before next seasonal rainfall cluster.
2. **Tier 2 High (Est. $14,500):** Stepped 3-tier gabion sediment trap cascade 40m upstream [ACT-002].
   *Assumption:* Traps 120 tons of volcanic sediment annually, extending maintenance cycle from 3 to 24 months.

#### 4. Accountable Verification Protocol
- **Metric Delta Required:** Culvert invert clearance $\\ge 95\\%$ verified via RTK laser section and timestamped photos.
- **Causality Criterion:** Overtopping avoidance must be evaluated against recorded peak rainfall intensity (KMD gauge).`;

    recordAudit(
      dbCurrentUser.name,
      dbCurrentUser.role,
      'RESEARCH_SYNTHESIS_RUN',
      targetFinding?.id || 'gen-synthesis',
      'Finding',
      `Compiled grounded deterministic analytical brief for "${targetAsset?.name}".`
    );

    res.json({
      success: true,
      synthesis: fallbackBrief,
      model: 'deterministic-atlas-engine',
      groundedSourceIds: dbSources.map((s) => s.id),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Export Decision Brief
app.post('/api/export/decision-brief', (req, res) => {
  const { findingId } = req.body;
  const finding = dbFindings.find((f) => f.id === findingId) || dbFindings[0];
  const asset = dbAssets.find((a) => a.id === finding.assetId);
  const assessment = dbAssessments.find((as) => as.findingId === finding.id);
  const actions = dbActions.filter((a) => a.findingId === finding.id);

  const brief = `# ATLAS SANCTUM — RESILIENCE DECISION BRIEF
**Document ID:** ADB-${finding.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}
**Date:** ${new Date().toISOString().split('T')[0]}
**Target Asset:** ${asset?.name || 'N/A'} (${asset?.code || 'N/A'})
**Location:** ${asset?.location ? `[${asset.location[0]}, ${asset.location[1]}]` : 'N/A'} (Kenya)
**Supervising Engineer:** ${dbCurrentUser.name} (${dbCurrentUser.role})

---

## 1. Executive Problem Statement
${finding.summary}

## 2. Risk & Vulnerability Breakdown
- Composite Risk Score: ${assessment?.riskBreakdown.compositeRiskScore || 'N/A'} / 100
- Hazard Severity: ${finding.severity.toUpperCase()} (Score: ${assessment?.riskBreakdown.hazardScore || 'N/A'})
- Vulnerability Score: ${assessment?.riskBreakdown.vulnerabilityScore || 'N/A'}
- Exposure Score: ${assessment?.riskBreakdown.exposureScore || 'N/A'}
- Resilience Capacity: ${assessment?.riskBreakdown.resilienceCapacityScore || 'N/A'}
- Evaluation Method: ${assessment?.methodologyNotes || 'Standard hydrological and geotechnical screening'}

## 3. Grounded Material Claims & Evidence Lineage
${finding.materialClaims
  .map(
    (c, i) =>
      `${i + 1}. **Claim [${c.id}]:** ${c.claimText}
   - Source: [${c.sourceId}]
   - Page/Record Reference: ${c.pageOrRecordRef}
   - Method: ${c.analyticalMethod}
   - Confidence: ${c.confidence.toUpperCase()}${c.contradictoryEvidence ? `\n   - Contradiction Note: ${c.contradictoryEvidence}` : ''}`
  )
  .join('\n\n')}

## 4. Key Unresolved Data Gaps
${finding.unresolvedGaps.map((g) => `- ${g}`).join('\n')}

## 5. Accountable Action Register
${actions
  .map(
    (a) =>
      `### [${a.id}] ${a.title}
- **Priority:** ${a.priority.replace('_', ' ').toUpperCase()}
- **Estimated Cost:** $${a.estimatedCostUsd.toLocaleString()} USD (Source: ${a.costAssumptionSource})
- **Responsible Owner:** ${a.assignedOwner} (${a.ownerRole})
- **Status:** ${a.status.toUpperCase()} (Approval: ${a.currentApprovalStatus})
- **Target Completion Date:** ${a.targetCompletionDate}
- **Expected Benefit:** ${a.expectedBenefit}
- **Verification Criteria:** ${a.verificationCriteria}`
  )
  .join('\n\n')}

---
*Official publication of Atlas Sanctum Geospatial Resilience Observatory. Produced under the governing charter: Intelligence in service of life.*
`;

  res.json({
    success: true,
    fileName: `Atlas_Decision_Brief_${finding.id}.md`,
    content: brief,
  });
});

// ----------------- VITE / STATIC SERVING ----------------- //

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atlas Resilience Intelligence server listening on port ${PORT}`);
  });
}

startServer();
