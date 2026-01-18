<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppTextarea',
})

interface Props {
	modelValue: string
	placeholder?: string
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	rows?: number
	id?: string
	name?: string
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: '',
	disabled: false,
	required: false,
	error: false,
	rows: 4,
	id: undefined,
	name: undefined,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
	blur: [event: FocusEvent]
	focus: [event: FocusEvent]
}>()

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const textareaClasses = computed(() => ({
	textarea: true,
	'textarea--error': hasError.value,
	'textarea--disabled': props.disabled,
}))

const handleInput = (event: Event) => {
	const target = event.target as HTMLTextAreaElement
	emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
	emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
	emit('focus', event)
}
</script>

<template>
	<textarea
		:id="id"
		:name="name"
		:value="modelValue"
		:placeholder="placeholder"
		:disabled="disabled"
		:required="required"
		:rows="rows"
		:class="textareaClasses"
		@input="handleInput"
		@blur="handleBlur"
		@focus="handleFocus"
	/>
</template>

<style scoped>
.textarea {
	width: 100%;
	padding: var(--spacing-md);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	font-size: var(--font-size-base);
	font-family: inherit;
	transition: border-color var(--transition-base);
	background-color: var(--color-bg-primary);
	color: var(--color-text-primary);
	resize: vertical;
	min-height: 80px;
}

.textarea:focus {
	outline: none;
	border-color: var(--color-border-focus);
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea--disabled {
	background-color: var(--color-bg-tertiary);
	cursor: not-allowed;
	opacity: 0.6;
}

.textarea--error {
	border-color: var(--color-border-error);
}

.textarea--error:focus {
	border-color: var(--color-border-error);
	box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>
