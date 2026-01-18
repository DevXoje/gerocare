import { computed, onMounted,ref } from 'vue'

import { useResidentStore } from '@/business/residents/store'

export function useDashboard() {
  const residentStore = useResidentStore()

  const isLoading = ref(false)

  const stats = computed(() => {
    const residents = residentStore.residents
    return [
      {
        value: residents.length,
        label: 'Residentes Activos',
        icon: '👥',
        variant: 'primary' as const,
      },
      {
        value: 0,
        label: 'Incidencias Hoy',
        icon: '⚠️',
        variant: 'warning' as const,
      },
      {
        value: 0,
        label: 'Medicaciones Pendientes',
        icon: '💊',
        variant: 'error' as const,
      },
      {
        value: 0,
        label: 'Actividades Completadas',
        icon: '✅',
        variant: 'success' as const,
      },
    ]
  })

  const recentActivities = computed(() => {
    return []
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
      await residentStore.fetchResidents()
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
    isLoading,
    loadDashboard,
  }
}
