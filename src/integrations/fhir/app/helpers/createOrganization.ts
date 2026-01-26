import type { Organization } from 'fhir/r4'
@zxcvbn-ts/language-common
import { generateFHIRId } from '@/integrations/fhir/domain/FHIRResource'

/**
 * Create a default Organization resource for the geriatric care facility
 * This represents the care home/facility where residents are located
 */
export function createDefaultOrganization(
	name: string,
	id?: string,
	additionalInfo?: {
		address?: string
		phone?: string
		email?: string
	}
): Organization {
	const organizationId = id || generateFHIRId()

	const telecom = []
	if (additionalInfo?.phone) {
		telecom.push({
			system: 'phone' as const,
			value: additionalInfo.phone,
		})
	}
	if (additionalInfo?.email) {
		telecom.push({
			system: 'email' as const,
			value: additionalInfo.email,
		})
	}

	return {
		resourceType: 'Organization',
		id: organizationId,
		name,
		...(additionalInfo?.address && {
			address: [
				{
					text: additionalInfo.address,
				},
			],
		}),
		...(telecom.length > 0 && { telecom }),
		active: true,
	}
}
