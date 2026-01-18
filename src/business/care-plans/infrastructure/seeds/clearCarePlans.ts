import { createCarePlanRepository } from '@/business/care-plans/infrastructure'

/**
 * Limpia todos los planes de cuidado de la base de datos
 */
export async function clearCarePlans(): Promise<number> {
	const repository = createCarePlanRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const carePlan of result.value) {
			const deleteResult = await repository.delete(carePlan.id)
			if (deleteResult.success) {
				deletedCount++
				console.log(`✓ Plan de cuidado eliminado: ${carePlan.title} (${carePlan.id})`)
			} else {
				console.error(
					`✗ Error al eliminar plan de cuidado ${carePlan.id}: ${deleteResult.error.message}`
				)
			}
		}
	} else {
		console.error(`✗ Error al obtener planes de cuidado: ${result.error.message}`)
	}

	return deletedCount
}
