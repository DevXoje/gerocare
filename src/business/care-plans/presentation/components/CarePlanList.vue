<script setup lang="ts">
import type { CarePlan } from '@/business/care-plans/domain/CarePlan'
import { getCategoryDisplayName } from '@/business/care-plans/domain/CarePlan'
import { Badge, Card, EmptyState, Skeleton } from '@design-system/atoms'

interface Props {
	carePlans: CarePlan[]
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
	'care-plan-click': [carePlan: CarePlan]
}>()

const getPriorityVariant = (
	priority: CarePlan['priority']
): 'default' | 'primary' | 'warning' | 'error' => {
	const map: Record<CarePlan['priority'], 'default' | 'primary' | 'warning' | 'error'> = {
		low: 'default',
		medium: 'primary',
		high: 'warning',
		urgent: 'error',
	}
	return map[priority]
}

const getStatusVariant = (
	status: CarePlan['status']
): 'default' | 'primary' | 'success' | 'warning' => {
	const map: Record<CarePlan['status'], 'default' | 'primary' | 'success' | 'warning'> = {
		active: 'success',
		paused: 'warning',
		completed: 'default',
		cancelled: 'default',
	}
	return map[status]
}

const handleClick = (carePlan: CarePlan) => {
	if (props.clickable) {
		emit('care-plan-click', carePlan)
	}
}
</script>

<template>
	<div class="care-plan-list">
		<div v-if="isLoading" class="care-plan-list__skeleton">
			<Skeleton v-for="i in 3" :key="i" variant="rectangular" height="150px" />
		</div>

		<EmptyState v-else-if="!error && carePlans.length === 0" title="No hay planes de atención"
			description="No se encontraron planes de atención individual (PAI) para este residente." icon="📋" />

		<div v-else-if="error" class="care-plan-list__error">{{ error }}</div>

		<div v-else class="care-plan-list__items">
			<Card v-for="carePlan in carePlans" :key="carePlan.id" variant="elevated" padding="lg"
				:clickable="clickable" class="care-plan-list__item" @click="handleClick(carePlan)">
				<div class="care-plan-item">
					<div class="care-plan-item__header">
						<h3 class="care-plan-item__title">{{ carePlan.title }}</h3>
						<div class="care-plan-item__badges">
							<Badge :variant="getStatusVariant(carePlan.status)" size="sm">
								{{ carePlan.status === 'active' ? 'Activo' : carePlan.status }}
							</Badge>
							<Badge :variant="getPriorityVariant(carePlan.priority)" size="sm">
								{{ carePlan.priority }}
							</Badge>
						</div>
					</div>

					<div class="care-plan-item__meta">
						<span class="care-plan-item__category">{{
							getCategoryDisplayName(carePlan.category)
						}}</span>
						<span class="care-plan-item__frequency">{{ carePlan.frequency }}</span>
					</div>

					<p class="care-plan-item__description">{{ carePlan.description }}</p>

					<div v-if="carePlan.endDate" class="care-plan-item__dates">
						<span class="care-plan-item__date">
							Desde: {{ carePlan.startDate.toLocaleDateString() }}
						</span>
						<span class="care-plan-item__date">
							Hasta: {{ carePlan.endDate.toLocaleDateString() }}
						</span>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.care-plan-list {
	width: 100%;
}

.care-plan-list__skeleton {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.care-plan-list__error {
	padding: var(--spacing-xl);
	color: var(--color-border-error);
	text-align: center;
	font-size: var(--font-size-sm);
}

.care-plan-list__items {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.care-plan-list__item {
	transition: transform var(--transition-base);
}

.care-plan-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.care-plan-item__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-md);
}

.care-plan-item__title {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	flex: 1;
}

.care-plan-item__badges {
	display: flex;
	gap: var(--spacing-xs);
	flex-shrink: 0;
}

.care-plan-item__meta {
	display: flex;
	gap: var(--spacing-md);
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.care-plan-item__category {
	font-weight: var(--font-weight-medium);
}

.care-plan-item__description {
	margin: 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-primary);
	line-height: var(--line-height-relaxed);
}

.care-plan-item__dates {
	display: flex;
	gap: var(--spacing-lg);
	margin-top: var(--spacing-xs);
	padding-top: var(--spacing-md);
	border-top: 1px solid var(--color-border-default);
}

.care-plan-item__date {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}
</style>
