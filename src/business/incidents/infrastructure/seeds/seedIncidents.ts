import { faker } from '@faker-js/faker'

import type { Incident } from '@/business/incidents/domain/Incident'
import { createIncidentRepository } from '@/business/incidents/infrastructure'

export interface SeedIncident {
	incident: Incident
}

/**
 * Genera incidentes de prueba para desarrollo
 */
export async function seedIncidents(
	residentIds: string[],
	caregiverIds: string[] = []
): Promise<SeedIncident[]> {
	const repository = createIncidentRepository()
	const created: SeedIncident[] = []

	// Crear algunos incidentes (no todos los residentes tienen incidentes)
	const residentsWithIncidents = faker.helpers.arrayElements(residentIds, {
		min: 0,
		max: Math.min(5, residentIds.length),
	})

	for (const residentId of residentsWithIncidents) {
		const incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'> = {
			residentId,
			type: faker.helpers.arrayElement([
				'fall',
				'injury',
				'medication-error',
				'behavioral',
				'medical',
				'other',
			] as const),
			severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'] as const),
			description: faker.lorem.paragraph(),
			location: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.7 }),
			incidentDate: faker.date.past({ years: 1 }),
			reportedBy: caregiverIds.length > 0 ? faker.helpers.arrayElement(caregiverIds) : '',
			status: faker.helpers.arrayElement([
				'reported',
				'in-progress',
				'resolved',
				'closed',
			] as const),
			resolvedAt: faker.helpers.maybe(() => faker.date.past({ years: 0.5 }), { probability: 0.5 }),
			resolvedBy: faker.helpers.maybe(
				() => (caregiverIds.length > 0 ? faker.helpers.arrayElement(caregiverIds) : undefined),
				{ probability: 0.5 }
			),
			resolutionNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
			witnessNames: faker.helpers.maybe(() => [faker.person.fullName(), faker.person.fullName()], {
				probability: 0.3,
			}),
		}

		const result = await repository.create(incidentData)

		if (result.success) {
			created.push({ incident: result.value })
			console.log(`✓ Incidente creado: ${result.value.type} para residente ${residentId}`)
		} else {
			console.error(`✗ Error al crear incidente: ${result.error.message || 'Error desconocido'}`)
		}
	}

	return created
}
