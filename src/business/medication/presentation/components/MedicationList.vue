<script setup lang="ts">
import { Badge, Card, EmptyState, Skeleton } from '@/business/common/presentation/atoms'
import type { Medication } from '@/business/medication/domain/Medication'
import { isMedicationActive } from '@/business/medication/domain/Medication'

interface Props {
	medications: Medication[]
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
	'medication-click': [medication: Medication]
}>()

const handleClick = (medication: Medication) => {
	if (props.clickable) {
		emit('medication-click', medication)
	}
}
</script>

<template>
	<div class="medication-list">
		<div v-if="isLoading" class="medication-list__skeleton">
			<Skeleton v-for="i in 3" :key="i" variant="rectangular" height="120px" />
		</div>

		<EmptyState v-else-if="!error && medications.length === 0" title="No hay medicaciones"
			description="No se encontraron medicaciones para este residente." icon="💊" />

		<div v-else-if="error" class="medication-list__error">{{ error }}</div>

		<div v-else class="medication-list__items">
			<Card v-for="medication in medications" :key="medication.id" variant="elevated" padding="lg"
				:clickable="clickable" class="medication-list__item" @click="handleClick(medication)">
				<div class="medication-item">
					<div class="medication-item__header">
						<h3 class="medication-item__name">{{ medication.name }}</h3>
						<Badge :variant="isMedicationActive(medication) ? 'success' : 'default'">
							{{ isMedicationActive(medication) ? 'Activa' : 'Inactiva' }}
						</Badge>
					</div>

					<div class="medication-item__details">
						<div class="medication-item__detail">
							<span class="medication-item__label">Dosis:</span>
							<span class="medication-item__value">{{ medication.dosage }}</span>
						</div>
						<div class="medication-item__detail">
							<span class="medication-item__label">Frecuencia:</span>
							<span class="medication-item__value">{{ medication.frequency }}</span>
						</div>
						<div v-if="medication.instructions" class="medication-item__instructions">
							{{ medication.instructions }}
						</div>
					</div>

					<div v-if="medication.endDate" class="medication-item__dates">
						<span class="medication-item__date">
							Desde: {{ medication.startDate.toLocaleDateString() }}
						</span>
						<span class="medication-item__date">
							Hasta: {{ medication.endDate.toLocaleDateString() }}
						</span>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.medication-list {
	width: 100%;
}

.medication-list__skeleton {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.medication-list__error {
	padding: var(--spacing-xl);
	color: var(--color-border-error);
	text-align: center;
	font-size: var(--font-size-sm);
}

.medication-list__items {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.medication-list__item {
	transition: transform var(--transition-base);
}

.medication-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.medication-item__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-md);
}

.medication-item__name {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	flex: 1;
}

.medication-item__details {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
}

.medication-item__detail {
	display: flex;
	gap: var(--spacing-sm);
	font-size: var(--font-size-sm);
}

.medication-item__label {
	color: var(--color-text-secondary);
	font-weight: var(--font-weight-medium);
}

.medication-item__value {
	color: var(--color-text-primary);
}

.medication-item__instructions {
	margin-top: var(--spacing-xs);
	padding: var(--spacing-sm);
	background-color: var(--color-bg-secondary);
	border-radius: var(--radius-md);
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.medication-item__dates {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	margin-top: var(--spacing-xs);
	padding-top: var(--spacing-md);
	border-top: 1px solid var(--color-border-default);
}

.medication-item__date {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}
</style>
