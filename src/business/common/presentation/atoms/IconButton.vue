<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppIconButton',
})

interface Props {
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  variant: 'ghost',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => ({
  'icon-button': true,
  [`icon-button--${props.variant}`]: true,
  [`icon-button--${props.size}`]: true,
  'icon-button--disabled': props.disabled || props.loading,
  'icon-button--loading': props.loading,
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span v-if="loading" class="icon-button__spinner">⏳</span>
    <span v-else-if="icon" class="icon-button__icon">{{ icon }}</span>
    <slot v-else />
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: inherit;
  background: transparent;
}

.icon-button--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-base);
}

.icon-button--md {
  width: 40px;
  height: 40px;
  font-size: var(--font-size-lg);
}

.icon-button--lg {
  width: 48px;
  height: 48px;
  font-size: var(--font-size-xl);
}

.icon-button--primary {
  background: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
}

.icon-button--primary:hover:not(:disabled) {
  background: var(--color-button-primary-hover);
}

.icon-button--secondary {
  background: var(--color-button-secondary-bg);
  color: var(--color-button-secondary-text);
}

.icon-button--secondary:hover:not(:disabled) {
  background: var(--color-button-secondary-hover);
}

.icon-button--danger {
  background: var(--color-button-danger-bg);
  color: var(--color-button-danger-text);
}

.icon-button--danger:hover:not(:disabled) {
  background: var(--color-button-danger-hover);
}

.icon-button--outline {
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
}

.icon-button--outline:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.icon-button--ghost {
  color: var(--color-text-secondary);
}

.icon-button--ghost:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.icon-button--disabled,
.icon-button--loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.icon-button__icon {
  line-height: 1;
}

.icon-button__spinner {
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
