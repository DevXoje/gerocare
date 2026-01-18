import { faker } from '@faker-js/faker'

import type { Resident } from '@/business/residents/domain/Resident'
import { createResidentRepository } from '@/business/residents/infrastructure'

export interface SeedResident {
	resident: Resident
	caregiverIds: string[]
}

/**
 * Genera residentes de prueba para desarrollo
 */
export async function seedResidents(
	count: number = 10,
	caregiverIds: string[] = []
): Promise<SeedResident[]> {
	const repository = createResidentRepository()
	const created: SeedResident[] = []

	const allergies = ['Penicilina', 'Ibuprofeno', 'Látex', 'Polen', 'Mariscos', 'Lactosa']

	const chronicConditions = [
		'Hipertensión',
		'Diabetes tipo 2',
		'Artritis',
		'Osteoporosis',
		'Demencia',
		'Enfermedad de Parkinson',
	]

	const dietaryRestrictions = ['Sin sal', 'Sin azúcar', 'Dieta blanda', 'Sin gluten', 'Vegetariana']

	for (let i = 0; i < count; i++) {
		const age = faker.number.int({ min: 65, max: 95 })
		const today = new Date()
		const dateOfBirth = new Date(
			today.getFullYear() - age,
			faker.number.int({ min: 0, max: 11 }),
			faker.number.int({ min: 1, max: 28 })
		)

		// Asignar algunos cuidadores aleatoriamente
		const assignedCaregivers =
			caregiverIds.length > 0
				? faker.helpers.arrayElements(caregiverIds, {
						min: 1,
						max: Math.min(3, caregiverIds.length),
					})
				: []

		const residentData: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'> = {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			dateOfBirth,
			medicalInfo: {
				allergies: faker.helpers.arrayElements(allergies, { min: 0, max: 2 }),
				chronicConditions: faker.helpers.arrayElements(chronicConditions, {
					min: 0,
					max: 3,
				}),
				medications: [],
				dietaryRestrictions: faker.helpers.arrayElements(dietaryRestrictions, {
					min: 0,
					max: 2,
				}),
			},
			emergencyContacts: [
				{
					name: faker.person.fullName(),
					relationship: faker.helpers.arrayElement([
						'Hija',
						'Hijo',
						'Cónyuge',
						'Hermano',
						'Hermana',
						'Sobrino',
						'Sobrina',
					]),
					phone: faker.phone.number({ style: 'national' }),
					email: faker.internet.email(),
				},
				...(faker.datatype.boolean()
					? [
							{
								name: faker.person.fullName(),
								relationship: faker.helpers.arrayElement(['Hijo', 'Hija', 'Amigo']),
								phone: faker.phone.number({ style: 'national' }),
								email: faker.internet.email(),
							},
						]
					: []),
			],
			assignedCaregivers,
		}

		const result = await repository.create(residentData)

		if (result.success) {
			created.push({
				resident: result.value,
				caregiverIds: assignedCaregivers,
			})
			console.log(
				`✓ Residente creado: ${result.value.firstName} ${result.value.lastName} (${result.value.id})`
			)
		} else {
			console.error(`✗ Error al crear residente: ${result.error.message || 'Error desconocido'}`)
		}
	}

	return created
}
