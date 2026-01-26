<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Button } from '@design-system/atoms'
import { Tabs } from '@design-system/molecules'
import MedicationForm from '@/business/medication/presentation/components/MedicationForm.vue'
import MedicationList from '@/business/medication/presentation/components/MedicationList.vue'
import MedicationSchedule from '@/business/medication/presentation/components/MedicationSchedule.vue'
import { useMedicationStore } from '@/business/medication/store'

const route = useRoute()
const residentId = computed(() => route.params.id as string | undefined)

const medicationStore = useMedicationStore()
const { medications, administrations, isLoading, error } = storeToRefs(medicationStore)
const { fetchMedications, fetchAdministrationHistory, recordAdministration } = medicationStore

const showForm = ref(false)
const activeTab = ref('schedule')

const tabs = computed(() => [
	{ id: 'schedule', label: 'Horario', icon: '🕐' },
	{ id: 'list', label: 'Lista', icon: '💊' },
	{ id: 'history', label: 'Historial', icon: '📋' },
])

const handleCreateMedication = async () => {
	showForm.value = true
}

const handleFormSubmit = () => {
	showForm.value = false
	// Store se actualiza automáticamente, no necesita recarga
	if (residentId.value) {
		fetchAdministrationHistory(undefined, residentId.value)
	}
}

const handleAdminister = async (medication: unknown) => {
	if (!residentId.value) return
	const med = medication as { id: string }
	await recordAdministration(med.id, residentId.value, undefined)
	await fetchAdministrationHistory(undefined, residentId.value)
}

const handleTabChange = (tabId: string) => {
	activeTab.value = tabId
	if (tabId === 'history' && residentId.value) {
		fetchAdministrationHistory(undefined, residentId.value)
	}
}

onMounted(async () => {
	if (residentId.value) {
		await fetchMedications(residentId.value)
		await fetchAdministrationHistory(undefined, residentId.value)
	} else {
		await fetchMedications()
	}
})
</script>

<template>
	<div class="medication-page">
		<div class="medication-page__header">
			<h1 class="medication-page__title">Medicación</h1>
			<Button variant="primary" @click="handleCreateMedication">Nueva Medicación</Button>
		</div>

		<Tabs :tabs="tabs" :model-value="activeTab" @update:model-value="handleTabChange">
			<template v-if="activeTab === 'schedule'">
				<MedicationSchedule :medications="medications" :administrations="administrations"
					:on-administer="handleAdminister" />
			</template>

			<template v-else-if="activeTab === 'list'">
				<MedicationList :medications="medications" :is-loading="isLoading" :error="error?.message" />
			</template>

			<template v-else-if="activeTab === 'history'">
				<div class="medication-page__history">
					<h3>Historial de Administración</h3>
					<!-- History component can be added later -->
					<p>Historial de administraciones aparecerá aquí</p>
				</div>
			</template>
		</Tabs>

		<MedicationForm v-model="showForm" :resident-id="residentId" @submit="handleFormSubmit"
			@close="showForm = false" />
	</div>
</template>

<style scoped>
.medication-page {
	width: 100%;
	padding: var(--spacing-xl);
}

.medication-page__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--spacing-2xl);
	gap: var(--spacing-lg);
}

.medication-page__title {
	margin: 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.medication-page__history {
	padding: var(--spacing-xl);
}

.medication-page__history h3 {
	margin: 0 0 var(--spacing-lg) 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

@media (max-width: 768px) {
	.medication-page {
		padding: var(--spacing-lg);
	}

	.medication-page__header {
		flex-direction: column;
		align-items: stretch;
	}

	.medication-page__title {
		font-size: var(--font-size-xl);
	}
}
</style>
