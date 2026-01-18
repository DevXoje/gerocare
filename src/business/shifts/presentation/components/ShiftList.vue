<script setup lang="ts">
import { Badge, Card, EmptyState, Skeleton } from '@/business/common/presentation/atoms'
import type { Shift } from '@/business/shifts/domain/Shift'
import { getStatusDisplayName, getTypeDisplayName } from '@/business/shifts/domain/Shift'

interface Props {
	shifts: Shift[]
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
	'shift-click': [shift: Shift]
}>()

const getStatusVariant = (
	status: Shift['status']
): 'default' | 'primary' | 'success' | 'warning' => {
	const map: Record<Shift['status'], 'default' | 'primary' | 'success' | 'warning'> = {
		scheduled: 'primary',
		'in-progress': 'warning',
		completed: 'success',
		cancelled: 'default',
	}
	return map[status]
}

const handleClick = (shift: Shift) => {
	if (props.clickable) {
		emit('shift-click', shift)
	}
}
</script>

<template>
	<div class="shift-list">
		<div v-if="isLoading" class="shift-list__skeleton">
			<Skeleton v-for="i in 3" :key="i" variant="rectangular" height="120px" />
		</div>

		<EmptyState v-else-if="!error && shifts.length === 0" title="No hay turnos"
			description="No se encontraron turnos programados." icon="📅" />

		<div v-else-if="error" class="shift-list__error">{{ error }}</div>

		<div v-else class="shift-list__items">
			<Card v-for="shift in shifts" :key="shift.id" variant="elevated" padding="lg" :clickable="clickable"
				class="shift-list__item" @click="handleClick(shift)">
				<div class="shift-item">
					<div class="shift-item__header">
						<h3 class="shift-item__title">{{ getTypeDisplayName(shift.type) }}</h3>
						<Badge :variant="getStatusVariant(shift.status)" size="sm">
							{{ getStatusDisplayName(shift.status) }}
						</Badge>
					</div>

					<div class="shift-item__meta">
						<span class="shift-item__date">{{ shift.date.toLocaleDateString() }}</span>
						<span class="shift-item__time">{{ shift.startTime }} - {{ shift.endTime }}</span>
					</div>

					<p v-if="shift.notes" class="shift-item__notes">{{ shift.notes }}</p>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.shift-list {
	width: 100%;
}

.shift-list__skeleton {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.shift-list__error {
	padding: var(--spacing-xl);
	color: var(--color-border-error);
	text-align: center;
	font-size: var(--font-size-sm);
}

.shift-list__items {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.shift-list__item {
	transition: transform var(--transition-base);
}

.shift-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.shift-item__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-md);
}

.shift-item__title {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	flex: 1;
}

.shift-item__meta {
	display: flex;
	gap: var(--spacing-lg);
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.shift-item__date {
	font-weight: var(--font-weight-medium);
}

.shift-item__time {
	font-weight: var(--font-weight-medium);
}

.shift-item__notes {
	margin: 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-primary);
	line-height: var(--line-height-relaxed);
}
</style>
