<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppRadio',
})

interface Props {
	modelValue: string | number | boolean
	label?: string
	value: string | number | boolean
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	id?: string
	name?: string
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
	disabled: false,
	required: false,
	error: false,
	id: undefined,
})

const emit = defineEmits<{
	'update:modelValue': [value: string | number | boolean]
	change: [value: string | number | boolean]
}>()

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const isChecked = computed(() => props.modelValue === props.value)

const radioClasses = computed(() => ({
	radio: true,
	'radio--error': hasError.value,
	'radio--disabled': props.disabled,
}))

const handleChange = () => {
	if (!props.disabled) {
		emit('update:modelValue', props.value)
		emit('change', props.value)
	}
}
</script>

<template>
	<label :class="radioClasses">
		<input
			:id="id"
			:name="name"
			type="radio"
			:checked="isChecked"
			:value="value"
			:disabled="disabled"
			:required="required"
			class="radio__input"
			@change="handleChange"
		/>
		<span class="radio__circle"></span>
		<span v-if="label" class="radio__label">{{ label }}</span>
	</label>
</template>

<style scoped>
.radio {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-sm);
	cursor: pointer;
	position: relative;
}

.radio--disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.radio__input {
	position: absolute;
	opacity: 0;
	cursor: pointer;
	height: 0;
	width: 0;
}

.radio__circle {
	width: 20px;
	height: 20px;
	border: 2px solid var(--color-border-default);
	border-radius: var(--radius-full);
	background-color: var(--color-bg-primary);
	transition: all var(--transition-base);
	flex-shrink: 0;
	position: relative;
}

.radio__circle::after {
	content: '';
	position: absolute;
	display: none;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 8px;
	height: 8px;
	border-radius: var(--radius-full);
	background-color: var(--vt-c-white);
}

.radio:hover .radio__input:not(:disabled) ~ .radio__circle {
	border-color: var(--color-border-hover);
}

.radio__input:checked ~ .radio__circle {
	background-color: var(--token-color-primary-600);
	border-color: var(--token-color-primary-600);
}

.radio__input:checked ~ .radio__circle::after {
	display: block;
}

.radio__input:focus ~ .radio__circle {
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.radio--error .radio__circle {
	border-color: var(--color-border-error);
}

.radio--disabled .radio__circle {
	cursor: not-allowed;
	opacity: 0.6;
}

.radio__label {
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	user-select: none;
}

.radio--disabled .radio__label {
	cursor: not-allowed;
}
</style>
