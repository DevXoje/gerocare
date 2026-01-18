import { faker } from '@faker-js/faker'

import type { Medication } from '@/business/medication/domain/Medication'
import { createMedicationRepository } from '@/business/medication/infrastructure'

export interface SeedMedication {
	medication: Medication
}

/**
 * Genera medicaciones de prueba para desarrollo
 */
export async function seedMedications(
	residentIds: string[],
	caregiverIds: string[] = []
): Promise<SeedMedication[]> {
	const repository = createMedicationRepository()
	const created: SeedMedication[] = []

	const medications = [
		{ name: 'Paracetamol', dosage: '500mg' },
		{ name: 'Ibuprofeno', dosage: '400mg' },
		{ name: 'Omeprazol', dosage: '20mg' },
		{ name: 'Metformina', dosage: '850mg' },
		{ name: 'Amlodipino', dosage: '5mg' },
		{ name: 'Atorvastatina', dosage: '20mg' },
		{ name: 'Aspirina', dosage: '100mg' },
		{ name: 'Levotiroxina', dosage: '50mcg' },
	]

	const frequencies = [
		'8:00, 20:00',
		'8:00, 14:00, 20:00',
		'Una vez al día',
		'Cada 12 horas',
		'Cada 8 horas',
	]

	for (const residentId of residentIds) {
		// Crear 1-3 medicaciones por residente
		const count = faker.number.int({ min: 1, max: 3 })
		const selectedMedications = faker.helpers.arrayElements(medications, count)

		for (const med of selectedMedications) {
			const startDate = faker.date.past({ years: 1 })
			const endDate = faker.datatype.boolean() ? faker.date.future({ years: 1 }) : undefined

			const medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
				residentId,
				name: med.name,
				dosage: med.dosage,
				frequency: faker.helpers.arrayElement(frequencies),
				startDate,
				endDate,
				instructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }),
				prescribedBy:
					caregiverIds.length > 0 ? faker.helpers.arrayElement(caregiverIds) : undefined,
			}

			const result = await repository.create(medicationData)

			if (result.success) {
				created.push({ medication: result.value })
				console.log(`✓ Medicación creada: ${result.value.name} para residente ${residentId}`)
			} else {
				console.error(`✗ Error al crear medicación: ${result.error.message || 'Error desconocido'}`)
			}
		}
	}

	return created
}
