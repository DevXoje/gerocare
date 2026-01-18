<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppCheckbox',
})

interface Props {
	modelValue: boolean
	label?: string
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	id?: string
	name?: string
	value?: string | number | boolean
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
	disabled: false,
	required: false,
	error: false,
	id: undefined,
	name: undefined,
	value: true,
})

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	change: [value: boolean]
}>()

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const checkboxClasses = computed(() => ({
	checkbox: true,
	'checkbox--error': hasError.value,
	'checkbox--disabled': props.disabled,
}))

const handleChange = (event: Event) => {
	const target = event.target as HTMLInputElement
	const checked = target.checked
	emit('update:modelValue', checked)
	emit('change', checked)
}
</script>

<template>
	<label :class="checkboxClasses">
		<input
			:id="id"
			:name="name"
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			:required="required"
			:value="value"
			class="checkbox__input"
			@change="handleChange"
		/>
		<span class="checkbox__checkmark"></span>
		<span v-if="label" class="checkbox__label">{{ label }}</span>
	</label>
</template>

<style scoped>
.checkbox {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-sm);
	cursor: pointer;
	position: relative;
}

.checkbox--disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.checkbox__input {
	position: absolute;
	opacity: 0;
	cursor: pointer;
	height: 0;
	width: 0;
}

.checkbox__checkmark {
	width: 20px;
	height: 20px;
	border: 2px solid var(--color-border-default);
	border-radius: var(--radius-sm);
	background-color: var(--color-bg-primary);
	transition: all var(--transition-base);
	flex-shrink: 0;
	position: relative;
}

.checkbox__checkmark::after {
	content: '';
	position: absolute;
	display: none;
	left: 6px;
	top: 2px;
	width: 5px;
	height: 10px;
	border: solid var(--vt-c-white);
	border-width: 0 2px 2px 0;
	transform: rotate(45deg);
}

.checkbox:hover .checkbox__input:not(:disabled) ~ .checkbox__checkmark {
	border-color: var(--color-border-hover);
}

.checkbox__input:checked ~ .checkbox__checkmark {
	background-color: var(--token-color-primary-600);
	border-color: var(--token-color-primary-600);
}

.checkbox__input:checked ~ .checkbox__checkmark::after {
	display: block;
}

.checkbox__input:focus ~ .checkbox__checkmark {
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox--error .checkbox__checkmark {
	border-color: var(--color-border-error);
}

.checkbox--disabled .checkbox__checkmark {
	cursor: not-allowed;
	opacity: 0.6;
}

.checkbox__label {
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	user-select: none;
}

.checkbox--disabled .checkbox__label {
	cursor: not-allowed;
}
</style>
