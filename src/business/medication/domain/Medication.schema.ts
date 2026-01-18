import { z } from 'zod'

// Base schema for creating a medication (without auto-generated fields)
export const MedicationCreateSchema = z
	.object({
		residentId: z.string().min(1, 'residentId is required and must be a string'),
		name: z.string().min(1, 'name is required and must be a non-empty string'),
		dosage: z.string().min(1, 'dosage is required and must be a non-empty string'),
		frequency: z.string().min(1, 'frequency is required and must be a non-empty string'),
		startDate: z.date(),
		endDate: z.date().optional(),
		instructions: z.string().optional(),
		prescribedBy: z.string().optional(),
	})
	.refine(data => !data.endDate || data.endDate >= data.startDate, {
		message: 'endDate must be after startDate',
		path: ['endDate'],
	})

// Full medication schema (with id and timestamps)
export const MedicationSchema = MedicationCreateSchema.extend({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

// Type inference from schemas
export type MedicationCreateInput = z.infer<typeof MedicationCreateSchema>
export type MedicationInput = z.infer<typeof MedicationSchema>
