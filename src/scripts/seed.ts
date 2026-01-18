import { seedActivityLogs } from '@/business/activity-logs/infrastructure/seeds/seedActivityLogs'
import { seedUsers } from '@/business/auth/infrastructure/seeds/seedUsers'
import { seedCarePlans } from '@/business/care-plans/infrastructure/seeds/seedCarePlans'
import { seedIncidents } from '@/business/incidents/infrastructure/seeds/seedIncidents'
import { seedMedications } from '@/business/medication/infrastructure/seeds/seedMedications'
import { seedResidents } from '@/business/residents/infrastructure/seeds/seedResidents'
import { seedShifts } from '@/business/shifts/infrastructure/seeds/seedShifts'

interface SeedOptions {
	users?: number
	residents?: number
	medications?: boolean
	carePlans?: boolean
	incidents?: boolean
	shifts?: boolean
	activityLogs?: boolean
	shiftDays?: number
	activityLogDays?: number
}

/**
 * Ejecuta el seeding completo de la base de datos
 */
export async function seedDatabase(options: SeedOptions = {}) {
	const {
		users = 5,
		residents = 10,
		medications = true,
		carePlans = true,
		incidents = true,
		shifts = true,
		activityLogs = true,
		shiftDays = 30,
		activityLogDays = 7,
	} = options

	console.log('🌱 Iniciando seeding de la base de datos...\n')

	try {
		// 1. Crear usuarios primero (son necesarios para otras entidades)
		console.log('📝 Creando usuarios...')
		const createdUsers = await seedUsers(users)
		const caregiverIds = createdUsers.map(u => u.uid!).filter(Boolean)
		console.log(`✓ ${createdUsers.length} usuarios creados\n`)

		// 2. Crear residentes
		console.log('👥 Creando residentes...')
		const createdResidents = await seedResidents(residents, caregiverIds)
		const residentIds = createdResidents.map(r => r.resident.id)
		console.log(`✓ ${createdResidents.length} residentes creados\n`)

		// 3. Crear medicaciones (depende de residentes)
		if (medications && residentIds.length > 0) {
			console.log('💊 Creando medicaciones...')
			await seedMedications(residentIds, caregiverIds)
			console.log('✓ Medicaciones creadas\n')
		}

		// 4. Crear planes de cuidado (depende de residentes)
		if (carePlans && residentIds.length > 0) {
			console.log('📋 Creando planes de cuidado...')
			await seedCarePlans(residentIds, caregiverIds)
			console.log('✓ Planes de cuidado creados\n')
		}

		// 5. Crear incidentes (depende de residentes)
		if (incidents && residentIds.length > 0) {
			console.log('⚠️  Creando incidentes...')
			await seedIncidents(residentIds, caregiverIds)
			console.log('✓ Incidentes creados\n')
		}

		// 6. Crear turnos (depende de usuarios)
		if (shifts && caregiverIds.length > 0) {
			console.log('🕐 Creando turnos...')
			await seedShifts(caregiverIds, shiftDays)
			console.log('✓ Turnos creados\n')
		}

		// 7. Crear registros de actividad (depende de residentes y usuarios)
		if (activityLogs && residentIds.length > 0 && caregiverIds.length > 0) {
			console.log('📝 Creando registros de actividad...')
			await seedActivityLogs(residentIds, caregiverIds, activityLogDays)
			console.log('✓ Registros de actividad creados\n')
		}

		console.log('✅ Seeding completado exitosamente!')
		console.log('\n📊 Resumen:')
		console.log(`   - Usuarios: ${createdUsers.length}`)
		console.log(`   - Residentes: ${createdResidents.length}`)
		console.log(`   - Medicaciones: ${medications ? 'Sí' : 'No'}`)
		console.log(`   - Planes de cuidado: ${carePlans ? 'Sí' : 'No'}`)
		console.log(`   - Incidentes: ${incidents ? 'Sí' : 'No'}`)
		console.log(`   - Turnos: ${shifts ? 'Sí' : 'No'}`)
		console.log(`   - Registros de actividad: ${activityLogs ? 'Sí' : 'No'}`)
	} catch (error) {
		console.error('❌ Error durante el seeding:', error)
		throw error
	}
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await seedDatabase()
		console.log('\n✨ Proceso completado')
		process.exit(0)
	} catch (error) {
		console.error('❌ Error fatal:', error)
		process.exit(1)
	}
}
