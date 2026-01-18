import { createShiftRepository } from '@/business/shifts/infrastructure'

/**
 * Limpia todos los turnos de la base de datos
 */
export async function clearShifts(): Promise<number> {
	const repository = createShiftRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const shift of result.value) {
			const deleteResult = await repository.delete(shift.id)
			if (deleteResult.success) {
				deletedCount++
			} else {
				console.error(`✗ Error al eliminar turno ${shift.id}: ${deleteResult.error.message}`)
			}
		}
		console.log(`✓ ${deletedCount} turnos eliminados`)
	} else {
		console.error(`✗ Error al obtener turnos: ${result.error.message}`)
	}

	return deletedCount
}
