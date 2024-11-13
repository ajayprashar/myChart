export const PATIENT_TABS = [
  { 
    id: 'demographics', 
    label: 'Demographics',
    icon: 'user',
    description: 'View patient demographics information'
  },
  { 
    id: 'labs', 
    label: 'Laboratory Results',
    icon: 'flask',
    description: 'View laboratory test results'
  },
  { 
    id: 'vitals', 
    label: 'Vital Signs',
    icon: 'heart',
    description: 'View patient vital signs'
  },
  { 
    id: 'medications', 
    label: 'Medications',
    icon: 'pills',
    description: 'View patient medications'
  }
] as const;

export type TabId = typeof PATIENT_TABS[number]['id'];

export const isValidTabId = (tab: string): tab is TabId => {
  return PATIENT_TABS.map(t => t.id).includes(tab as TabId);
};
