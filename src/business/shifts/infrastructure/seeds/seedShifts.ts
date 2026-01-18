import { faker } from '@faker-js/faker'

import type { Shift } from '@/business/shifts/domain/Shift'
import { createShiftRepository } from '@/business/shifts/infrastructure'

export interface SeedShift {
	shift: Shift
}

/**
 * Genera turnos de prueba para desarrollo
 */
export async function seedShifts(caregiverIds: string[], days: number = 30): Promise<SeedShift[]> {
	const repository = createShiftRepository()
	const created: SeedShift[] = []

	const shiftTypes: Shift['type'][] = ['morning', 'afternoon', 'night']
	const timeSlots = {
		morning: { start: '08:00', end: '16:00' },
		afternoon: { start: '16:00', end: '00:00' },
		night: { start: '00:00', end: '08:00' },
	}

	const today = new Date()
	const dates: Date[] = []

	// Generar fechas para los próximos N días
	for (let i = 0; i < days; i++) {
		const date = new Date(today)
		date.setDate(today.getDate() + i)
		dates.push(date)
	}

	for (const date of dates) {
		// Asignar turnos aleatoriamente
		const shiftsForDay = faker.helpers.arrayElements(shiftTypes, {
			min: 1,
			max: 3,
		})

		for (const shiftType of shiftsForDay) {
			const caregiverId = faker.helpers.arrayElement(caregiverIds)
			const timeSlot = timeSlots[shiftType]

			const shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'> = {
				caregiverId,
				type: shiftType,
				date: new Date(date),
				startTime: timeSlot.start,
				endTime: timeSlot.end,
				status: faker.helpers.arrayElement([
					'scheduled',
					'in-progress',
					'completed',
					'cancelled',
				] as const),
				notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
				assignedBy:
					caregiverIds.length > 1
						? faker.helpers.arrayElement(caregiverIds.filter(id => id !== caregiverId))
						: undefined,
			}

			const result = await repository.create(shiftData)

			if (result.success) {
				created.push({ shift: result.value })
			} else {
				console.error(`✗ Error al crear turno: ${result.error.message || 'Error desconocido'}`)
			}
		}
	}

	console.log(`✓ ${created.length} turnos creados para los próximos ${days} días`)
	return created
}
