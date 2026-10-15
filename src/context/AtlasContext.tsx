import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Organization,
  ProjectContext,
  Place,
  Asset,
  Source,
  Observation,
  Finding,
  Assessment,
  Scenario,
  Action,
  Verification,
  Indicator,
  AuditEvent,
  UserProfile,
} from '../types/atlas';

export type NavigationTab =
  | 'command_centre'
  | 'living_atlas'
  | 'risk_observatory'
  | 'evidence_library'
  | 'research_lab'
  | 'action_centre'
  | 'impact_ledger'
  | 'institutional_workspace';

interface AtlasContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  selectedFindingId: string | null;
  setSelectedFindingId: (id: string | null) => void;
  organizations: Organization[];
  projects: ProjectContext[];
  places: Place[];
  assets: Asset[];
  sources: Source[];
  observations: Observation[];
  findings: Finding[];
  assessments: Assessment[];
  scenarios: Scenario[];
  actions: Action[];
  verifications: Verification[];
  indicators: Indicator[];
  auditEvents: AuditEvent[];
  currentUser: UserProfile | null;
  activeProject: ProjectContext | null;
  setActiveProject: (proj: ProjectContext) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  uploadSource: (sourceData: any) => Promise<any>;
  approveAction: (actionId: string, notes?: string) => Promise<any>;
  updateActionStatus: (actionId: string, status: Action['status']) => Promise<any>;
  createAction: (actionData: any) => Promise<any>;
  recordVerification: (verificationData: any) => Promise<any>;
  runAiResearch: (params: { prompt?: string; focusAssetId?: string; focusFindingId?: string }) => Promise<any>;
  exportDecisionBrief: (findingId?: string) => Promise<{ fileName: string; content: string }>;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isActionModalOpen: boolean;
  setIsActionModalOpen: (open: boolean) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isBriefModalOpen: boolean;
  setIsBriefModalOpen: (open: boolean) => void;
}

const AtlasContext = createContext<AtlasContextType | undefined>(undefined);

export const AtlasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('command_centre');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<ProjectContext[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setOrganizations(data.organizations || []);
      setProjects(data.projects || []);
      setPlaces(data.places || []);
      setAssets(data.assets || []);
      setSources(data.sources || []);
      setObservations(data.observations || []);
      setFindings(data.findings || []);
      setAssessments(data.assessments || []);
      setScenarios(data.scenarios || []);
      setActions(data.actions || []);
      setVerifications(data.verifications || []);
      setIndicators(data.indicators || []);
      setAuditEvents(data.auditEvents || []);
      setCurrentUser(data.currentUser || null);

      if (data.projects && data.projects.length > 0 && !activeProject) {
        setActiveProject(data.projects[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const uploadSource = async (sourceData: any) => {
    const res = await fetch('/api/sources/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to upload source');
    await refreshData();
    return result;
  };

  const approveAction = async (actionId: string, notes?: string) => {
    const res = await fetch(`/api/actions/${actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalNotes: notes }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to approve action');
    await refreshData();
    return result;
  };

  const updateActionStatus = async (actionId: string, status: Action['status']) => {
    const res = await fetch(`/api/actions/${actionId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update action status');
    await refreshData();
    return result;
  };

  const createAction = async (actionData: any) => {
    const res = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create action');
    await refreshData();
    return result;
  };

  const recordVerification = async (verificationData: any) => {
    const res = await fetch('/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to record verification');
    await refreshData();
    return result;
  };

  const runAiResearch = async (params: { prompt?: string; focusAssetId?: string; focusFindingId?: string }) => {
    const res = await fetch('/api/ai/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'AI research error');
    await refreshData();
    return result;
  };

  const exportDecisionBrief = async (findingId?: string) => {
    const targetId = findingId || (findings.length > 0 ? findings[0].id : '');
    const res = await fetch('/api/export/decision-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findingId: targetId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to export brief');
    return result;
  };

  return (
    <AtlasContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedAssetId,
        setSelectedAssetId,
        selectedFindingId,
        setSelectedFindingId,
        organizations,
        projects,
        places,
        assets,
        sources,
        observations,
        findings,
        assessments,
        scenarios,
        actions,
        verifications,
        indicators,
        auditEvents,
        currentUser,
        activeProject,
        setActiveProject,
        isLoading,
        refreshData,
        uploadSource,
        approveAction,
        updateActionStatus,
        createAction,
        recordVerification,
        runAiResearch,
        exportDecisionBrief,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isActionModalOpen,
        setIsActionModalOpen,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isBriefModalOpen,
        setIsBriefModalOpen,
      }}
    >
      {children}
    </AtlasContext.Provider>
  );
};

export const useAtlas = () => {
  const context = useContext(AtlasContext);
  if (!context) throw new Error('useAtlas must be used within an AtlasProvider');
  return context;
};
