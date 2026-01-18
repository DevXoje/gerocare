<script setup lang="ts">
import StatCard from '@/business/common/presentation/molecules/StatCard.vue'

defineOptions({
	name: 'DashboardStatCards',
})

interface Props {
	stats: Array<{
		value: string | number
		label: string
		icon?: string
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
		trend?: 'up' | 'down' | 'neutral'
		trendValue?: string
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
		<StatCard
			v-for="(stat, index) in stats"
			:key="index"
			:value="stat.value"
			:label="stat.label"
			:icon="stat.icon"
			:variant="stat.variant || 'default'"
			:trend="stat.trend"
			:trend-value="stat.trendValue"
			clickable
			@click="handleStatClick(index)"
		/>
	</div>
</template>

<style scoped>
.stat-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-2xl);
}

@media (max-width: 768px) {
	.stat-cards {
		grid-template-columns: 1fr;
	}
}
</style>
