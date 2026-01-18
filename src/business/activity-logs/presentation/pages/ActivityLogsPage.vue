<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useActivityLogForm } from '@/business/activity-logs/app/useActivityLogForm'
import ActivityLogForm from '@/business/activity-logs/presentation/components/ActivityLogForm.vue'
import ActivityLogList from '@/business/activity-logs/presentation/components/ActivityLogList.vue'
import { useActivityLogStore } from '@/business/activity-logs/store'
import Button from '@/business/common/presentation/atoms/Button.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import Tabs from '@/business/common/presentation/molecules/Tabs.vue'

const route = useRoute()
const residentId = computed(() => (route.params.residentId as string) || undefined)

const activityLogStore = useActivityLogStore()
const { activityLogs, isLoading, error } = storeToRefs(activityLogStore)
const { fetchActivityLogs } = activityLogStore
const { resetForm } = useActivityLogForm()

const showForm = ref(false)
const activeTab = ref('all')

const completedLogs = computed(() => {
	return activityLogs.value.filter(log => log.status === 'completed')
})

const displayedLogs = computed(() => {
	if (activeTab.value === 'completed') {
		return completedLogs.value
	}
	return activityLogs.value
})

const tabs = computed(() => [
	{ id: 'all', label: 'Todas', count: activityLogs.value.length },
	{ id: 'completed', label: 'Completadas', count: completedLogs.value.length },
])

onMounted(async () => {
	await fetchActivityLogs(residentId.value)
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
	<div class="activity-logs-page">
		<div class="activity-logs-page__header">
			<div>
				<h1 class="activity-logs-page__title">Registro de Actividades</h1>
				<p v-if="residentId" class="activity-logs-page__subtitle">Residente ID: {{ residentId }}</p>
			</div>
			<Button variant="primary" @click="handleCreateClick">Registrar Actividad</Button>
		</div>

		<Card variant="elevated" padding="md" class="activity-logs-page__content">
			<Tabs :model-value="activeTab" :tabs="tabs" @change="handleTabChange" />

			<div class="activity-logs-page__list">
				<ActivityLogList
					:activity-logs="displayedLogs"
					:is-loading="isLoading"
					:error="error?.message || null"
					clickable
				/>
			</div>
		</Card>

		<ActivityLogForm
			v-model="showForm"
			:resident-id="residentId"
			@submit="handleFormSubmit"
			@close="showForm = false"
		/>
	</div>
</template>

<style scoped>
.activity-logs-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
	padding: var(--spacing-xl);
	max-width: 1400px;
	margin: 0 auto;
}

.activity-logs-page__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-lg);
}

.activity-logs-page__title {
	margin: 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
}

.activity-logs-page__subtitle {
	margin: var(--spacing-xs) 0 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.activity-logs-page__content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}

.activity-logs-page__list {
	margin-top: var(--spacing-lg);
}
</style>
