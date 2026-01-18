<script setup lang="ts">
import { computed } from 'vue'

import { Card } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'AppKPICard',
})

interface Props {
	value: string | number
	label: string
	icon?: string
	variant?: 'default' | 'alerts' | 'primary' | 'teal' | 'blue'
	chartType?: 'donut'
	chartValue?: number
	priority?: boolean
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	icon: undefined,
	variant: 'default',
	chartType: undefined,
	chartValue: undefined,
	priority: false,
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const kpiCardClasses = computed(() => ({
	'kpi-card': true,
	[`kpi-card--${props.variant}`]: true,
	'kpi-card--priority': props.priority,
}))

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}

// Calculate donut chart stroke-dasharray
// Circumference = 2 * π * radius = 2 * π * 15.9155 ≈ 100
const donutStrokeDasharray = computed(() => {
	if (props.chartType === 'donut' && props.chartValue !== undefined) {
		const percentage = Math.min(Math.max(props.chartValue, 0), 100)
		const circumference = 100 // Approximate circumference of the circle
		const dashLength = (percentage / 100) * circumference
		return `${dashLength}, ${circumference}`
	}
	return undefined
})
</script>

<template>
	<Card :clickable="clickable" variant="elevated" padding="lg" :class="kpiCardClasses" @click="handleClick">
		<div class="kpi-card__wrapper">
			<!-- Decorative background circle for alerts variant -->
			<div v-if="variant === 'alerts'" class="kpi-card__decoration"></div>

			<!-- Header with icon and priority indicator -->
			<div class="kpi-card__header">
				<div v-if="icon" class="kpi-card__icon-wrapper">
					<span class="kpi-card__icon material-symbols-outlined">{{ icon }}</span>
				</div>
				<span v-if="priority" class="kpi-card__priority-indicator"></span>
			</div>

			<!-- Content with value and label -->
			<div class="kpi-card__content">
				<div class="kpi-card__value-wrapper">
					<p class="kpi-card__value">{{ value }}</p>
					<!-- Donut chart for occupancy variant -->
					<div v-if="chartType === 'donut' && chartValue !== undefined" class="kpi-card__chart">
						<svg class="kpi-card__chart-svg" viewBox="0 0 36 36">
							<path class="kpi-card__chart-bg"
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none" stroke="currentColor" stroke-width="4" />
							<path class="kpi-card__chart-value"
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none" stroke="currentColor" :stroke-dasharray="donutStrokeDasharray"
								stroke-linecap="round" stroke-width="4" />
						</svg>
					</div>
				</div>
				<p class="kpi-card__label">{{ label }}</p>
			</div>
		</div>
	</Card>
</template>

<style scoped>
.kpi-card {
	position: relative;
	overflow: hidden;
	min-height: 140px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	transition:
		transform var(--transition-base),
		box-shadow var(--transition-base);
}

.kpi-card__wrapper {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
}

.kpi-card__decoration {
	position: absolute;
	right: -1rem;
	top: -1rem;
	width: 6rem;
	height: 6rem;
	border-radius: 50%;
	background-color: var(--color-message-error-bg);
	opacity: 0.5;
	transition: transform var(--transition-slow);
}

.kpi-card:hover .kpi-card__decoration {
	transform: scale(1.1);
}

.kpi-card__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: var(--spacing-md);
}

.kpi-card__icon-wrapper {
	padding: var(--spacing-sm);
	border-radius: var(--radius-md);
	background-color: var(--color-bg-primary);
	box-shadow: var(--shadow-sm);
	display: flex;
	align-items: center;
	justify-content: center;
}

.kpi-card__icon {
	font-size: var(--font-size-xl);
	line-height: 1;
}

.kpi-card__priority-indicator {
	display: flex;
	width: 0.5rem;
	height: 0.5rem;
	border-radius: 50%;
	background-color: var(--color-border-error);
	flex-shrink: 0;
}

.kpi-card__content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.kpi-card__value-wrapper {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-bottom: var(--spacing-xs);
	gap: var(--spacing-md);
}

.kpi-card__value {
	font-size: 1.875rem;
	/* 30px - 3xl equivalent */
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	line-height: var(--line-height-tight);
	margin: 0;
}

.kpi-card__label {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-secondary);
	margin: 0;
}

/* Variant styles */
.kpi-card--default {
	background-color: var(--color-bg-primary);
}

.kpi-card--default .kpi-card__icon {
	color: var(--color-text-link);
}

.kpi-card--alerts {
	background-color: var(--color-message-error-bg);
	border: 1px solid var(--color-border-error);
}

.kpi-card--alerts .kpi-card__icon {
	color: var(--color-message-error-text);
}

.kpi-card--alerts .kpi-card__label {
	color: var(--color-message-error-text);
}

.kpi-card--primary {
	background-color: var(--color-bg-primary);
}

.kpi-card--primary .kpi-card__icon {
	color: var(--color-text-link);
}

.kpi-card--teal {
	background-color: var(--color-bg-primary);
}

.kpi-card--teal .kpi-card__icon {
	color: var(--color-message-info-text);
}

.kpi-card--teal .kpi-card__chart-value {
	color: var(--color-message-info-text);
}

.kpi-card--teal .kpi-card__chart-bg {
	color: var(--token-color-neutral-200);
}

.kpi-card--blue {
	background: var(--color-button-primary-bg);
	color: var(--color-text-inverse);
	position: relative;
}

.kpi-card--blue::before {
	content: '';
	position: absolute;
	inset: 0;
	background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-2H0v2h20v2H0v2h20v2H0v2h20v2H0v2h20v2H0v2h22V20h-2v20h-2V20h-2v20h-2V20h-2v20h-2V20h-2v20H0v-2h20v-2H0v-2h20v-2H0v-2h20z'/%3E%3C/g%3E%3C/svg%3E");
	opacity: 0.1;
	pointer-events: none;
}

.kpi-card--blue .kpi-card__value,
.kpi-card--blue .kpi-card__label {
	color: var(--color-text-inverse);
}

.kpi-card--blue .kpi-card__label {
	color: rgba(255, 255, 255, 0.9);
	/* Improved contrast for WCAG AA compliance */
}

.kpi-card--blue .kpi-card__icon-wrapper {
	background-color: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(4px);
}

.kpi-card--blue .kpi-card__icon {
	color: var(--color-text-inverse);
}

/* Chart styles */
.kpi-card__chart {
	position: relative;
	width: 2.5rem;
	/* 40px */
	height: 2.5rem;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.kpi-card__chart-svg {
	width: 100%;
	height: 100%;
	transform: rotate(-90deg);
}

.kpi-card__chart-bg {
	color: var(--token-color-neutral-200);
	opacity: 1;
}

.kpi-card__chart-value {
	color: var(--color-message-info-text);
	opacity: 1;
	transition: stroke-dasharray var(--transition-slow);
}
</style>
