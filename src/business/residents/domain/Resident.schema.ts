import { z } from 'zod'

// Emergency contact schema
const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'name is required'),
  relationship: z.string().min(1, 'relationship is required'),
  phone: z.string().min(1, 'phone is required'),
  email: z.email().optional().or(z.literal('')),
})

// Medical info schema
const MedicalInfoSchema = z.object({
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
})

// Base schema for creating a resident (without auto-generated fields)
export const ResidentCreateSchema = z.object({
  firstName: z.string().min(1, 'firstName is required and must be a non-empty string'),
  lastName: z.string().min(1, 'lastName is required and must be a non-empty string'),
  dateOfBirth: z.date(),
  medicalInfo: MedicalInfoSchema,
  emergencyContacts: z.array(EmergencyContactSchema),
  assignedCaregivers: z.array(z.string()),
})

// Full resident schema (with id and timestamps)
export const ResidentSchema = ResidentCreateSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type inference from schemas
export type ResidentCreateInput = z.infer<typeof ResidentCreateSchema>
export type ResidentInput = z.infer<typeof ResidentSchema>
