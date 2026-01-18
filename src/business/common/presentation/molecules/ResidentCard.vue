<script setup lang="ts">
import { computed } from 'vue'

import { Badge, Card } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'AppResidentCard',
})

interface MedicalStat {
	label: string
	icon?: string
	variant?: 'error' | 'warning' | 'info' | 'default'
}

interface Props {
	name: string
	room: string
	bed?: string
	image?: string
	priority?: 'high' | 'medium' | 'low'
	medicalStats?: MedicalStat[]
	lastUpdate?: string
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	bed: undefined,
	image: undefined,
	priority: undefined,
	medicalStats: undefined,
	lastUpdate: undefined,
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const residentCardClasses = computed(() => ({
	'resident-card': true,
	'resident-card--clickable': props.clickable,
	[`resident-card--priority-${props.priority}`]: props.priority,
}))

const borderClass = computed(() => {
	switch (props.priority) {
		case 'high':
			return 'resident-card--border-red'
		case 'medium':
			return 'resident-card--border-amber'
		default:
			return ''
	}
})

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}
</script>

<template>
	<Card :clickable="clickable" variant="elevated" padding="lg" :class="[residentCardClasses, borderClass]"
		@click="handleClick">
		<div class="resident-card__content">
			<div class="resident-card__image-wrapper">
				<img v-if="image" :src="image" :alt="name" class="resident-card__image" />
				<div v-else class="resident-card__placeholder">
					<span class="resident-card__placeholder-icon">person</span>
				</div>
				<span v-if="priority === 'high'" class="resident-card__priority-badge">
					<span class="resident-card__priority-icon">priority_high</span>
				</span>
			</div>

			<div class="resident-card__details">
				<div class="resident-card__header">
					<h3 class="resident-card__name">{{ name }}</h3>
				</div>
				<p class="resident-card__location">
					Room {{ room }}<span v-if="bed"> • Bed {{ bed }}</span>
				</p>

				<div v-if="medicalStats && medicalStats.length > 0" class="resident-card__stats">
					<Badge v-for="(stat, index) in medicalStats" :key="index" :variant="stat.variant || 'default'"
						size="sm" class="resident-card__stat-badge">
						<span v-if="stat.icon" class="resident-card__stat-icon">{{ stat.icon }}</span>
						{{ stat.label }}
					</Badge>
				</div>

				<p v-if="lastUpdate" class="resident-card__last-update">
					<span class="resident-card__update-icon">schedule</span>
					{{ lastUpdate }}
				</p>
			</div>

			<div class="resident-card__chevron">
				<span class="resident-card__chevron-icon">chevron_right</span>
			</div>
		</div>
	</Card>
</template>

<style scoped>
.resident-card {
	position: relative;
	border-left: 6px solid transparent;
}

.resident-card--border-red {
	border-left-color: var(--token-color-error-500);
}

.resident-card--border-amber {
	border-left-color: var(--token-color-warning-500);
}

.resident-card__content {
	display: flex;
	align-items: flex-start;
	gap: var(--spacing-lg);
}

.resident-card--clickable {
	cursor: pointer;
}

.resident-card--clickable:hover {
	box-shadow: var(--shadow-lg);
}

.resident-card__image-wrapper {
	position: relative;
	width: 4rem;
	/* 64px */
	height: 4rem;
	flex-shrink: 0;
}

.resident-card__image {
	width: 100%;
	height: 100%;
	border-radius: var(--radius-xl);
	object-fit: cover;
	box-shadow: var(--shadow-sm);
}

.resident-card__placeholder {
	width: 100%;
	height: 100%;
	border-radius: var(--radius-xl);
	background-color: var(--token-color-neutral-200);
	display: flex;
	align-items: center;
	justify-content: center;
}

.resident-card__placeholder-icon {
	font-size: var(--font-size-2xl);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-secondary);
}

.resident-card__priority-badge {
	position: absolute;
	top: -0.5rem;
	right: -0.5rem;
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	background-color: var(--token-color-error-500);
	color: var(--color-text-inverse);
	box-shadow: var(--shadow-md);
	border: 2px solid var(--color-bg-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}

.resident-card__priority-icon {
	font-size: 0.875rem;
	/* 14px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 700;
}

.resident-card__details {
	flex: 1;
	min-width: 0;
	padding-top: 2px;
}

.resident-card__header {
	margin-bottom: var(--spacing-xs);
}

.resident-card__name {
	font-size: var(--font-size-base);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	margin: 0;
	line-height: var(--line-height-tight);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.resident-card__location {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	margin: 0 0 var(--spacing-md) 0;
}

.resident-card__stats {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-sm);
}

.resident-card__stat-badge {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.resident-card__stat-icon {
	font-size: 0.875rem;
	/* 14px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
}

.resident-card__last-update {
	font-size: var(--font-size-xs);
	color: var(--color-text-tertiary);
	font-weight: var(--font-weight-medium);
	margin: 0;
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.resident-card__update-icon {
	font-size: 0.875rem;
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
}

.resident-card__chevron {
	flex-shrink: 0;
	align-self: center;
}

.resident-card__chevron-icon {
	font-size: var(--font-size-xl);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--token-color-neutral-300);
	transition: color var(--transition-base);
}

.resident-card--clickable:hover .resident-card__chevron-icon {
	color: var(--color-text-primary);
}
</style>
