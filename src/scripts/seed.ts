import { clearActivityLogs } from '@/business/activity-logs/infrastructure/seeds/clearActivityLogs'
import { seedActivityLogs } from '@/business/activity-logs/infrastructure/seeds/seedActivityLogs'
import { clearUsers } from '@/business/auth/infrastructure/seeds/clearUsers'
import { seedUsers } from '@/business/auth/infrastructure/seeds/seedUsers'
import { clearCarePlans } from '@/business/care-plans/infrastructure/seeds/clearCarePlans'
import { seedCarePlans } from '@/business/care-plans/infrastructure/seeds/seedCarePlans'
import { clearIncidents } from '@/business/incidents/infrastructure/seeds/clearIncidents'
import { seedIncidents } from '@/business/incidents/infrastructure/seeds/seedIncidents'
import { clearMedications } from '@/business/medication/infrastructure/seeds/clearMedications'
import { seedMedications } from '@/business/medication/infrastructure/seeds/seedMedications'
import { clearResidents } from '@/business/residents/infrastructure/seeds/clearResidents'
import { seedResidents } from '@/business/residents/infrastructure/seeds/seedResidents'
import { clearShifts } from '@/business/shifts/infrastructure/seeds/clearShifts'
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

interface ClearOptions {
	activityLogs?: boolean
	shifts?: boolean
	incidents?: boolean
	carePlans?: boolean
	medications?: boolean
	residents?: boolean
	users?: boolean
}

/**
 * Limpia todos los datos de la base de datos
 * Orden inverso al seeding para respetar dependencias
 */
export async function clearDatabase(options: ClearOptions = {}) {
	const {
		activityLogs = true,
		shifts = true,
		incidents = true,
		carePlans = true,
		medications = true,
		residents = true,
		users = true,
	} = options

	console.log('🧹 Iniciando limpieza de la base de datos...\n')

	try {
		// Limpiar en orden inverso al seeding (dependencias primero)

		// 7. Registros de actividad (depende de residentes y usuarios)
		if (activityLogs) {
			console.log('📝 Limpiando registros de actividad...')
			const deleted = await clearActivityLogs()
			console.log(`✓ ${deleted} registros eliminados\n`)
		}

		// 6. Turnos (depende de usuarios)
		if (shifts) {
			console.log('🕐 Limpiando turnos...')
			const deleted = await clearShifts()
			console.log(`✓ ${deleted} turnos eliminados\n`)
		}

		// 5. Incidentes (depende de residentes)
		if (incidents) {
			console.log('⚠️  Limpiando incidentes...')
			const deleted = await clearIncidents()
			console.log(`✓ ${deleted} incidentes eliminados\n`)
		}

		// 4. Planes de cuidado (depende de residentes)
		if (carePlans) {
			console.log('📋 Limpiando planes de cuidado...')
			const deleted = await clearCarePlans()
			console.log(`✓ ${deleted} planes eliminados\n`)
		}

		// 3. Medicaciones (depende de residentes)
		if (medications) {
			console.log('💊 Limpiando medicaciones...')
			const deleted = await clearMedications()
			console.log(`✓ ${deleted} medicaciones eliminadas\n`)
		}

		// 2. Residentes (depende de usuarios para asignaciones)
		if (residents) {
			console.log('👥 Limpiando residentes...')
			const deleted = await clearResidents()
			console.log(`✓ ${deleted} residentes eliminados\n`)
		}

		// 1. Usuarios (últimos porque pueden estar referenciados por otras entidades)
		// Nota: Para limpiar usuarios de Firebase Auth completamente, reinicia los emuladores
		if (users) {
			console.log('📝 Limpiando usuarios...')
			const deleted = await clearUsers()
			console.log(`✓ ${deleted} usuarios eliminados\n`)
		}

		console.log('✅ Limpieza completada exitosamente!')
	} catch (error) {
		console.error('❌ Error durante la limpieza:', error)
		throw error
	}
}

// Ejecutar si se llama directamente
const command = process.argv[2]

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		if (command === 'clear' || command === 'clean') {
			await clearDatabase()
			console.log('\n✨ Limpieza completada')
		} else {
			await seedDatabase()
			console.log('\n✨ Proceso completado')
		}
		process.exit(0)
	} catch (error) {
		console.error('❌ Error fatal:', error)
		process.exit(1)
	}
}
