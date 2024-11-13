import type { Patient, Observation, FHIRResponse } from '../types/fhir';

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
        throw new Error(`FHIR API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      throw new Error(`FHIR API request failed: ${error.message}`);
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
}
