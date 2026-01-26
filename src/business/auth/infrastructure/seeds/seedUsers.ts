import { faker } from '@faker-js/faker'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { auth } from '@/shared/infrastructure/firebase/firebase.config'

export interface SeedUser {
	email: string
	password: string
	displayName: string
	uid?: string
}

/**
 * Genera usuarios de prueba para desarrollo
 */
export async function seedUsers(count: number = 5): Promise<SeedUser[]> {
	const users: SeedUser[] = []
	const createdUsers: SeedUser[] = []

	// Generar usuarios
	for (let i = 0; i < count; i++) {
		users.push({
			email: `caregiver${i + 1}@gerocare.test`,
			password: 'password123',
			displayName: faker.person.fullName(),
		})
	}

	// Crear usuarios en Firebase Auth
	for (const user of users) {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password)
			createdUsers.push({
				...user,
				uid: userCredential.user.uid,
			})
			console.log(`✓ Usuario creado: ${user.email} (${userCredential.user.uid})`)
		} catch (error) {
			console.error(`✗ Error al crear usuario ${user.email}:`, error)
		}
	}

	return createdUsers
}
