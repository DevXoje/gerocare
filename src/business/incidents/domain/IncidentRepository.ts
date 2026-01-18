import type { Result } from '@/shared/domain/Result'

import type { Incident } from './Incident'
import type { IncidentError } from './IncidentErrors'

export interface IncidentRepository {
  /**
   * Create a new incident
   */
  create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Incident, IncidentError>>

  /**
   * Find an incident by ID
   */
  findById(id: string): Promise<Result<Incident | null, IncidentError>>

  /**
   * Find all incidents for a resident
   */
  findByResident(residentId: string): Promise<Result<Incident[], IncidentError>>

  /**
   * Find all unresolved incidents for a resident
   */
  findUnresolvedByResident(residentId: string): Promise<Result<Incident[], IncidentError>>

  /**
   * Find all incidents by severity
   */
  findBySeverity(severity: Incident['severity']): Promise<Result<Incident[], IncidentError>>

  /**
   * Find all incidents
   */
  findAll(): Promise<Result<Incident[], IncidentError>>

  /**
   * Update an existing incident
   */
  update(id: string, updates: Partial<Omit<Incident, 'id' | 'createdAt'>>): Promise<Result<Incident, IncidentError>>

  /**
   * Delete an incident
   */
  delete(id: string): Promise<Result<void, IncidentError>>
}
