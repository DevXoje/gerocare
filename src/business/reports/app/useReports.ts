import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import { useCarePlanStore } from '@/business/care-plans/store'
import { useIncidentStore } from '@/business/incidents/store'
import { useMedicationStore } from '@/business/medication/store'
import { useResidentStore } from '@/business/residents/store'
import { useShiftStore } from '@/business/shifts/store'

export interface ReportStats {
	residents: {
		total: number
		active: number
	}
	medications: {
		total: number
		active: number
		completed: number
	}
	carePlans: {
		total: number
		active: number
		completed: number
	}
	incidents: {
		total: number
		reported: number
		resolved: number
		critical: number
	}
	shifts: {
		total: number
		scheduled: number
		completed: number
		inProgress: number
	}
}

export function useReports() {
	const residentStore = useResidentStore()
	const medicationStore = useMedicationStore()
	const { medications } = storeToRefs(medicationStore)
	const { fetchMedications } = medicationStore
	const carePlanStore = useCarePlanStore()
	const { carePlans } = storeToRefs(carePlanStore)
	const { fetchCarePlans } = carePlanStore
	const incidentStore = useIncidentStore()
	const { incidents } = storeToRefs(incidentStore)
	const { fetchIncidents } = incidentStore
	const shiftStore = useShiftStore()
	const { shifts } = storeToRefs(shiftStore)
	const { fetchShifts } = shiftStore

	const isLoading = ref(false)
	const dateRange = ref<{ start: Date; end: Date } | null>(null)

	const stats = computed<ReportStats>(() => {
		const residents = residentStore.residents

		const activeMedications = medications.value.filter(med => {
			const now = new Date()
			return med.startDate <= now && (!med.endDate || med.endDate >= now)
		})

		const activeCarePlans = carePlans.value.filter(cp => cp.status === 'active')

		const resolvedIncidents = incidents.value.filter(
			inc => inc.status === 'resolved' || inc.status === 'closed'
		)
		const criticalIncidents = incidents.value.filter(inc => inc.severity === 'critical')

		const completedShifts = shifts.value.filter(s => s.status === 'completed')
		const inProgressShifts = shifts.value.filter(s => s.status === 'in-progress')

		return {
			residents: {
				total: residents.length,
				active: residents.length, // Assuming all stored residents are active
			},
			medications: {
				total: medications.value.length,
				active: activeMedications.length,
				completed: medications.value.length - activeMedications.length,
			},
			carePlans: {
				total: carePlans.value.length,
				active: activeCarePlans.length,
				completed: carePlans.value.filter(cp => cp.status === 'completed').length,
			},
			incidents: {
				total: incidents.value.length,
				reported: incidents.value.filter(inc => inc.status === 'reported').length,
				resolved: resolvedIncidents.length,
				critical: criticalIncidents.length,
			},
			shifts: {
				total: shifts.value.length,
				scheduled: shifts.value.filter(s => s.status === 'scheduled').length,
				completed: completedShifts.length,
				inProgress: inProgressShifts.length,
			},
		}
	})

	const summaryCards = computed(() => {
		const s = stats.value
		return [
			{
				value: s.residents.total,
				label: 'Total Residentes',
				icon: '👥',
				variant: 'primary' as const,
			},
			{
				value: s.medications.active,
				label: 'Medicaciones Activas',
				icon: '💊',
				variant: 'primary' as const,
			},
			{
				value: s.carePlans.active,
				label: 'PAI Activos',
				icon: '📋',
				variant: 'success' as const,
			},
			{
				value: s.incidents.total,
				label: 'Total Incidencias',
				icon: '⚠️',
				variant: s.incidents.critical > 0 ? ('error' as const) : ('warning' as const),
			},
			{
				value: s.incidents.resolved,
				label: 'Incidencias Resueltas',
				icon: '✅',
				variant: 'success' as const,
			},
			{
				value: s.shifts.scheduled,
				label: 'Turnos Programados',
				icon: '📅',
				variant: 'primary' as const,
			},
		]
	})

	const incidentStats = computed(() => {
		const incs = incidents.value
		return {
			byType: {
				fall: incs.filter(i => i.type === 'fall').length,
				injury: incs.filter(i => i.type === 'injury').length,
				'medication-error': incs.filter(i => i.type === 'medication-error').length,
				behavioral: incs.filter(i => i.type === 'behavioral').length,
				medical: incs.filter(i => i.type === 'medical').length,
				other: incs.filter(i => i.type === 'other').length,
			},
			bySeverity: {
				low: incs.filter(i => i.severity === 'low').length,
				medium: incs.filter(i => i.severity === 'medium').length,
				high: incs.filter(i => i.severity === 'high').length,
				critical: incs.filter(i => i.severity === 'critical').length,
			},
		}
	})

	const loadReports = async (startDate?: Date, endDate?: Date) => {
		isLoading.value = true
		try {
			await Promise.all([
				residentStore.fetchResidents(),
				fetchMedications(),
				fetchCarePlans(),
				fetchIncidents(),
				startDate && endDate ? fetchShifts(undefined, startDate, endDate) : fetchShifts(),
			])

			if (startDate && endDate) {
				dateRange.value = { start: startDate, end: endDate }
			} else {
				dateRange.value = null
			}
		} finally {
			isLoading.value = false
		}
	}

	return {
		stats,
		summaryCards,
		incidentStats,
		isLoading: computed(() => isLoading.value),
		dateRange: computed(() => dateRange.value),
		loadReports,
	}
}
