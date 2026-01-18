<script setup lang="ts">
import type { Resident } from '@/business/residents/domain/Resident'
import { calculateAge } from '@/business/residents/domain/Resident'

interface Props {
	resident: Resident
}

const props = defineProps<Props>()

const emit = defineEmits<{
	click: [resident: Resident]
}>()

const age = calculateAge(props.resident.dateOfBirth)
const fullName = `${props.resident.firstName} ${props.resident.lastName}`

const handleClick = () => {
	emit('click', props.resident)
}
</script>

<template>
	<div class="resident-card" @click="handleClick">
		<div class="resident-avatar">
			<div class="avatar-placeholder">{{ resident.firstName[0] }}{{ resident.lastName[0] }}</div>
		</div>
		<div class="resident-info">
			<h3 class="resident-name">{{ fullName }}</h3>
			<p class="resident-age">{{ age }} años</p>
		</div>
	</div>
</template>

<style scoped>
.resident-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;
}

.resident-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.resident-avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	background-color: #e5e7eb;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.avatar-placeholder {
	font-size: 1.5rem;
	font-weight: 600;
	color: #6b7280;
}

.resident-info {
	flex: 1;
	min-width: 0;
}

.resident-name {
	margin: 0 0 0.25rem 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.resident-age {
	margin: 0;
	font-size: 0.875rem;
	color: #6b7280;
}
</style>
