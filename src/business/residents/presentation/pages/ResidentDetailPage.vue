<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ResidentDetail from '@/business/residents/presentation/components/ResidentDetail.vue'
import { useResidentStore } from '@/business/residents/store'

const route = useRoute()
const router = useRouter()
const residentStore = useResidentStore()
const { currentResident: resident, isLoading, error } = storeToRefs(residentStore)
const { fetchResident } = residentStore

onMounted(async () => {
	const residentId = route.params.id as string
	if (residentId) {
		await fetchResident(residentId)
	}
})
</script>

<template>
	<div class="resident-detail-page">
		<button @click="router.back()" class="back-button">← Volver</button>

		<ResidentDetail :resident="resident" :is-loading="isLoading" :error="error?.message" />
	</div>
</template>

<style scoped>
.resident-detail-page {
	width: 100%;
	padding: 1.5rem;
}

@media (min-width: 768px) {
	.resident-detail-page {
		padding: 2rem;
	}
}

.back-button {
	margin-bottom: 1.5rem;
	padding: 0.5rem 1rem;
	background: none;
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	color: var(--color-text-primary);
	cursor: pointer;
	font-size: var(--font-size-sm);
	transition: background-color var(--transition-base);
}

.back-button:hover {
	background-color: var(--color-bg-hover);
}
</style>
