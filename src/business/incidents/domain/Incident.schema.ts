import { z } from 'zod'

// Enums for Incident
const IncidentTypeSchema = z.enum([
	'fall',
	'injury',
	'medication-error',
	'behavioral',
	'medical',
	'other',
])
const IncidentSeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])
const IncidentStatusSchema = z.enum(['reported', 'in-progress', 'resolved', 'closed'])

// Base schema for creating an incident (without auto-generated fields)
export const IncidentCreateSchema = z.object({
	residentId: z.string().min(1, 'residentId is required and must be a string'),
	type: IncidentTypeSchema,
	severity: IncidentSeveritySchema,
	description: z.string().min(1, 'description is required and must be a non-empty string'),
	location: z.string().optional(),
	incidentDate: z.date(),
	reportedBy: z.string().min(1, 'reportedBy is required'),
	status: IncidentStatusSchema,
	resolvedAt: z.date().optional(),
	resolvedBy: z.string().optional(),
	resolutionNotes: z.string().optional(),
	witnessNames: z.array(z.string()).optional(),
})

// Full incident schema (with id and timestamps)
export const IncidentSchema = IncidentCreateSchema.extend({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

// Type inference from schemas
export type IncidentCreateInput = z.infer<typeof IncidentCreateSchema>
export type IncidentInput = z.infer<typeof IncidentSchema>
