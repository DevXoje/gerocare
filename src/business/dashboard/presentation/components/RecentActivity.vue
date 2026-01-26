<script setup lang="ts">
import { computed } from 'vue'

import { Card } from '@design-system/atoms'

defineOptions({
	name: 'DashboardRecentActivity',
})

interface Activity {
	id: string
	type: string
	description: string
	timestamp: Date
	icon?: string
}

interface Props {
	activities: Activity[]
	maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
	maxItems: 5,
})

const formatTime = (date: Date): string => {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	if (diffMins < 1) return 'Hace un momento'
	if (diffMins < 60) return `Hace ${diffMins} min`
	if (diffHours < 24) return `Hace ${diffHours} h`
	if (diffDays < 7) return `Hace ${diffDays} días`
	return date.toLocaleDateString()
}

const displayedActivities = computed(() => {
	return props.activities.slice(0, props.maxItems)
})
</script>

<template>
	<Card variant="elevated" padding="lg">
		<div class="recent-activity">
			<h3 class="recent-activity__title">Actividad Reciente</h3>
			<div v-if="displayedActivities.length > 0" class="recent-activity__list">
				<div v-for="activity in displayedActivities" :key="activity.id" class="recent-activity__item">
					<span v-if="activity.icon" class="recent-activity__icon">{{ activity.icon }}</span>
					<div class="recent-activity__content">
						<p class="recent-activity__description">{{ activity.description }}</p>
						<span class="recent-activity__time">{{ formatTime(activity.timestamp) }}</span>
					</div>
				</div>
			</div>
			<div v-else class="recent-activity__empty">No hay actividad reciente</div>
		</div>
	</Card>
</template>

<style scoped>
.recent-activity__title {
	margin: 0 0 var(--spacing-xl) 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.recent-activity__list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.recent-activity__item {
	display: flex;
	align-items: flex-start;
	gap: var(--spacing-md);
}

.recent-activity__icon {
	font-size: var(--font-size-xl);
	flex-shrink: 0;
}

.recent-activity__content {
	flex: 1;
	min-width: 0;
}

.recent-activity__description {
	margin: 0 0 var(--spacing-xs) 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-primary);
}

.recent-activity__time {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.recent-activity__empty {
	text-align: center;
	padding: var(--spacing-xl);
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}
</style>
