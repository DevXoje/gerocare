import { faker } from '@faker-js/faker'

import type { CarePlan } from '@/business/care-plans/domain/CarePlan'
import { createCarePlanRepository } from '@/business/care-plans/infrastructure'

export interface SeedCarePlan {
	carePlan: CarePlan
}

/**
 * Genera planes de cuidado de prueba para desarrollo
 */
export async function seedCarePlans(
	residentIds: string[],
	caregiverIds: string[] = []
): Promise<SeedCarePlan[]> {
	const repository = createCarePlanRepository()
	const created: SeedCarePlan[] = []

	const carePlanTemplates = [
		{
			title: 'Rutina de higiene matutina',
			description: 'Asistencia con baño, cepillado de dientes y cambio de ropa',
			category: 'hygiene' as const,
			frequency: 'daily' as const,
		},
		{
			title: 'Ejercicios de movilidad',
			description: 'Caminata de 15 minutos y ejercicios de estiramiento',
			category: 'mobility' as const,
			frequency: 'daily' as const,
		},
		{
			title: 'Control de signos vitales',
			description: 'Medición de presión arterial y temperatura',
			category: 'medical' as const,
			frequency: 'daily' as const,
		},
		{
			title: 'Actividades sociales',
			description: 'Participación en actividades grupales',
			category: 'social' as const,
			frequency: 'weekly' as const,
		},
		{
			title: 'Estimulación cognitiva',
			description: 'Ejercicios de memoria y atención',
			category: 'cognitive' as const,
			frequency: 'daily' as const,
		},
	]

	for (const residentId of residentIds) {
		// Crear 2-4 planes de cuidado por residente
		const count = faker.number.int({ min: 2, max: 4 })
		const selectedTemplates = faker.helpers.arrayElements(carePlanTemplates, count)

		for (const template of selectedTemplates) {
			const startDate = faker.date.past({ years: 1 })
			const endDate = faker.datatype.boolean() ? faker.date.future({ years: 1 }) : undefined

			const carePlanData: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'> = {
				residentId,
				title: template.title,
				description: template.description,
				category: template.category,
				frequency: template.frequency,
				priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent'] as const),
				startDate,
				endDate,
				status: faker.helpers.arrayElement(['active', 'paused', 'completed'] as const),
				createdBy: caregiverIds.length > 0 ? faker.helpers.arrayElement(caregiverIds) : '',
				assignedTo:
					caregiverIds.length > 0
						? faker.helpers.arrayElements(caregiverIds, {
								min: 1,
								max: Math.min(2, caregiverIds.length),
							})
						: undefined,
			}

			const result = await repository.create(carePlanData)

			if (result.success) {
				created.push({ carePlan: result.value })
				console.log(`✓ Plan de cuidado creado: ${result.value.title} para residente ${residentId}`)
			} else {
				console.error(
					`✗ Error al crear plan de cuidado: ${result.error.message || 'Error desconocido'}`
				)
			}
		}
	}

	return created
}
