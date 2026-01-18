<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppCard',
})

interface Props {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  clickable: false,
})

const emit = defineEmits<{
  click: []
}>()

const cardClasses = computed(() => ({
  'card': true,
  'card--outlined': props.variant === 'outlined',
  'card--elevated': props.variant === 'elevated',
  'card--padding-none': props.padding === 'none',
  'card--padding-sm': props.padding === 'sm',
  'card--padding-md': props.padding === 'md',
  'card--padding-lg': props.padding === 'lg',
  'card--clickable': props.clickable,
}))

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div :class="cardClasses" @click="handleClick">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.card--outlined {
  border: 1px solid var(--color-border-default);
}

.card--elevated {
  box-shadow: var(--shadow-md);
}

.card--padding-none {
  padding: 0;
}

.card--padding-sm {
  padding: var(--spacing-md);
}

.card--padding-md {
  padding: var(--spacing-xl);
}

.card--padding-lg {
  padding: var(--spacing-2xl);
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
</style>
