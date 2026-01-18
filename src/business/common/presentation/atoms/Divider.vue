<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppDivider',
})

interface Props {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'solid',
  spacing: 'md',
})

const dividerClasses = computed(() => ({
  'divider': true,
  'divider--horizontal': props.orientation === 'horizontal',
  'divider--vertical': props.orientation === 'vertical',
  [`divider--${props.variant}`]: true,
  [`divider--spacing-${props.spacing}`]: props.spacing !== 'none',
}))
</script>

<template>
  <hr :class="dividerClasses" />
</template>

<style scoped>
.divider {
  border: none;
  margin: 0;
}

.divider--horizontal {
  width: 100%;
  height: 1px;
}

.divider--vertical {
  width: 1px;
  height: 100%;
  align-self: stretch;
}

.divider--solid {
  background-color: var(--color-border-default);
}

.divider--dashed {
  border-top: 1px dashed var(--color-border-default);
  background: none;
}

.divider--dotted {
  border-top: 1px dotted var(--color-border-default);
  background: none;
}

.divider--spacing-none {
  margin: 0;
}

.divider--spacing-sm {
  margin: var(--spacing-sm) 0;
}

.divider--spacing-md {
  margin: var(--spacing-lg) 0;
}

.divider--spacing-lg {
  margin: var(--spacing-xl) 0;
}
</style>
