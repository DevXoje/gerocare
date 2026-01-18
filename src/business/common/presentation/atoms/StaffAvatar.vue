<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppStaffAvatar',
})

interface Props {
	src?: string
	alt?: string
	size?: 'sm' | 'md' | 'lg'
	status?: 'online' | 'away' | 'offline'
	highlighted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	src: undefined,
	alt: 'Staff member',
	size: 'md',
	status: undefined,
	highlighted: false,
})

const avatarClasses = computed(() => ({
	'staff-avatar': true,
	[`staff-avatar--${props.size}`]: true,
	'staff-avatar--highlighted': props.highlighted,
}))

const statusClasses = computed(() => {
	if (!props.status) return ''
	return {
		'staff-avatar__status': true,
		[`staff-avatar__status--${props.status}`]: true,
	}
})

const statusSize = computed(() => {
	if (props.size === 'sm') return '0.75rem' // 12px
	if (props.size === 'lg') return '1rem' // 16px
	return '0.875rem' // 14px
})
</script>

<template>
	<div class="staff-avatar-wrapper">
		<div :class="avatarClasses">
			<img v-if="src" :src="src" :alt="alt" class="staff-avatar__image" />
			<div v-else class="staff-avatar__placeholder">
				<span class="staff-avatar__icon">person</span>
			</div>
		</div>
		<span v-if="status" :class="statusClasses" :style="{ '--status-size': statusSize }"></span>
	</div>
</template>

<style scoped>
.staff-avatar-wrapper {
	position: relative;
	display: inline-block;
}

.staff-avatar {
	width: var(--size, 3.5rem);
	height: var(--size, 3.5rem);
	border-radius: var(--radius-full);
	overflow: hidden;
	border: 2px solid transparent;
	padding: 2px;
	background-color: var(--color-bg-primary);
	box-shadow: var(--shadow-sm);
	display: flex;
	align-items: center;
	justify-content: center;
}

.staff-avatar--sm {
	--size: 2.5rem;
}

.staff-avatar--md {
	--size: 3.5rem;
}

.staff-avatar--lg {
	--size: 4rem;
}

.staff-avatar--highlighted {
	border-color: rgba(0, 169, 157, 0.5); /* brand-teal/50 equivalent */
}

.staff-avatar__image {
	width: 100%;
	height: 100%;
	border-radius: var(--radius-full);
	object-fit: cover;
}

.staff-avatar__placeholder {
	width: 100%;
	height: 100%;
	border-radius: var(--radius-full);
	background-color: var(--token-color-neutral-200);
	display: flex;
	align-items: center;
	justify-content: center;
}

.staff-avatar__icon {
	font-size: calc(var(--size, 3.5rem) * 0.6);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-secondary);
}

.staff-avatar__status {
	position: absolute;
	bottom: 0;
	right: 0;
	width: var(--status-size, 0.875rem);
	height: var(--status-size, 0.875rem);
	border-radius: 50%;
	border: 2px solid var(--color-bg-primary);
	flex-shrink: 0;
}

.staff-avatar__status--online {
	background-color: var(--token-color-success-500);
}

.staff-avatar__status--away {
	background-color: var(--token-color-warning-500);
}

.staff-avatar__status--offline {
	background-color: var(--token-color-neutral-400);
}
</style>
