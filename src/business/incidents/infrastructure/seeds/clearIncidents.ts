import { createIncidentRepository } from '@/business/incidents/infrastructure'

/**
 * Limpia todos los incidentes de la base de datos
 */
export async function clearIncidents(): Promise<number> {
	const repository = createIncidentRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const incident of result.value) {
			const deleteResult = await repository.delete(incident.id)
			if (deleteResult.success) {
				deletedCount++
				console.log(`✓ Incidente eliminado: ${incident.type} (${incident.id})`)
			} else {
				console.error(`✗ Error al eliminar incidente ${incident.id}: ${deleteResult.error.message}`)
			}
		}
	} else {
		console.error(`✗ Error al obtener incidentes: ${result.error.message}`)
	}

	return deletedCount
}
