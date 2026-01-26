<script setup lang="ts">
import { KPICard } from '@design-system/molecules'

defineOptions({
	name: 'DashboardStatCards',
})

interface Props {
	stats: Array<{
		value: string | number
		label: string
		icon?: string
		variant?: 'default' | 'alerts' | 'primary' | 'teal' | 'blue'
		chartType?: 'donut'
		chartValue?: number
		priority?: boolean
	}>
}

defineProps<Props>()

const emit = defineEmits<{
	'stat-click': [index: number]
}>()

const handleStatClick = (index: number) => {
	emit('stat-click', index)
}
</script>

<template>
	<div class="stat-cards">
		<KPICard v-for="(stat, index) in stats" :key="index" :value="stat.value" :label="stat.label" :icon="stat.icon"
			:variant="stat.variant || 'default'" :chart-type="stat.chartType" :chart-value="stat.chartValue"
			:priority="stat.priority" clickable @click="handleStatClick(index)" />
	</div>
</template>

<style scoped>
.stat-cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--spacing-md);
	margin-bottom: var(--spacing-2xl);
}

@media (min-width: 768px) {
	.stat-cards {
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-lg);
	}
}

@media (max-width: 480px) {
	.stat-cards {
		grid-template-columns: 1fr;
	}
}
</style>
