<script setup lang="ts">
import { computed, watch } from 'vue'

import { Button, DatePicker, FormField, Input, Textarea } from '@design-system/atoms'
import { ResidentSelector, TimeScheduleSelector } from '@design-system/molecules'
import { Modal } from '@design-system/organisms'
import { useMedicationForm } from '@/business/medication/app/useMedicationForm'

interface Props {
	modelValue: boolean
	residentId?: string
	medicationId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	submit: []
	close: []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm } = useMedicationForm()

// Sync residentId from props to form
watch(
	() => props.residentId,
	newResidentId => {
		if (newResidentId) {
			form.value.residentId = newResidentId
		}
	},
	{ immediate: true }
)

// Load medication to form if medicationId is provided
watch(
	() => props.medicationId,
	id => {
		if (id) {
			// loadMedicationToForm would need to be available
			// For now, we'll handle this in the page component
		}
	}
)

// Reset form when modal closes
watch(
	() => props.modelValue,
	isOpen => {
		if (!isOpen) {
			resetForm()
			if (props.residentId) {
				form.value.residentId = props.residentId
			}
		}
	}
)

// Convert Date to string for DatePicker
const startDateString = computed({
	get: (): string => {
		const startDate = form.value.startDate
		if (!startDate) return new Date().toISOString().split('T')[0]!
		if (typeof startDate === 'string') {
			return startDate
		}
		// At this point, startDate must be Date (if defined)
		if (startDate instanceof Date) {
			const isoString: string = startDate.toISOString().split('T')[0] || ''
			return isoString
		}
		const defaultDate = new Date().toISOString().split('T')[0] || ''
		return defaultDate
	},
	set: (value: string) => {
		form.value.startDate = new Date(value)
	},
})

const endDateString = computed<string>({
	get: (): string => {
		const endDate = form.value.endDate
		if (!endDate) return ''
		if (typeof endDate === 'string') {
			return endDate
		}
		// Type narrowing: if it's not string and not falsy, it must be Date
		if (endDate instanceof Date) {
			return endDate.toISOString().split('T')[0]!
		}
		return ''
	},
	set: (value: string) => {
		form.value.endDate = value ? new Date(value) : undefined
	},
})

const handleClose = () => {
	emit('update:modelValue', false)
	emit('close')
}

const handleSubmit = async () => {
	const result = await submit()
	if (result) {
		emit('submit')
		// Delay para permitir que el usuario vea la notificación de éxito antes de cerrar
		setTimeout(() => {
			handleClose()
		}, 1500)
	}
}
</script>

<template>
	<Modal :model-value="modelValue" title="Nueva Medicación" size="md" @update:model-value="handleClose"
		@close="handleClose">
		<form class="medication-form" @submit.prevent="handleSubmit">
			<FormField v-if="!residentId" label="Residente" required>
				<ResidentSelector :model-value="form.residentId || ''" @update:model-value="v => (form.residentId = v)"
					placeholder="Buscar residente..." required :error="error || undefined" />
			</FormField>

			<FormField label="Nombre del Medicamento" required>
				<Input :model-value="form.name || ''" @update:model-value="v => (form.name = String(v))" type="text" required
					placeholder="Ej: Paracetamol" />
			</FormField>

			<FormField label="Dosis" required>
				<Input :model-value="form.dosage || ''" @update:model-value="v => (form.dosage = String(v))" type="text"
					required placeholder="Ej: 500mg" />
			</FormField>

			<FormField label="Frecuencia" required hint="Selecciona horarios o usa un preset común">
				<TimeScheduleSelector :model-value="form.frequency || ''" @update:model-value="v => (form.frequency = v)"
					placeholder="Seleccionar horarios..." required />
			</FormField>

			<FormField label="Fecha de Inicio" required>
				<DatePicker v-model="startDateString" required />
			</FormField>

			<FormField label="Fecha de Fin" hint="Opcional, dejar vacío si no tiene fecha de fin">
				<DatePicker v-model="endDateString" :min="startDateString" />
			</FormField>

			<FormField label="Instrucciones" hint="Opcional">
				<Textarea :model-value="form.instructions || ''" @update:model-value="v => (form.instructions = v)" :rows="3"
					placeholder="Instrucciones adicionales para la administración" />
			</FormField>
		</form>

		<template #footer>
			<Button variant="secondary" @click="handleClose">Cancelar</Button>
			<Button variant="primary" :disabled="!isFormValid || isLoading" :loading="isLoading" @click="handleSubmit">
				Guardar
			</Button>
		</template>
	</Modal>
</template>

<style scoped>
.medication-form {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}
</style>
