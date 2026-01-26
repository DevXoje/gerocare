<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

defineOptions({
	name: 'AppTooltip',
})

interface Props {
	text: string
	placement?: 'top' | 'bottom' | 'left' | 'right'
	delay?: number
}

const props = withDefaults(defineProps<Props>(), {
	placement: 'top',
	delay: 200,
})

const isVisible = ref(false)
const timeoutRef = ref<number | null>(null)

const tooltipClasses = computed(() => ({
	tooltip: true,
	[`tooltip--${props.placement}`]: true,
	'tooltip--visible': isVisible.value,
}))

const showTooltip = () => {
	timeoutRef.value = window.setTimeout(() => {
		isVisible.value = true
	}, props.delay)
}

const hideTooltip = () => {
	if (timeoutRef.value) {
		clearTimeout(timeoutRef.value)
		timeoutRef.value = null
	}
	isVisible.value = false
}

onUnmounted(() => {
	if (timeoutRef.value) {
		clearTimeout(timeoutRef.value)
	}
})
</script>

<template>
	<span class="tooltip-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
		<slot />
		<span v-if="text" :class="tooltipClasses">{{ text }}</span>
	</span>
</template>

<style scoped>
.tooltip-wrapper {
	position: relative;
	display: inline-block;
}

.tooltip {
	position: absolute;
	z-index: 1000;
	padding: var(--spacing-xs) var(--spacing-sm);
	background-color: var(--token-color-neutral-900);
	color: var(--vt-c-white);
	font-size: var(--font-size-xs);
	border-radius: var(--radius-sm);
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity var(--transition-base);
}

.tooltip--visible {
	opacity: 1;
}

.tooltip--top {
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-bottom: var(--spacing-xs);
}

.tooltip--top::after {
	content: '';
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	border: 4px solid transparent;
	border-top-color: var(--token-color-neutral-900);
}

.tooltip--bottom {
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-top: var(--spacing-xs);
}

.tooltip--bottom::after {
	content: '';
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	border: 4px solid transparent;
	border-bottom-color: var(--token-color-neutral-900);
}

.tooltip--left {
	right: 100%;
	top: 50%;
	transform: translateY(-50%);
	margin-right: var(--spacing-xs);
}

.tooltip--left::after {
	content: '';
	position: absolute;
	left: 100%;
	top: 50%;
	transform: translateY(-50%);
	border: 4px solid transparent;
	border-left-color: var(--token-color-neutral-900);
}

.tooltip--right {
	left: 100%;
	top: 50%;
	transform: translateY(-50%);
	margin-left: var(--spacing-xs);
}

.tooltip--right::after {
	content: '';
	position: absolute;
	right: 100%;
	top: 50%;
	transform: translateY(-50%);
	border: 4px solid transparent;
	border-right-color: var(--token-color-neutral-900);
}
</style>
