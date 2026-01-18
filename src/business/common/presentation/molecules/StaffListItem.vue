<script setup lang="ts">
import { computed } from 'vue'

import { StaffAvatar } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'AppStaffListItem',
})

interface Props {
	name: string
	avatar?: string
	status?: 'online' | 'away' | 'offline'
	highlighted?: boolean
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	avatar: undefined,
	status: undefined,
	highlighted: false,
	clickable: false,
})

const emit = defineEmits<{
	click: []
}>()

const itemClasses = computed(() => ({
	'staff-list-item': true,
	'staff-list-item--clickable': props.clickable,
}))

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}
</script>

<template>
	<div :class="itemClasses" @click="handleClick">
		<div class="staff-list-item__avatar-wrapper">
			<StaffAvatar :src="avatar" :status="status" :highlighted="highlighted" size="md" />
		</div>
		<span class="staff-list-item__name">{{ name }}</span>
	</div>
</template>

<style scoped>
.staff-list-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-sm);
	min-width: 4.5rem;
	/* 72px */
	flex-shrink: 0;
}

.staff-list-item--clickable {
	cursor: pointer;
}

.staff-list-item__avatar-wrapper {
	position: relative;
}

.staff-list-item__name {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-primary);
	text-align: center;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
