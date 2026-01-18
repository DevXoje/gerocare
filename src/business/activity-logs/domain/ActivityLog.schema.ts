import { z } from 'zod'

// Enums for ActivityLog
const ActivityTypeSchema = z.enum(['hygiene', 'mobility', 'nutrition', 'medication', 'social', 'other'])
const ActivityStatusSchema = z.enum(['completed', 'partial', 'skipped'])

// Base schema for creating an activity log (without auto-generated fields)
export const ActivityLogCreateSchema = z.object({
  residentId: z.string().min(1, 'residentId is required and must be a string'),
  caregiverId: z.string().min(1, 'caregiverId is required and must be a string'),
  activityType: ActivityTypeSchema,
  title: z.string().min(1, 'title is required and must be a non-empty string'),
  description: z.string().min(1, 'description is required and must be a non-empty string'),
  timestamp: z.date(),
  duration: z.number().int().positive().optional(), // minutes
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(), // URLs
  status: ActivityStatusSchema,
})

// Full activity log schema (with id and timestamps)
export const ActivityLogSchema = ActivityLogCreateSchema.extend({
  id: z.string(),
  createdAt: z.date(),
})

// Type inference from schemas
export type ActivityLogCreateInput = z.infer<typeof ActivityLogCreateSchema>
export type ActivityLogInput = z.infer<typeof ActivityLogSchema>
