<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AppSkeleton',
})

interface Props {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  animation?: 'pulse' | 'wave' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: undefined,
  height: undefined,
  animation: 'pulse',
})

const skeletonClasses = computed(() => ({
  'skeleton': true,
  [`skeleton--${props.variant}`]: true,
  [`skeleton--${props.animation}`]: true,
}))

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = props.width
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})
</script>

<template>
  <div :class="skeletonClasses" :style="skeletonStyle"></div>
</template>

<style scoped>
.skeleton {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.skeleton--text {
  height: 1em;
  border-radius: var(--radius-sm);
}

.skeleton--circular {
  border-radius: var(--radius-full);
  aspect-ratio: 1;
}

.skeleton--rectangular {
  border-radius: var(--radius-md);
}

.skeleton--pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton--wave {
  position: relative;
  overflow: hidden;
}

.skeleton--wave::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes skeleton-wave {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
