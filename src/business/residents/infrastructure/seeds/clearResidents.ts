import { createResidentRepository } from '@/business/residents/infrastructure'

/**
 * Limpia todos los residentes de la base de datos
 */
export async function clearResidents(): Promise<number> {
	const repository = createResidentRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const resident of result.value) {
			const deleteResult = await repository.delete(resident.id)
			if (deleteResult.success) {
				deletedCount++
				console.log(
					`✓ Residente eliminado: ${resident.firstName} ${resident.lastName} (${resident.id})`
				)
			} else {
				console.error(`✗ Error al eliminar residente ${resident.id}: ${deleteResult.error.message}`)
			}
		}
	} else {
		console.error(`✗ Error al obtener residentes: ${result.error.message}`)
	}

	return deletedCount
}
