import { ref } from 'vue'

import type { ResidentCreateInput } from '@/business/residents/domain/Resident.schema'
import { ResidentCreateSchema } from '@/business/residents/domain/Resident.schema'
import { Err, Ok, type Result } from '@/shared/domain/Result'

export interface ResidentFormData {
	firstName: string
	lastName: string
	dateOfBirth?: Date
	medicalInfo: {
		allergies: string[]
		chronicConditions: string[]
		medications: string[]
		dietaryRestrictions: string[]
	}
	emergencyContacts: {
		name: string
		relationship: string
		phone: string
		email?: string
	}[]
	assignedCaregivers: string[]
}

export function useResidentForm() {
	const form = ref<ResidentFormData>({
		firstName: '',
		lastName: '',
		dateOfBirth: undefined,
		medicalInfo: {
			allergies: [],
			chronicConditions: [],
			medications: [],
			dietaryRestrictions: [],
		},
		emergencyContacts: [],
		assignedCaregivers: [],
	})

	const validate = (): Result<ResidentFormData, string> => {
		// Convert form data to schema-compatible format
		if (!form.value.dateOfBirth) {
			return Err('dateOfBirth is required')
		}

		// Validate date is not in the future
		if (form.value.dateOfBirth > new Date()) {
			return Err('dateOfBirth cannot be in the future')
		}

		const formData: ResidentCreateInput = {
			firstName: form.value.firstName,
			lastName: form.value.lastName,
			dateOfBirth: form.value.dateOfBirth,
			medicalInfo: {
				allergies: form.value.medicalInfo.allergies || [],
				chronicConditions: form.value.medicalInfo.chronicConditions || [],
				medications: form.value.medicalInfo.medications || [],
				dietaryRestrictions: form.value.medicalInfo.dietaryRestrictions || [],
			},
			emergencyContacts: form.value.emergencyContacts,
			assignedCaregivers: form.value.assignedCaregivers || [],
		}

		const result = ResidentCreateSchema.safeParse(formData)

		if (!result.success) {
			const firstError = result.error.issues[0]
			return Err(firstError?.message || 'Validation failed')
		}

		return Ok(form.value)
	}

	const reset = () => {
		form.value = {
			firstName: '',
			lastName: '',
			dateOfBirth: undefined,
			medicalInfo: {
				allergies: [],
				chronicConditions: [],
				medications: [],
				dietaryRestrictions: [],
			},
			emergencyContacts: [],
			assignedCaregivers: [],
		}
	}

	return {
		form,
		validate,
		reset,
	}
}
