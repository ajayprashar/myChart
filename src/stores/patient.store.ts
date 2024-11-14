import { writable, derived } from 'svelte/store';
import type { Patient, Observation, MedicationRequest } from '../types/fhir';
import type { TabId } from '../constants/tabs';

export const patientStore = writable<Patient | null>(null);
export const labResultsStore = writable<Observation[]>([]);
export const vitalSignsStore = writable<Observation[]>([]);
export const medicationsStore = writable<MedicationRequest[]>([]);

export const loadingStore = writable<Record<TabId, boolean>>({
  demographics: false,
  labs: false,
  vitals: false,
  medications: false
});

export const isLoading = derived(loadingStore, 
  $loading => Object.values($loading).some(Boolean)
);

export const errorStore = writable<Record<TabId, Error | null>>({
  demographics: null,
  labs: null,
  vitals: null,
  medications: null
});

loadingStore.subscribe(value => {
  console.log('Loading state changed:', value);
});
