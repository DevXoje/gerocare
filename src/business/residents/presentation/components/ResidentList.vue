<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import type { Resident } from '@/business/residents/domain/Resident'
import ResidentCard from '@/business/residents/presentation/components/ResidentCard.vue'

interface Props {
	residents: Resident[]
	isLoading?: boolean
	error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
	isLoading: false,
	error: null,
})

const router = useRouter()

const hasResidents = computed(() => props.residents.length > 0)

const handleResidentClick = (resident: Resident) => {
	router.push(`/residents/${resident.id}`)
}
</script>

<template>
	<div class="resident-list">
		<div v-if="isLoading" class="loading-state">
			<p>Cargando residentes...</p>
		</div>

		<div v-else-if="error" class="error-state">
			<p class="error-message">{{ error }}</p>
		</div>

		<div v-else-if="!hasResidents" class="empty-state">
			<p>No hay residentes asignados</p>
		</div>

		<div v-else class="residents-grid">
			<ResidentCard
				v-for="resident in residents"
				:key="resident.id"
				:resident="resident"
				@click="handleResidentClick"
			/>
		</div>
	</div>
</template>

<style scoped>
.resident-list {
	width: 100%;
}

.loading-state,
.error-state,
.empty-state {
	padding: 2rem;
	text-align: center;
	color: #6b7280;
}

.error-message {
	color: #dc3545;
}

.residents-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
}

@media (max-width: 768px) {
	.residents-grid {
		grid-template-columns: 1fr;
	}
}
</style>
