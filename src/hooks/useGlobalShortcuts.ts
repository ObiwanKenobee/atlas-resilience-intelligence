import { useEffect, useState } from 'react';
import { useAtlas, NavigationTab } from '../context/AtlasContext';

export interface ShortcutItem {
  key: string;
  label: string;
  description: string;
  tab?: NavigationTab;
  action?: () => void;
}

export function useGlobalShortcuts() {
  const {
    setActiveTab,
    setIsUploadModalOpen,
    setIsActionModalOpen,
    setIsVerificationModalOpen,
    setIsBriefModalOpen,
    isUploadModalOpen,
    isActionModalOpen,
    isVerificationModalOpen,
    isBriefModalOpen,
  } = useAtlas();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs, textareas, or selects
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Handle Escape to close any active modal
      if (e.key === 'Escape') {
        if (isHelpOpen) {
          setIsHelpOpen(false);
          return;
        }
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (isActionModalOpen) setIsActionModalOpen(false);
        if (isVerificationModalOpen) setIsVerificationModalOpen(false);
        if (isBriefModalOpen) setIsBriefModalOpen(false);
        return;
      }

      // Handle '?' to toggle help modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // Check numeric keys 1 - 8 (either standalone or with Alt)
      const tabMap: Record<string, NavigationTab> = {
        '1': 'command_centre',
        '2': 'living_atlas',
        '3': 'risk_observatory',
        '4': 'evidence_library',
        '5': 'research_lab',
        '6': 'action_centre',
        '7': 'impact_ledger',
        '8': 'institutional_workspace',
      };

      if (tabMap[e.key]) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTab,
    isHelpOpen,
    isUploadModalOpen,
    isActionModalOpen,
    isVerificationModalOpen,
    isBriefModalOpen,
    setIsUploadModalOpen,
    setIsActionModalOpen,
    setIsVerificationModalOpen,
    setIsBriefModalOpen,
  ]);

  return { isHelpOpen, setIsHelpOpen };
}
