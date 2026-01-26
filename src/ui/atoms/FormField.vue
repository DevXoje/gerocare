<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppFormField',
})

interface Props {
	label?: string
	error?: string | boolean
	hint?: string
	required?: boolean
	id?: string
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
	error: false,
	hint: '',
	required: false,
	id: undefined,
})

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const errorMessage = computed(() => {
	if (typeof props.error === 'string') {
		return props.error
	}
	return ''
})
</script>

<template>
	<div class="form-field">
		<label v-if="label" :for="id" class="form-field__label">
			{{ label }}
			<span v-if="required" class="form-field__required">*</span>
		</label>
		<div class="form-field__content">
			<slot />
		</div>
		<p v-if="hint && !hasError" class="form-field__hint">{{ hint }}</p>
		<p v-if="hasError" class="form-field__error">{{ errorMessage }}</p>
	</div>
</template>

<style scoped>
.form-field {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	width: 100%;
}

.form-field__label {
	display: block;
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	margin-bottom: var(--spacing-xs);
}

.form-field__required {
	color: var(--color-border-error);
	margin-left: var(--spacing-xs);
}

.form-field__content {
	width: 100%;
}

.form-field__hint {
	margin: 0;
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.form-field__error {
	margin: 0;
	font-size: var(--font-size-xs);
	color: var(--color-border-error);
}
</style>
