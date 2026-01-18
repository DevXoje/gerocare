<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppInput',
})

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string | boolean
  autocomplete?: string
  id?: string
  name?: string
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
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const hasError = computed(() => {
  return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const inputClasses = computed(() => ({
  'input': true,
  'input--error': hasError.value,
  'input--disabled': props.disabled,
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
  <input
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :autocomplete="autocomplete"
    :class="inputClasses"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<style scoped>
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
</style>
