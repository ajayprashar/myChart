import { writable, derived } from 'svelte/store';
import type { Patient, Observation, LoadingState, MedicationRequest } from '../types/fhir';

export const patientStore = writable<Patient | null>(null);
export const labResultsStore = writable<Observation[]>([]);
export const vitalSignsStore = writable<Observation[]>([]);
export const medicationsStore = writable<MedicationRequest[]>([]);

export const loadingStore = writable<Record<TabId, boolean>>({
  patient: false,
  labs: false,
  vitals: false,
  medications: false,
});

export const isLoading = derived(loadingStore, 
  $loading => Object.values($loading).some(Boolean)
);

export const errorStore = writable<Record<TabId, Error | null>>({
  patient: null,
  labs: null,
  vitals: null,
  medications: null
});
