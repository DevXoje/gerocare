<script setup lang="ts">
import { computed } from 'vue'

import { Badge, Card } from '@design-system/atoms'

defineOptions({
	name: 'AppIncidentCard',
})

interface Props {
	title: string
	resident: string
	room: string
	time: string
	severity: 'high' | 'medium' | 'low'
	icon?: string
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	icon: undefined,
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const incidentCardClasses = computed(() => ({
	'incident-card': true,
	'incident-card--clickable': props.clickable,
}))

const iconWrapperClasses = computed(() => ({
	'incident-card__icon-wrapper': true,
	[`incident-card__icon-wrapper--${props.severity}`]: true,
}))

const badgeVariant = computed(() => {
	switch (props.severity) {
		case 'high':
			return 'error'
		case 'medium':
			return 'warning'
		case 'low':
			return 'default'
		default:
			return 'default'
	}
})

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}
</script>

<template>
	<Card :clickable="clickable" variant="elevated" padding="lg" :class="incidentCardClasses" @click="handleClick">
		<div class="incident-card__content">
			<div v-if="icon" :class="iconWrapperClasses">
				<span class="incident-card__icon material-symbols-outlined">{{ icon }}</span>
			</div>

			<div class="incident-card__details">
				<div class="incident-card__header">
					<h4 class="incident-card__title">{{ title }}</h4>
					<Badge :variant="badgeVariant" size="sm">{{ severity.toUpperCase() }}</Badge>
				</div>

				<p class="incident-card__metadata">
					{{ resident }} <span class="incident-card__separator">•</span> {{ room }}
				</p>

				<p class="incident-card__time">{{ time }}</p>
			</div>
		</div>
	</Card>
</template>

<style scoped>
.incident-card__content {
	display: flex;
	align-items: flex-start;
	gap: var(--spacing-lg);
}

.incident-card--clickable {
	cursor: pointer;
	transition:
		transform var(--transition-base),
		box-shadow var(--transition-base);
}

.incident-card--clickable:hover {
	box-shadow: var(--shadow-lg);
	transform: translateY(-2px);
}

.incident-card--clickable:active {
	transform: translateY(0) scale(0.98);
}

.incident-card__icon-wrapper {
	width: 2.5rem;
	/* 40px */
	height: 2.5rem;
	border-radius: var(--radius-full);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.incident-card__icon-wrapper--high {
	background-color: var(--color-message-error-bg);
}

.incident-card__icon-wrapper--high .incident-card__icon {
	color: var(--color-message-error-text);
}

.incident-card__icon-wrapper--medium {
	background-color: var(--color-message-warning-bg);
}

.incident-card__icon-wrapper--medium .incident-card__icon {
	color: var(--color-message-warning-text);
}

.incident-card__icon-wrapper--low {
	background-color: var(--color-message-info-bg);
}

.incident-card__icon-wrapper--low .incident-card__icon {
	color: var(--color-message-info-text);
}

.incident-card__icon {
	font-size: var(--font-size-xl);
	/* 20px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	line-height: 1;
}

.incident-card__details {
	flex: 1;
	min-width: 0;
}

.incident-card__header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-xs);
	gap: var(--spacing-sm);
}

.incident-card__title {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	margin: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.incident-card__metadata {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	margin: 0 0 var(--spacing-xs) 0;
}

.incident-card__separator {
	color: var(--color-text-tertiary);
}

.incident-card__time {
	font-size: var(--font-size-xs);
	color: var(--color-text-tertiary);
	font-weight: var(--font-weight-medium);
	margin: 0;
}
</style>
