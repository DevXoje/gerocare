<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Button, Card } from '@/business/common/presentation/atoms'
import { Tabs } from '@/business/common/presentation/molecules'
import { useIncidentForm } from '@/business/incidents/app/useIncidentForm'
import IncidentForm from '@/business/incidents/presentation/components/IncidentForm.vue'
import IncidentList from '@/business/incidents/presentation/components/IncidentList.vue'
import { useIncidentStore } from '@/business/incidents/store'

const route = useRoute()
const residentId = computed(() => (route.params.residentId as string) || undefined)

const incidentStore = useIncidentStore()
const { incidents, isLoading, error } = storeToRefs(incidentStore)
const { fetchIncidents } = incidentStore
const { resetForm } = useIncidentForm()

const showForm = ref(false)
const activeTab = ref('all')

const unresolvedIncidents = computed(() => {
	return incidents.value.filter(i => i.status === 'reported' || i.status === 'in-progress')
})

const displayedIncidents = computed(() => {
	if (activeTab.value === 'unresolved') {
		return unresolvedIncidents.value
	}
	return incidents.value
})

const tabs = [
	{ id: 'all', label: 'Todas', count: incidents.value.length },
	{ id: 'unresolved', label: 'Pendientes', count: unresolvedIncidents.value.length },
]

onMounted(async () => {
	await fetchIncidents(residentId.value)
})

const handleCreateClick = () => {
	resetForm()
	if (residentId.value) {
		resetForm()
	}
	showForm.value = true
}

const handleFormSubmit = () => {
	// Store se actualiza automáticamente, no necesita recarga
}

const handleTabChange = (tabId: string) => {
	activeTab.value = tabId
}
</script>

<template>
	<div class="incidents-page">
		<div class="incidents-page__header">
			<div>
				<h1 class="incidents-page__title">Registro de Incidencias</h1>
				<p v-if="residentId" class="incidents-page__subtitle">Residente ID: {{ residentId }}</p>
			</div>
			<Button variant="primary" @click="handleCreateClick">Registrar Incidencia</Button>
		</div>

		<Card variant="elevated" padding="md" class="incidents-page__content">
			<Tabs :model-value="activeTab" :tabs="tabs" @change="handleTabChange" />

			<div class="incidents-page__list">
				<IncidentList :incidents="displayedIncidents" :is-loading="isLoading" :error="error?.message || null"
					clickable />
			</div>
		</Card>

		<IncidentForm v-model="showForm" :resident-id="residentId" @submit="handleFormSubmit"
			@close="showForm = false" />
	</div>
</template>

<style scoped>
.incidents-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
	padding: var(--spacing-xl);
	max-width: 1400px;
	margin: 0 auto;
}

.incidents-page__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-lg);
}

.incidents-page__title {
	margin: 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
}

.incidents-page__subtitle {
	margin: var(--spacing-xs) 0 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.incidents-page__content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}

.incidents-page__list {
	margin-top: var(--spacing-lg);
}
</style>
