<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppButton',
})

interface Props {
	variant?: 'primary' | 'secondary' | 'danger' | 'outline'
	size?: 'sm' | 'md' | 'lg'
	disabled?: boolean
	loading?: boolean
	type?: 'button' | 'submit' | 'reset'
	block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'primary',
	size: 'md',
	disabled: false,
	loading: false,
	type: 'button',
	block: false,
})

const emit = defineEmits<{
	click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => ({
	button: true,
	[`button--${props.variant}`]: true,
	[`button--${props.size}`]: true,
	'button--disabled': props.disabled || props.loading,
	'button--loading': props.loading,
	'button--block': props.block,
}))

const handleClick = (event: MouseEvent) => {
	if (!props.disabled && !props.loading) {
		emit('click', event)
	}
}
</script>

<template>
	<button :type="type" :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
		<span v-if="loading" class="button__spinner">⏳</span>
		<slot />
	</button>
</template>

<style scoped>
.button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-sm);
	border: none;
	border-radius: var(--radius-md);
	font-weight: var(--font-weight-semibold);
	cursor: pointer;
	transition: all var(--transition-base);
	font-family: inherit;
}

.button--sm {
	padding: var(--spacing-sm) var(--spacing-md);
	font-size: var(--font-size-sm);
}

.button--md {
	padding: var(--spacing-md) var(--spacing-lg);
	font-size: var(--font-size-base);
}

.button--lg {
	padding: var(--spacing-lg) var(--spacing-xl);
	font-size: var(--font-size-lg);
}

.button--primary {
	background: var(--color-button-primary-bg);
	color: var(--color-button-primary-text);
}

.button--primary:hover:not(:disabled) {
	background: var(--color-button-primary-hover);
}

.button--secondary {
	background: var(--color-button-secondary-bg);
	color: var(--color-button-secondary-text);
}

.button--secondary:hover:not(:disabled) {
	background: var(--color-button-secondary-hover);
}

.button--danger {
	background: var(--color-button-danger-bg);
	color: var(--color-button-danger-text);
}

.button--danger:hover:not(:disabled) {
	background: var(--color-button-danger-hover);
}

.button--outline {
	background: transparent;
	color: var(--color-text-primary);
	border: 1px solid var(--color-border-default);
}

.button--outline:hover:not(:disabled) {
	background: var(--color-bg-hover);
	border-color: var(--color-border-hover);
}

.button--block {
	width: 100%;
}

.button--disabled,
.button--loading {
	opacity: 0.6;
	cursor: not-allowed;
	pointer-events: none;
}

.button__spinner {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
