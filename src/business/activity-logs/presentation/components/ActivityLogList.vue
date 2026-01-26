<script setup lang="ts">
import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import {
	getActivityTypeDisplayName,
	getStatusDisplayName,
} from '@/business/activity-logs/domain/ActivityLog'
import { Badge, Card, EmptyState, Skeleton } from '@design-system/atoms'

interface Props {
	activityLogs: ActivityLog[]
	isLoading?: boolean
	error?: string | null
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	isLoading: false,
	error: null,
	clickable: false,
})

const emit = defineEmits<{
	'activity-log-click': [activityLog: ActivityLog]
}>()

const getStatusVariant = (status: ActivityLog['status']): 'default' | 'success' | 'warning' => {
	const map: Record<ActivityLog['status'], 'default' | 'success' | 'warning'> = {
		completed: 'success',
		partial: 'warning',
		skipped: 'default',
	}
	return map[status]
}

const formatDuration = (minutes?: number): string => {
	if (!minutes) return ''
	if (minutes < 60) return `${minutes} min`
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

const handleClick = (activityLog: ActivityLog) => {
	if (props.clickable) {
		emit('activity-log-click', activityLog)
	}
}
</script>

<template>
	<div class="activity-log-list">
		<div v-if="isLoading" class="activity-log-list__skeleton">
			<Skeleton v-for="i in 3" :key="i" variant="rectangular" height="150px" />
		</div>

		<EmptyState v-else-if="!error && activityLogs.length === 0" title="No hay actividades registradas"
			description="No se encontraron actividades registradas." icon="📝" />

		<div v-else-if="error" class="activity-log-list__error">{{ error }}</div>

		<div v-else class="activity-log-list__items">
			<Card v-for="activityLog in activityLogs" :key="activityLog.id" variant="elevated" padding="lg"
				:clickable="clickable" class="activity-log-list__item" @click="handleClick(activityLog)">
				<div class="activity-log-item">
					<div class="activity-log-item__header">
						<h3 class="activity-log-item__title">{{ activityLog.title }}</h3>
						<div class="activity-log-item__badges">
							<Badge :variant="getStatusVariant(activityLog.status)" size="sm">
								{{ getStatusDisplayName(activityLog.status) }}
							</Badge>
							<Badge variant="default" size="sm">
								{{ getActivityTypeDisplayName(activityLog.activityType) }}
							</Badge>
						</div>
					</div>

					<div class="activity-log-item__meta">
						<span class="activity-log-item__date">
							{{ activityLog.timestamp.toLocaleDateString() }} -
							{{ activityLog.timestamp.toLocaleTimeString() }}
						</span>
						<span v-if="activityLog.duration" class="activity-log-item__duration">
							⏱️ {{ formatDuration(activityLog.duration) }}
						</span>
					</div>

					<p class="activity-log-item__description">{{ activityLog.description }}</p>

					<div v-if="activityLog.notes" class="activity-log-item__notes">
						<strong>Notas:</strong> {{ activityLog.notes }}
					</div>

					<div v-if="activityLog.photos && activityLog.photos.length > 0" class="activity-log-item__photos">
						<strong>Fotos:</strong> {{ activityLog.photos.length }} foto(s)
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.activity-log-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.activity-log-list__skeleton {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.activity-log-list__error {
	padding: var(--spacing-lg);
	color: var(--color-error);
	text-align: center;
}

.activity-log-list__items {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.activity-log-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
}

.activity-log-item__header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: var(--spacing-md);
	flex-wrap: wrap;
}

.activity-log-item__title {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	flex: 1;
	min-width: 0;
}

.activity-log-item__badges {
	display: flex;
	gap: var(--spacing-xs);
	flex-wrap: wrap;
}

.activity-log-item__meta {
	display: flex;
	gap: var(--spacing-md);
	align-items: center;
	flex-wrap: wrap;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.activity-log-item__description {
	margin: 0;
	color: var(--color-text-primary);
	line-height: 1.5;
}

.activity-log-item__notes {
	padding: var(--spacing-sm);
	background: var(--color-background-secondary);
	border-radius: var(--border-radius-sm);
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.activity-log-item__photos {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}
</style>
