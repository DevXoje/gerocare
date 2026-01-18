import { computed, onMounted, ref } from 'vue'

import {
	formatRelativeTime,
	formatTime,
} from '@/business/dashboard/app/helpers/formatDashboardData'
import { getTypeDisplayName } from '@/business/incidents/domain/Incident'
import { useIncidentStore } from '@/business/incidents/store'
import { useResidentStore } from '@/business/residents/store'
import { getShiftStartDateTime } from '@/business/shifts/domain/Shift'
import { useShiftStore } from '@/business/shifts/store'

export function useDashboard() {
	const residentStore = useResidentStore()
	const incidentStore = useIncidentStore()
	const shiftStore = useShiftStore()

	const isLoading = ref(false)

	// Map incident type to icon
	const getIncidentIcon = (type: string): string => {
		const iconMap: Record<string, string> = {
			fall: 'personal_injury',
			injury: 'medical_services',
			'medication-error': 'medication',
			behavioral: 'psychology',
			medical: 'emergency',
			other: 'report_problem',
		}
		return iconMap[type] || 'report_problem'
	}

	const stats = computed(() => {
		const residents = residentStore.residents
		const totalResidents = residents.length
		const occupancyRate = totalResidents > 0 ? Math.round((totalResidents / 140) * 100) : 0

		// Calculate active alerts: unresolved incidents with high or critical severity
		const activeAlerts = incidentStore.incidents.filter(
			incident =>
				(incident.status === 'reported' || incident.status === 'in-progress') &&
				(incident.severity === 'high' || incident.severity === 'critical')
		).length

		// Get next shift
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const upcomingShifts = shiftStore.shifts
			.filter(
				shift =>
					shift.status === 'scheduled' && getShiftStartDateTime(shift).getTime() >= today.getTime()
			)
			.sort((a, b) => {
				const dateA = getShiftStartDateTime(a)
				const dateB = getShiftStartDateTime(b)
				return dateA.getTime() - dateB.getTime()
			})

		const nextShift = upcomingShifts.length > 0 ? upcomingShifts[0] : null
		const nextShiftValue = nextShift ? formatTime(nextShift.startTime) : 'No upcoming shifts'

		return [
			{
				value: activeAlerts,
				label: 'Active Alerts',
				icon: 'warning',
				variant: 'alerts' as const,
				priority: true,
			},
			{
				value: totalResidents,
				label: 'Total Residents',
				icon: 'groups',
				variant: 'primary' as const,
			},
			{
				value: `${occupancyRate}%`,
				label: 'Occupancy',
				icon: 'bed',
				variant: 'teal' as const,
				chartType: 'donut' as const,
				chartValue: occupancyRate,
			},
			{
				value: nextShiftValue,
				label: 'Next Shift',
				icon: 'calendar_clock',
				variant: 'blue' as const,
			},
		]
	})

	const recentActivities = computed(() => {
		return []
	})

	// Staff on duty: empty for now as there's no tracking system
	const staffOnDuty = computed<
		Array<{
			name: string
			avatar?: string
			status: 'online' | 'away' | 'offline'
			highlighted: boolean
		}>
	>(() => [])

	const recentIncidents = computed(() => {
		const incidents = incidentStore.incidents
		const residents = residentStore.residents

		// Get resident by ID helper
		const getResidentById = (id: string) => {
			return residents.find(r => r.id === id)
		}

		// Sort by incidentDate descending and take first 5
		const sortedIncidents = [...incidents]
			.sort((a, b) => b.incidentDate.getTime() - a.incidentDate.getTime())
			.slice(0, 5)

		return sortedIncidents.map(incident => {
			const resident = getResidentById(incident.residentId)
			const residentName = resident
				? `${resident.firstName} ${resident.lastName}`
				: 'Unknown Resident'

			// Map severity to match IncidentCard expected values (high/medium/low)
			const severity =
				incident.severity === 'critical'
					? ('high' as const)
					: incident.severity === 'high' ||
						  incident.severity === 'medium' ||
						  incident.severity === 'low'
						? (incident.severity as 'high' | 'medium' | 'low')
						: ('low' as const)

			return {
				title: getTypeDisplayName(incident.type),
				resident: residentName,
				room: incident.location || 'Unknown',
				time: formatRelativeTime(incident.incidentDate),
				severity,
				icon: getIncidentIcon(incident.type),
			}
		})
	})

	const quickActions = computed(() => [
		{
			label: 'Nuevo Residente',
			icon: '➕',
			to: '/residents',
			variant: 'primary' as const,
		},
		{
			label: 'Ver Residentes',
			icon: '👥',
			to: '/residents',
			variant: 'secondary' as const,
		},
	])

	const loadDashboard = async () => {
		isLoading.value = true
		try {
			await Promise.all([
				residentStore.fetchResidents(),
				incidentStore.fetchIncidents(),
				shiftStore.fetchShifts(),
			])
		} finally {
			isLoading.value = false
		}
	}

	onMounted(() => {
		loadDashboard()
	})

	return {
		stats,
		recentActivities,
		quickActions,
		staffOnDuty,
		recentIncidents,
		isLoading,
		loadDashboard,
	}
}
