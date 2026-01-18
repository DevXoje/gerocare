import { deleteUser } from 'firebase/auth'

import { auth } from '@/infrastructure/firebase/firebase.config'

/**
 * Limpia todos los usuarios de Firebase Auth
 * Nota: En desarrollo con emuladores, esto eliminará los usuarios.
 * El usuario debe estar autenticado para eliminar su propia cuenta.
 * Para limpiar todos los usuarios, reinicia los emuladores o usa Firebase Admin.
 */
export async function clearUsers(): Promise<number> {
	let deletedCount = 0

	// Nota: Firebase Auth client SDK no permite listar usuarios
	// Para desarrollo, la mejor práctica es reiniciar los emuladores
	// o usar Firebase Admin SDK en un script separado
	console.log(
		'⚠️  Para limpiar usuarios de Firebase Auth:'
	)
	console.log('   1. Reinicia los emuladores (Ctrl+C y vuelve a iniciarlos)')
	console.log('   2. O usa Firebase Admin SDK en un script separado')
	console.log('   3. O elimina manualmente desde Firebase UI (http://localhost:4000)')

	// Si hay un usuario autenticado actual, podemos intentar eliminarlo
	// pero esto no es ideal para limpiar todos los usuarios
	const currentUser = auth.currentUser
	if (currentUser) {
		try {
			await deleteUser(currentUser)
			deletedCount++
			console.log(`✓ Usuario actual eliminado: ${currentUser.email}`)
		} catch (error) {
			console.error(`✗ Error al eliminar usuario actual:`, error)
		}
	}

	return deletedCount
}
