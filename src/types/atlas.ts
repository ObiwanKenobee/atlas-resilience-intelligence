export type Severity = 'critical' | 'high' | 'moderate' | 'low';
export type EvidenceConfidence = 'high' | 'medium' | 'low' | 'insufficient';
export type ActionStatus = 'proposed' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'verified_complete' | 'closed';
export type ActionPriority = 'tier_1_urgent' | 'tier_2_high' | 'tier_3_medium' | 'tier_4_deferred';
export type SourceType = 'engineering_report' | 'field_observation' | 'satellite_data' | 'weather_record' | 'cadastral_survey' | 'hydrological_model';
export type UserRole = 'executive_director' | 'lead_civil_engineer' | 'field_hydrologist' | 'geospatial_analyst' | 'county_liaison';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  country: string;
  jurisdiction: string;
  mandate: string;
  contactEmail: string;
}

export interface Place {
  id: string;
  name: string;
  county: string;
  country: string;
  centerCoordinates: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]];
  terrainType: string;
  catchmentBasin: string;
  populationExposedEst: number;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  type: 'culvert' | 'bridge' | 'road_embankment' | 'stormwater_trunk' | 'retaining_wall' | 'drainage_ditch';
  placeId: string;
  location: [number, number]; // [lat, lng]
  elevationMeters: number;
  criticality: 'vital' | 'major' | 'secondary';
  designCapacity: string;
  lastInspectionDate: string;
  conditionRating: 'critical_defect' | 'moderate_decay' | 'fair' | 'good';
  responsibleAgency: string;
  material: string;
}

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  owner: string;
  acquisitionDate: string;
  license: string;
  spatialCoverage: string;
  temporalCoverage: string;
  fileFormat: string;
  fileSizeBytes: number;
  confidenceScore: number; // 0-100
  validationStatus: 'validated' | 'validated_with_warnings' | 'quarantined' | 'pending';
  validationErrors?: string[];
  limitations: string;
  provenanceHash: string;
}

export interface Observation {
  id: string;
  assetId: string;
  sourceId: string;
  recordedAt: string;
  observerName: string;
  observerRole: string;
  location: [number, number];
  observedMetric: string;
  value: string | number;
  unit?: string;
  photoUrl?: string;
  fieldNotes: string;
  verificationMethod: 'rtk_gps_survey' | 'drone_orthomosaic' | 'manual_gauge' | 'visual_inspection' | 'radar_altimetry';
  uncertaintyDescription: string;
}

export interface MaterialClaim {
  id: string;
  claimText: string;
  sourceId: string;
  pageOrRecordRef: string;
  observationDate: string;
  analyticalMethod: string;
  confidence: EvidenceConfidence;
  contradictoryEvidence?: string;
  validationStatus: 'verified' | 'disputed' | 'unconfirmed';
  reviewerName?: string;
}

export interface Finding {
  id: string;
  title: string;
  assetId: string;
  placeId: string;
  hazardType: 'flash_flood' | 'slope_failure' | 'scour_erosion' | 'debris_siltation' | 'urban_waterlogging';
  severity: Severity;
  summary: string;
  materialClaims: MaterialClaim[];
  unresolvedGaps: string[];
  lastAssessedAt: string;
  status: 'active' | 'in_mitigation' | 'resolved';
}

export interface RiskBreakdown {
  hazardScore: number; // 0-100
  exposureScore: number; // 0-100
  vulnerabilityScore: number; // 0-100
  consequenceScore: number; // 0-100
  resilienceCapacityScore: number; // 0-100 (mitigating factor)
  compositeRiskScore: number; // 0-100 calculated
  confidenceLevel: EvidenceConfidence;
  formulaDescription: string;
  uncertaintyMarginPct: number;
}

export interface Assessment {
  id: string;
  findingId: string;
  version: number;
  assessedAt: string;
  assessor: string;
  riskBreakdown: RiskBreakdown;
  methodologyNotes: string;
  assumptions: string[];
  failureModes: string[];
  recommendedInterventions: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  rainfallMultiplier: number;
  catchmentRunoffCoeff: number;
  maintenanceStatus: 'optimal' | 'current_baseline' | 'deferred_maintenance';
  projectedDamageUsd: number;
  disruptionDaysEst: number;
  affectedPopulation: number;
}

export interface Action {
  id: string;
  findingId: string;
  assetId: string;
  title: string;
  description: string;
  proposedIntervention: string;
  priority: ActionPriority;
  priorityCriteria: string[];
  estimatedCostUsd: number;
  costAssumptionSource: string;
  expectedBenefit: string;
  potentialAdverseEffects: string;
  dataGaps: string[];
  assignedOwner: string;
  ownerRole: string;
  requiredApprovals: string[];
  currentApprovalStatus: 'pending_county_signoff' | 'approved_for_works' | 'rejected' | 'under_amendment';
  status: ActionStatus;
  targetCompletionDate: string;
  createdAt: string;
  updatedAt: string;
  verificationCriteria: string;
  verificationEvidenceRequired: string[];
}

export interface Verification {
  id: string;
  actionId: string;
  verifiedAt: string;
  verifierName: string;
  verifierRole: string;
  preInterventionBaseline: string;
  postInterventionCondition: string;
  observedMetricDelta: string;
  supportingEvidenceUrls: string[];
  causalityAssessment: string; // Separating correlation from proved causation
  limitationsAndConfounders: string;
  outcomeClassification: 'verified_resolved' | 'partially_improved' | 'no_significant_change' | 'requires_remedial_work';
}

export interface Indicator {
  id: string;
  code: string;
  name: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  baselineValue: number;
  collectionMethod: string;
  lastUpdated: string;
  limitations: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: 'SOURCE_INGESTED' | 'ACTION_APPROVED' | 'ACTION_STATUS_CHANGED' | 'VERIFICATION_RECORDED' | 'ASSESSMENT_UPDATED' | 'RESEARCH_SYNTHESIS_RUN';
  entityId: string;
  entityType: string;
  summary: string;
  diffSummary?: string;
}

export interface ProjectContext {
  id: string;
  code: string;
  name: string;
  organizationId: string;
  placeId: string;
  leadInvestigator: string;
  startDate: string;
  targetEndDate: string;
  status: 'active_sprint' | 'monitoring' | 'review' | 'closed';
  budgetUsd: number;
  summary: string;
  scopeBoundaries: string;
}
