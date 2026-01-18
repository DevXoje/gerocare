<script setup lang="ts">
import { computed } from 'vue'

import { Card } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'AppStatCard',
})

interface Props {
	value: string | number
	label: string
	icon?: string
	trend?: 'up' | 'down' | 'neutral'
	trendValue?: string
	variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	icon: undefined,
	trend: undefined,
	trendValue: undefined,
	variant: 'default',
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const statCardClasses = computed(() => ({
	'stat-card': true,
	[`stat-card--${props.variant}`]: true,
}))

const trendClasses = computed(() => {
	if (!props.trend) return ''
	return {
		'stat-card__trend': true,
		[`stat-card__trend--${props.trend}`]: true,
	}
})

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}
</script>

<template>
	<Card :clickable="clickable" variant="elevated" padding="lg" @click="handleClick">
		<div :class="statCardClasses">
			<div v-if="icon" class="stat-card__icon">{{ icon }}</div>
			<div class="stat-card__content">
				<div class="stat-card__value">{{ value }}</div>
				<div class="stat-card__label">{{ label }}</div>
				<div v-if="trend && trendValue" :class="trendClasses">
					<span v-if="trend === 'up'">↗</span>
					<span v-else-if="trend === 'down'">↘</span>
					<span v-else>→</span>
					{{ trendValue }}
				</div>
			</div>
		</div>
	</Card>
</template>

<style scoped>
.stat-card {
	display: flex;
	align-items: flex-start;
	gap: var(--spacing-md);
}

.stat-card__icon {
	font-size: var(--font-size-2xl);
	flex-shrink: 0;
}

.stat-card__content {
	flex: 1;
	min-width: 0;
}

.stat-card__value {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	line-height: var(--line-height-tight);
	margin-bottom: var(--spacing-xs);
}

.stat-card--primary .stat-card__value {
	color: var(--token-color-primary-600);
}

.stat-card--success .stat-card__value {
	color: var(--token-color-success-600);
}

.stat-card--warning .stat-card__value {
	color: var(--token-color-warning-600);
}

.stat-card--error .stat-card__value {
	color: var(--token-color-error-600);
}

.stat-card__label {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	font-weight: var(--font-weight-medium);
	margin-bottom: var(--spacing-xs);
}

.stat-card__trend {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	margin-top: var(--spacing-xs);
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.stat-card__trend--up {
	color: var(--token-color-success-600);
}

.stat-card__trend--down {
	color: var(--token-color-error-600);
}

.stat-card__trend--neutral {
	color: var(--color-text-secondary);
}
</style>
