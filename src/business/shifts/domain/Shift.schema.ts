import { z } from 'zod'

// Enums for Shift
const ShiftTypeSchema = z.enum(['morning', 'afternoon', 'night'])
const ShiftStatusSchema = z.enum(['scheduled', 'in-progress', 'completed', 'cancelled'])

// Base schema for creating a shift (without auto-generated fields)
export const ShiftCreateSchema = z
  .object({
    caregiverId: z.string().min(1, 'caregiverId is required and must be a string'),
    type: ShiftTypeSchema,
    date: z.date(),
    startTime: z.string().min(1, 'startTime is required'), // e.g., "08:00"
    endTime: z.string().min(1, 'endTime is required'), // e.g., "16:00"
    status: ShiftStatusSchema,
    notes: z.string().optional(),
    assignedBy: z.string().optional(), // User ID who assigned the shift
  })
  .refine((data) => {
    // Validate that endTime is after startTime
    const start = data.startTime.split(':').map(Number)
    const end = data.endTime.split(':').map(Number)
    const startMinutes = start[0]! * 60 + (start[1] || 0)
    const endMinutes = end[0]! * 60 + (end[1] || 0)
    return endMinutes > startMinutes
  }, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  })

// Full shift schema (with id and timestamps)
export const ShiftSchema = ShiftCreateSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type inference from schemas
export type ShiftCreateInput = z.infer<typeof ShiftCreateSchema>
export type ShiftInput = z.infer<typeof ShiftSchema>
