export type LoadingState = {
  [K in TabId]: boolean;
};

export interface FHIRResponse<T> {
  resourceType: string;
  entry?: Array<{
    resource: T;
  }>;
  total?: number;
}

export interface Patient {
  resourceType: 'Patient';
  name?: Array<{
    given?: string[];
    family?: string;
  }>;
  birthDate?: string;
  gender?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  }>;
}

export interface Observation {
  resourceType: 'Observation';
  code: {
    coding: Array<{
      system?: string;
      code?: string;
      display: string;
    }>;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  effectiveDateTime: string;
  status: string;
} 