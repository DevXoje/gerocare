<script setup lang="ts">
import { computed, watch } from 'vue'

import { Button, DatePicker, FormField, Input, Select, Textarea } from '@/business/common/presentation/atoms'
import { Modal } from '@/business/common/presentation/organisms'
import { useShiftForm } from '@/business/shifts/app/useShiftForm'

interface Props {
	modelValue: boolean
	caregiverId?: string
	shiftId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	submit: []
	close: []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm } = useShiftForm()

// Sync caregiverId from props to form
watch(
	() => props.caregiverId,
	newCaregiverId => {
		if (newCaregiverId) {
			form.value.caregiverId = newCaregiverId
		}
	},
	{ immediate: true }
)

// Reset form when modal closes
watch(
	() => props.modelValue,
	isOpen => {
		if (!isOpen) {
			resetForm()
			if (props.caregiverId) {
				form.value.caregiverId = props.caregiverId
			}
		}
	}
)

// Convert Date to string for DatePicker
const dateString = computed<string>({
	get: (): string => {
		const date = form.value.date
		if (!date) return new Date().toISOString().split('T')[0]!
		if (typeof date === 'string') return date
		if (date instanceof Date) {
			return date.toISOString().split('T')[0]!
		}
		return new Date().toISOString().split('T')[0]!
	},
	set: (value: string) => {
		form.value.date = new Date(value)
	},
})

const types = [
	{ value: 'morning', label: 'Mañana' },
	{ value: 'afternoon', label: 'Tarde' },
	{ value: 'night', label: 'Noche' },
]

const handleClose = () => {
	emit('update:modelValue', false)
	emit('close')
}

const handleSubmit = async () => {
	const result = await submit()
	if (result) {
		emit('submit')
		handleClose()
	}
}
</script>

<template>
	<Modal :model-value="modelValue" title="Programar Turno" size="md" @update:model-value="handleClose"
		@close="handleClose">
		<form class="shift-form" @submit.prevent="handleSubmit">
			<FormField v-if="!caregiverId" label="ID del Cuidador" required>
				<Input :model-value="form.caregiverId || ''" @update:model-value="v => (form.caregiverId = v)"
					type="text" required placeholder="ID del cuidador" :error="error || undefined" />
			</FormField>

			<FormField label="Tipo de Turno" required>
				<Select :model-value="form.type || 'morning'" @update:model-value="v => (form.type = String(v))"
					:options="types" required />
			</FormField>

			<FormField label="Fecha" required>
				<DatePicker v-model="dateString" required />
			</FormField>

			<FormField label="Hora de Inicio" required hint="Formato: HH:MM (ej: 08:00)">
				<Input :model-value="form.startTime || '08:00'" @update:model-value="v => (form.startTime = v)"
					type="time" required placeholder="08:00" />
			</FormField>

			<FormField label="Hora de Fin" required hint="Formato: HH:MM (ej: 16:00)">
				<Input :model-value="form.endTime || '16:00'" @update:model-value="v => (form.endTime = v)" type="time"
					:min="form.startTime || '08:00'" required placeholder="16:00" />
			</FormField>

			<FormField label="Notas" hint="Opcional">
				<Textarea :model-value="form.notes || ''" @update:model-value="v => (form.notes = v || undefined)"
					:rows="3" placeholder="Notas adicionales sobre el turno" />
			</FormField>
		</form>

		<template #footer>
			<Button variant="secondary" @click="handleClose">Cancelar</Button>
			<Button variant="primary" :disabled="!isFormValid || isLoading" :loading="isLoading" @click="handleSubmit">
				Programar
			</Button>
		</template>
	</Modal>
</template>

<style scoped>
.shift-form {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}
</style>
