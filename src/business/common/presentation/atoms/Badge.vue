<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppBadge',
})

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dot: false,
})

const badgeClasses = computed(() => ({
  'badge': true,
  [`badge--${props.variant}`]: true,
  [`badge--${props.size}`]: true,
  'badge--dot': props.dot,
}))
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="dot" class="badge__dot"></span>
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  line-height: 1;
}

.badge--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.badge--md {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
}

.badge--lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.badge--default {
  background-color: var(--token-color-neutral-100);
  color: var(--token-color-neutral-700);
}

.badge--primary {
  background-color: var(--token-color-primary-100);
  color: var(--token-color-primary-700);
}

.badge--success {
  background-color: var(--token-color-success-100);
  color: var(--token-color-success-700);
}

.badge--warning {
  background-color: var(--token-color-warning-100);
  color: var(--token-color-warning-700);
}

.badge--error {
  background-color: var(--token-color-error-100);
  color: var(--token-color-error-700);
}

.badge--info {
  background-color: var(--token-color-info-100);
  color: var(--token-color-info-700);
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: currentColor;
  flex-shrink: 0;
}
</style>
