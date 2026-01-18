import { createMedicationRepository } from '@/business/medication/infrastructure'

/**
 * Limpia todas las medicaciones de la base de datos
 */
export async function clearMedications(): Promise<number> {
	const repository = createMedicationRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const medication of result.value) {
			const deleteResult = await repository.delete(medication.id)
			if (deleteResult.success) {
				deletedCount++
				console.log(`✓ Medicación eliminada: ${medication.name} (${medication.id})`)
			} else {
				console.error(
					`✗ Error al eliminar medicación ${medication.id}: ${deleteResult.error.message}`
				)
			}
		}
	} else {
		console.error(`✗ Error al obtener medicaciones: ${result.error.message}`)
	}

	return deletedCount
}
