<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@design-system/atoms'
import { useNetworkStatus } from '@/shared/offline/app/useNetworkStatus'

defineOptions({
	name: 'NetworkStatusBadge',
})

interface Props {
	/**
	 * Whether to show the text label
	 */
	showLabel?: boolean
	/**
	 * Position of the badge
	 */
	position?: 'fixed' | 'inline'
}

const props = withDefaults(defineProps<Props>(), {
	showLabel: false,
	position: 'inline',
})

const { isOnline } = useNetworkStatus()

const shouldShow = computed(() => !isOnline.value)

const badgeClasses = computed(() => ({
	'network-status-badge': true,
	'network-status-badge--fixed': props.position === 'fixed',
}))
</script>

<template>
	<Transition name="fade">
		<Badge v-if="shouldShow" :class="badgeClasses" variant="warning" size="sm">
			<span class="network-status-badge__dot"></span>
			<span v-if="showLabel" class="network-status-badge__label">Sin conexión</span>
		</Badge>
	</Transition>
</template>

<style scoped>
.network-status-badge {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.network-status-badge--fixed {
	position: fixed;
	top: var(--spacing-lg);
	right: var(--spacing-lg);
	z-index: 9999;
}

.network-status-badge__dot {
	width: 8px;
	height: 8px;
	border-radius: var(--radius-full);
	background-color: var(--token-color-warning-500);
	flex-shrink: 0;
	animation: pulse 2s ease-in-out infinite;
}

.network-status-badge__label {
	font-size: var(--font-size-xs);
}

@keyframes pulse {

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
