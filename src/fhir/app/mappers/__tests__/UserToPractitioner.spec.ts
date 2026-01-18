import type { Practitioner } from 'fhir/r4'
import { describe, expect, it } from 'vitest'

import type { User } from '@/business/auth/domain/User'

import { practitionerToUser, userToPractitioner } from '../UserToPractitioner'

describe('UserToPractitioner mapper', () => {
	describe('userToPractitioner', () => {
		it('should convert User to FHIR Practitioner', () => {
			const user: User = {
				uid: 'user-123',
				email: 'doctor@example.com',
				displayName: 'Dr. María López',
				photoURL: 'https://example.com/photo.jpg',
				emailVerified: true,
			}

			const practitioner = userToPractitioner(user, 'practitioner-1')

			expect(practitioner.resourceType).toBe('Practitioner')
			expect(practitioner.id).toBe('practitioner-1')
			expect(practitioner.identifier?.[0]?.value).toBe('user-123')
			expect(practitioner.name?.[0]?.text).toBe('Dr. María López')
			expect(practitioner.telecom?.[0]?.value).toBe('doctor@example.com')
			expect(practitioner.photo?.[0]?.url).toBe('https://example.com/photo.jpg')
			expect(practitioner.active).toBe(true)
		})

		it('should parse full name into given and family', () => {
			const user: User = {
				uid: 'user-456',
				email: 'john.smith@example.com',
				displayName: 'John Smith',
				photoURL: null,
				emailVerified: false,
			}

			const practitioner = userToPractitioner(user, 'practitioner-2')

			expect(practitioner.name?.[0]?.given).toEqual(['John'])
			expect(practitioner.name?.[0]?.family).toBe('Smith')
		})

		it('should handle user with no display name', () => {
			const user: User = {
				uid: 'user-789',
				email: 'nouser@example.com',
				displayName: null,
				photoURL: null,
				emailVerified: false,
			}

			const practitioner = userToPractitioner(user, 'practitioner-3')

			expect(practitioner.name).toHaveLength(0)
			expect(practitioner.telecom?.[0]?.value).toBe('nouser@example.com')
		})

		it('should generate FHIR ID if not provided', () => {
			const user: User = {
				uid: 'user-gen',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: null,
				emailVerified: false,
			}

			const practitioner = userToPractitioner(user)

			expect(practitioner.id).toBeDefined()
			expect(practitioner.id).toMatch(/^fhir-/)
		})
	})

	describe('practitionerToUser', () => {
		it('should convert FHIR Practitioner to User (partial)', () => {
			const practitioner: Practitioner = {
				resourceType: 'Practitioner',
				id: 'practitioner-1',
				identifier: [
					{
						system: 'http://gerocare.app/practitioner',
						value: 'user-123',
					},
				],
				name: [
					{
						use: 'official',
						text: 'Dr. María López',
						given: ['María'],
						family: 'López',
					},
				],
				telecom: [{ system: 'email', value: 'doctor@example.com' }],
				photo: [{ url: 'https://example.com/photo.jpg' }],
				active: true,
			}

			const user = practitionerToUser(practitioner, 'user-123')

			expect(user.uid).toBe('user-123')
			expect(user.displayName).toBe('Dr. María López')
			expect(user.email).toBe('doctor@example.com')
			expect(user.photoURL).toBe('https://example.com/photo.jpg')
			expect(user.emailVerified).toBe(false)
		})

		it('should handle practitioner with name.given array', () => {
			const practitioner: Practitioner = {
				resourceType: 'Practitioner',
				id: 'practitioner-2',
				identifier: [{ system: 'http://gerocare.app/practitioner', value: 'user-2' }],
				name: [
					{
						use: 'official',
						given: ['John', 'Michael'],
						family: 'Smith',
					},
				],
				active: true,
			}

			const user = practitionerToUser(practitioner, 'user-2')

			expect(user.displayName).toBe('John Michael')
		})

		it('should handle practitioner with no contact information', () => {
			const practitioner: Practitioner = {
				resourceType: 'Practitioner',
				id: 'practitioner-3',
				identifier: [{ system: 'http://gerocare.app/practitioner', value: 'user-3' }],
				active: true,
			}

			const user = practitionerToUser(practitioner, 'user-3')

			expect(user.displayName).toBeNull()
			expect(user.email).toBeNull()
			expect(user.photoURL).toBeNull()
		})
	})
})
