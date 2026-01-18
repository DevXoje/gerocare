import { Err,Ok, type Result } from '@/shared/domain/Result'

import { IncidentSchema } from './Incident.schema'
import type { IncidentError } from './IncidentErrors'
import { createIncidentValidationError } from './IncidentErrors'

export interface Incident {
  id: string
  residentId: string
  type: 'fall' | 'injury' | 'medication-error' | 'behavioral' | 'medical' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  incidentDate: Date
  reportedBy: string // User ID
  status: 'reported' | 'in-progress' | 'resolved' | 'closed'
  resolvedAt?: Date
  resolvedBy?: string // User ID
  resolutionNotes?: string
  witnessNames?: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Validate an incident entity using Zod schema
 */
export function validateIncident(incident: unknown): Result<Incident, IncidentError> {
  const result = IncidentSchema.safeParse(incident)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return Err(createIncidentValidationError(firstError?.message || 'Validation failed'))
  }

  return Ok(result.data)
}

/**
 * Get type display name
 */
export function getTypeDisplayName(type: Incident['type']): string {
  const names: Record<Incident['type'], string> = {
    fall: 'Caída',
    injury: 'Lesión',
    'medication-error': 'Error de Medicación',
    behavioral: 'Conductual',
    medical: 'Médico',
    other: 'Otro',
  }
  return names[type]
}

/**
 * Get severity display name
 */
export function getSeverityDisplayName(severity: Incident['severity']): string {
  const names: Record<Incident['severity'], string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  }
  return names[severity]
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: Incident['status']): string {
  const names: Record<Incident['status'], string> = {
    reported: 'Reportada',
    'in-progress': 'En Progreso',
    resolved: 'Resuelta',
    closed: 'Cerrada',
  }
  return names[status]
}
