<script setup lang="ts">
import { computed, onMounted, onUnmounted,ref } from 'vue'

defineOptions({
  name: 'AppDatePicker',
})

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string | boolean
  min?: string
  max?: string
  id?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar fecha',
  disabled: false,
  required: false,
  error: false,
  min: undefined,
  max: undefined,
  id: undefined,
  name: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const hasError = computed(() => {
  return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const datePickerClasses = computed(() => ({
  'date-picker': true,
  'date-picker--error': hasError.value,
  'date-picker--disabled': props.disabled,
}))

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Also emit on change to ensure value is captured when field loses focus
  if (target.value !== props.modelValue) {
    emit('update:modelValue', target.value)
  }
}

const handleBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  // Ensure value is emitted on blur if it changed
  if (target.value !== props.modelValue) {
    emit('update:modelValue', target.value)
  }
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<template>
  <input
    :id="id"
    :name="name"
    type="date"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :class="datePickerClasses"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<style scoped>
.date-picker {
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

.date-picker:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-picker--disabled {
  background-color: var(--color-bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.date-picker--error {
  border-color: var(--color-border-error);
}

.date-picker--error:focus {
  border-color: var(--color-border-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Style the date picker icon in browsers that support it */
.date-picker::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition-base);
}

.date-picker:hover::-webkit-calendar-picker-indicator {
  opacity: 1;
}

.date-picker--disabled::-webkit-calendar-picker-indicator {
  cursor: not-allowed;
  opacity: 0.3;
}
</style>
