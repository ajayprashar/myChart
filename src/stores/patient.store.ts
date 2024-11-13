import { writable, derived } from 'svelte/store';
import type { Patient, Observation, LoadingState } from '../types/fhir';

export const patientStore = writable<Patient | null>(null);
export const labResultsStore = writable<Observation[]>([]);
export const vitalSignsStore = writable<Observation[]>([]);

export const loadingStore = writable<LoadingState>({
  patient: false,
  labs: false,
  vitals: false
});

export const isLoading = derived(loadingStore, 
  $loading => Object.values($loading).some(Boolean)
);

export const errorStore = writable<Record<keyof LoadingState, Error | null>>({
  patient: null,
  labs: null,
  vitals: null
});
