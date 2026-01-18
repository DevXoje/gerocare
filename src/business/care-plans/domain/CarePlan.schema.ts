import { z } from 'zod'

// Enums for CarePlan
const CarePlanCategorySchema = z.enum([
	'hygiene',
	'nutrition',
	'mobility',
	'social',
	'medical',
	'cognitive',
])
const CarePlanFrequencySchema = z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'as-needed'])
const CarePlanPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
const CarePlanStatusSchema = z.enum(['active', 'paused', 'completed', 'cancelled'])

// Base schema for creating a care plan (without auto-generated fields)
export const CarePlanCreateSchema = z
	.object({
		residentId: z.string().min(1, 'residentId is required and must be a string'),
		title: z.string().min(1, 'title is required and must be a non-empty string'),
		description: z.string().min(1, 'description is required and must be a string'),
		category: CarePlanCategorySchema,
		frequency: CarePlanFrequencySchema,
		priority: CarePlanPrioritySchema,
		startDate: z.date(),
		endDate: z.date().optional(),
		status: CarePlanStatusSchema,
		createdBy: z.string().min(1, 'createdBy is required'),
		assignedTo: z.array(z.string()).optional(),
	})
	.refine(data => !data.endDate || data.endDate >= data.startDate, {
		message: 'endDate must be after startDate',
		path: ['endDate'],
	})

// Full care plan schema (with id and timestamps)
export const CarePlanSchema = CarePlanCreateSchema.extend({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

// Type inference from schemas
export type CarePlanCreateInput = z.infer<typeof CarePlanCreateSchema>
export type CarePlanInput = z.infer<typeof CarePlanSchema>
