<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppChip',
})

interface Props {
	label: string
	active?: boolean
	variant?: 'default' | 'primary' | 'attention' | 'warning'
	icon?: string
	badge?: string
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	active: false,
	variant: 'default',
	icon: undefined,
	badge: undefined,
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const chipClasses = computed(() => ({
	chip: true,
	'chip--active': props.active,
	[`chip--${props.variant}`]: true,
	'chip--clickable': props.clickable,
}))

const handleClick = () => {
	if (props.clickable || props.active !== undefined) {
		emit('click')
	}
}
</script>

<template>
	<button
		v-if="clickable || active !== undefined"
		type="button"
		:class="chipClasses"
		@click="handleClick"
	>
		<span v-if="badge" class="chip__badge-dot" :class="`chip__badge-dot--${badge}`"></span>
		<span v-if="icon" class="chip__icon">{{ icon }}</span>
		<span class="chip__label">{{ label }}</span>
	</button>
	<span v-else :class="chipClasses">
		<span v-if="badge" class="chip__badge-dot" :class="`chip__badge-dot--${badge}`"></span>
		<span v-if="icon" class="chip__icon">{{ icon }}</span>
		<span class="chip__label">{{ label }}</span>
	</span>
</template>

<style scoped>
.chip {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-sm);
	padding: 0.375rem var(--spacing-lg); /* py-1.5 px-4 equivalent */
	border-radius: var(--radius-full);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	border: 1px solid var(--color-border-default);
	background-color: var(--color-bg-primary);
	color: var(--color-text-primary);
	transition: all var(--transition-base);
	flex-shrink: 0;
	line-height: 1;
}

.chip--clickable {
	cursor: pointer;
}

.chip--clickable:active {
	transform: scale(0.95);
}

.chip--default {
	border-color: var(--color-border-default);
	background-color: var(--color-bg-primary);
	color: var(--color-text-primary);
}

.chip--default:hover {
	background-color: var(--color-bg-hover);
}

.chip--active {
	background-color: var(--token-color-primary-600);
	border-color: transparent;
	color: var(--color-text-inverse);
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.chip--primary.chip--active {
	background-color: var(--token-color-primary-600);
	color: var(--color-text-inverse);
}

.chip--attention:hover {
	border-color: var(--token-color-error-200);
	background-color: var(--token-color-error-50);
}

.chip--warning:hover {
	border-color: var(--token-color-warning-200);
	background-color: var(--token-color-warning-50);
}

.chip__badge-dot {
	width: 0.375rem; /* 6px - 1.5 * 4px */
	height: 0.375rem;
	border-radius: 50%;
	flex-shrink: 0;
}

.chip__badge-dot--red {
	background-color: var(--token-color-error-500);
}

.chip__badge-dot--amber {
	background-color: var(--token-color-warning-500);
}

.chip__icon {
	font-size: var(--font-size-sm);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
}

.chip__label {
	white-space: nowrap;
}
</style>
