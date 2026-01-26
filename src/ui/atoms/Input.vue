<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppInput',
})

interface Props {
	modelValue: string | number
	type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time'
	placeholder?: string
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	autocomplete?: string
	id?: string
	name?: string
	min?: string
	max?: string
	variant?: 'default' | 'search'
	icon?: string
}

const props = withDefaults(defineProps<Props>(), {
	type: 'text',
	placeholder: '',
	disabled: false,
	required: false,
	error: false,
	autocomplete: undefined,
	id: undefined,
	name: undefined,
	min: undefined,
	max: undefined,
	variant: 'default',
	icon: undefined,
})

const emit = defineEmits<{
	'update:modelValue': [value: string | number]
	blur: [event: FocusEvent]
	focus: [event: FocusEvent]
}>()

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const inputClasses = computed(() => ({
	input: true,
	'input--error': hasError.value,
	'input--disabled': props.disabled,
	'input--search': props.variant === 'search',
	'input--with-icon': props.icon !== undefined || props.variant === 'search',
}))

const handleInput = (event: Event) => {
	const target = event.target as HTMLInputElement
	const value = props.type === 'number' ? Number(target.value) : target.value
	emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
	emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
	emit('focus', event)
}
</script>

<template>
	<div v-if="variant === 'search' || icon" class="input-wrapper">
		<div v-if="variant === 'search' || icon" class="input__icon-left">
			<span class="input__icon material-symbols-outlined">{{ icon || 'search' }}</span>
		</div>
		<input
			:id="id"
			:name="name"
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:required="required"
			:autocomplete="autocomplete"
			:min="min"
			:max="max"
			:class="inputClasses"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"
		/>
	</div>
	<input
		v-else
		:id="id"
		:name="name"
		:type="type"
		:value="modelValue"
		:placeholder="placeholder"
		:disabled="disabled"
		:required="required"
		:autocomplete="autocomplete"
		:min="min"
		:max="max"
		:class="inputClasses"
		@input="handleInput"
		@blur="handleBlur"
		@focus="handleFocus"
	/>
</template>

<style scoped>
.input-wrapper {
	position: relative;
	width: 100%;
}

.input {
	width: 100%;
	padding: var(--spacing-md);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	font-size: var(--font-size-base);
	transition: border-color var(--transition-base);
	background-color: var(--color-bg-primary);
	color: var(--color-text-primary);
	font-family: inherit;
}

.input--with-icon {
	padding-left: 2.75rem; /* 44px for icon (12px padding + 20px icon + 12px gap) */
}

.input--search {
	border: none;
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow-sm);
}

.input--search:focus {
	border-color: transparent;
	box-shadow: 0 0 0 2px rgba(11, 95, 255, 0.2);
	background-color: var(--color-bg-primary);
}

.input--search::placeholder {
	color: var(--color-text-tertiary);
}

.input:focus {
	outline: none;
	border-color: var(--color-border-focus);
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input--disabled {
	background-color: var(--color-bg-tertiary);
	cursor: not-allowed;
	opacity: 0.6;
}

.input--error {
	border-color: var(--color-border-error);
}

.input--error:focus {
	border-color: var(--color-border-error);
	box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input__icon-left {
	position: absolute;
	left: var(--spacing-md);
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
	display: flex;
	align-items: center;
	color: var(--color-text-tertiary);
	z-index: 1;
}

.input--search:focus-within .input__icon-left {
	color: var(--token-color-primary-600);
	transition: color var(--transition-base);
}

.input__icon {
	font-size: var(--font-size-xl); /* 20px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	line-height: 1;
}
</style>
