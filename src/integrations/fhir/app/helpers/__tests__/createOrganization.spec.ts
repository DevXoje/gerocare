import { describe, expect, it } from 'vitest'

import { createDefaultOrganization } from '../createOrganization'

describe('createDefaultOrganization', () => {
	it('should create a basic Organization resource', () => {
		const org = createDefaultOrganization('GeroCare Residence')

		expect(org.resourceType).toBe('Organization')
		expect(org.name).toBe('GeroCare Residence')
		expect(org.active).toBe(true)
		expect(org.id).toBeDefined()
		expect(org.id).toMatch(/^fhir-/)
	})

	it('should preserve provided ID', () => {
		const org = createDefaultOrganization('Test Org', 'custom-org-id')

		expect(org.id).toBe('custom-org-id')
	})

	it('should include address if provided', () => {
		const org = createDefaultOrganization('GeroCare', undefined, {
			address: '123 Main Street, Madrid, Spain',
		})

		expect(org.address).toBeDefined()
		expect(org.address?.[0]?.text).toBe('123 Main Street, Madrid, Spain')
	})

	it('should include phone if provided', () => {
		const org = createDefaultOrganization('GeroCare', undefined, {
			phone: '+34 91 123 4567',
		})

		expect(org.telecom).toBeDefined()
		expect(org.telecom?.[0]?.system).toBe('phone')
		expect(org.telecom?.[0]?.value).toBe('+34 91 123 4567')
	})

	it('should include email if provided', () => {
		const org = createDefaultOrganization('GeroCare', undefined, {
			email: 'info@gerocare.es',
		})

		expect(org.telecom).toBeDefined()
		const emailTelecom = org.telecom?.find(t => t.system === 'email')
		expect(emailTelecom?.value).toBe('info@gerocare.es')
	})

	it('should include all contact information if provided', () => {
		const org = createDefaultOrganization('GeroCare Full', undefined, {
			address: '123 Main Street',
			phone: '+34 91 123 4567',
			email: 'info@gerocare.es',
		})

		expect(org.address).toBeDefined()
		expect(org.telecom).toBeDefined()
		expect(org.telecom).toHaveLength(2) // phone + email

		const phoneTelecom = org.telecom?.find(t => t.system === 'phone')
		const emailTelecom = org.telecom?.find(t => t.system === 'email')

		expect(phoneTelecom?.value).toBe('+34 91 123 4567')
		expect(emailTelecom?.value).toBe('info@gerocare.es')
	})
})
