<script setup lang="ts">
import { computed } from 'vue'

import Badge from '@/business/common/presentation/atoms/Badge.vue'
import Button from '@/business/common/presentation/atoms/Button.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import type { Medication, MedicationAdministration } from '@/business/medication/domain/Medication'
import { parseFrequency } from '@/business/medication/domain/Medication'

interface Props {
	medications: Medication[]
	administrations?: MedicationAdministration[]
	onAdminister?: (medication: Medication) => void
}

const props = withDefaults(defineProps<Props>(), {
	administrations: () => [],
	onAdminister: undefined,
})

const todayAdministrations = computed(() => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return props.administrations.filter(admin => {
		const adminDate = new Date(admin.administeredAt)
		adminDate.setHours(0, 0, 0, 0)
		return adminDate.getTime() === today.getTime()
	})
})

const getTodaySchedule = computed(() => {
	const schedule: Array<{ time: string; medications: Medication[] }> = []
	const timeMap = new Map<string, Medication[]>()

	props.medications.forEach(med => {
		const times = parseFrequency(med.frequency)
		times.forEach(time => {
			if (!timeMap.has(time)) {
				timeMap.set(time, [])
			}
			timeMap.get(time)!.push(med)
		})
	})

	Array.from(timeMap.entries())
		.sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
		.forEach(([time, medications]) => {
			schedule.push({ time, medications })
		})

	return schedule
})

const isMedicationAdministered = (medication: Medication): boolean => {
	return todayAdministrations.value.some(
		admin => admin.medicationId === medication.id && admin.status === 'administered'
	)
}

const handleAdminister = (medication: Medication) => {
	if (props.onAdminister) {
		props.onAdminister(medication)
	}
}
</script>

<template>
	<div class="medication-schedule">
		<h3 class="medication-schedule__title">Horario de Medicación - Hoy</h3>

		<div v-if="getTodaySchedule.length === 0" class="medication-schedule__empty">
			No hay medicaciones programadas para hoy
		</div>

		<div v-else class="medication-schedule__times">
			<Card
				v-for="{ time, medications } in getTodaySchedule"
				:key="time"
				variant="elevated"
				padding="lg"
				class="medication-schedule__time-slot"
			>
				<div class="time-slot">
					<div class="time-slot__header">
						<span class="time-slot__time">{{ time }}</span>
					</div>
					<div class="time-slot__medications">
						<div
							v-for="medication in medications"
							:key="medication.id"
							class="medication-schedule-item"
						>
							<div class="medication-schedule-item__info">
								<span class="medication-schedule-item__name">{{ medication.name }}</span>
								<span class="medication-schedule-item__dosage">{{ medication.dosage }}</span>
							</div>
							<div class="medication-schedule-item__actions">
								<Badge v-if="isMedicationAdministered(medication)" variant="success" size="sm">
									Administrado
								</Badge>
								<Button v-else variant="primary" size="sm" @click="handleAdminister(medication)">
									Administrar
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.medication-schedule {
	width: 100%;
}

.medication-schedule__title {
	margin: 0 0 var(--spacing-xl) 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.medication-schedule__empty {
	padding: var(--spacing-xl);
	text-align: center;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}

.medication-schedule__times {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.medication-schedule__time-slot {
	width: 100%;
}

.time-slot {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.time-slot__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: var(--spacing-md);
	border-bottom: 1px solid var(--color-border-default);
}

.time-slot__time {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--token-color-primary-600);
}

.time-slot__medications {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.medication-schedule-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-md);
}

.medication-schedule-item__info {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	flex: 1;
}

.medication-schedule-item__name {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-primary);
}

.medication-schedule-item__dosage {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.medication-schedule-item__actions {
	flex-shrink: 0;
}
</style>
