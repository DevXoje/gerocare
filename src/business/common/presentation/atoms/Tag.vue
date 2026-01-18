<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppTag',
})

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  removable: false,
})

const emit = defineEmits<{
  remove: []
}>()

const tagClasses = computed(() => ({
  'tag': true,
  [`tag--${props.variant}`]: true,
  [`tag--${props.size}`]: true,
}))

const handleRemove = (event: Event) => {
  event.stopPropagation()
  emit('remove')
}
</script>

<template>
  <span :class="tagClasses">
    <slot />
    <button
      v-if="removable"
      type="button"
      class="tag__remove"
      aria-label="Eliminar"
      @click="handleRemove"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  line-height: 1;
}

.tag--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.tag--md {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
}

.tag--lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.tag--default {
  background-color: var(--token-color-neutral-100);
  color: var(--token-color-neutral-700);
  border: 1px solid var(--token-color-neutral-200);
}

.tag--primary {
  background-color: var(--token-color-primary-100);
  color: var(--token-color-primary-700);
  border: 1px solid var(--token-color-primary-200);
}

.tag--success {
  background-color: var(--token-color-success-100);
  color: var(--token-color-success-700);
  border: 1px solid var(--token-color-success-200);
}

.tag--warning {
  background-color: var(--token-color-warning-100);
  color: var(--token-color-warning-700);
  border: 1px solid var(--token-color-warning-200);
}

.tag--error {
  background-color: var(--token-color-error-100);
  color: var(--token-color-error-700);
  border: 1px solid var(--token-color-error-200);
}

.tag--info {
  background-color: var(--token-color-info-100);
  color: var(--token-color-info-700);
  border: 1px solid var(--token-color-info-200);
}

.tag__remove {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  padding: 0;
  margin-left: var(--spacing-xs);
  opacity: 0.7;
  transition: opacity var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tag__remove:hover {
  opacity: 1;
}
</style>
