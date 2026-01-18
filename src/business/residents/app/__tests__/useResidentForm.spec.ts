import { describe, expect, it } from 'vitest'

import { useResidentForm } from '../useResidentForm'

describe('useResidentForm', () => {
	describe('validation', () => {
		it('should validate form with valid data', () => {
			const { form, validate } = useResidentForm()

			form.value = {
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth: new Date(1950, 0, 1),
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
			}

			const result = validate()
			expect(result.success).toBe(true)
		})

		it('should fail validation if firstName is missing', () => {
			const { form, validate } = useResidentForm()

			form.value = {
				firstName: '',
				lastName: 'Pérez',
				dateOfBirth: new Date(1950, 0, 1),
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
			}

			const result = validate()
			expect(result.success).toBe(false)
		})

		it('should fail validation if lastName is missing', () => {
			const { form, validate } = useResidentForm()

			form.value = {
				firstName: 'Juan',
				lastName: '',
				dateOfBirth: new Date(1950, 0, 1),
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
			}

			const result = validate()
			expect(result.success).toBe(false)
		})

		it('should validate email format in emergency contacts', () => {
			const { form, validate } = useResidentForm()

			form.value = {
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth: new Date(1950, 0, 1),
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [
					{
						name: 'María Pérez',
						relationship: 'Hija',
						phone: '+34600123456',
						email: 'invalid-email',
					},
				],
				assignedCaregivers: [],
			}

			const result = validate()
			expect(result.success).toBe(false)
		})

		it('should validate that dateOfBirth is not in the future', () => {
			const { form, validate } = useResidentForm()

			const futureDate = new Date()
			futureDate.setFullYear(futureDate.getFullYear() + 1)

			form.value = {
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth: futureDate,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
			}

			const result = validate()
			expect(result.success).toBe(false)
		})
	})

	describe('reset', () => {
		it('should reset form to initial state', () => {
			const { form, reset } = useResidentForm()

			form.value = {
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth: new Date(1950, 0, 1),
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
			}

			reset()

			expect(form.value.firstName).toBe('')
			expect(form.value.lastName).toBe('')
			expect(form.value.dateOfBirth).toBeUndefined()
		})
	})
})
