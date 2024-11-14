import type { Patient, Observation, FHIRResponse, MedicationRequest } from '../types/fhir';

export class FHIRService {
  constructor(private baseUrl: string, private accessToken: string) {}

  private async fetchWithAuth<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FHIR API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('FHIR API request failed:', error);
        throw new Error(`FHIR API request failed: ${error.message}`);
      }
      throw new Error('FHIR API request failed: Unknown error');
    }
  }

  async getPatient(patientId: string): Promise<Patient> {
    return this.fetchWithAuth<Patient>(`Patient/${patientId}`);
  }

  async getLabResults(patientId: string): Promise<FHIRResponse<Observation>> {
    return this.fetchWithAuth<FHIRResponse<Observation>>(
      `Observation?category=laboratory&patient=${patientId}&_sort=-date&_count=100`
    );
  }

  async getVitalSigns(patientId: string): Promise<FHIRResponse<Observation>> {
    return this.fetchWithAuth<FHIRResponse<Observation>>(
      `Observation?category=vital-signs&patient=${patientId}&_sort=code,-date`
    );
  }

  async getMedications(patientId: string): Promise<FHIRResponse<MedicationRequest>> {
    return this.fetchWithAuth<FHIRResponse<MedicationRequest>>(
      `MedicationRequest?patient=${patientId}`
    );
  }
}
