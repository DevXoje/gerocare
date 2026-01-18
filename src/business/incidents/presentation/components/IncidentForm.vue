<script setup lang="ts">
import { computed, watch } from 'vue'

import Button from '@/business/common/presentation/atoms/Button.vue'
import DatePicker from '@/business/common/presentation/atoms/DatePicker.vue'
import FormField from '@/business/common/presentation/atoms/FormField.vue'
import Input from '@/business/common/presentation/atoms/Input.vue'
import Select from '@/business/common/presentation/atoms/Select.vue'
import Textarea from '@/business/common/presentation/atoms/Textarea.vue'
import Modal from '@/business/common/presentation/organisms/Modal.vue'
import { useIncidentForm } from '@/business/incidents/app/useIncidentForm'

interface Props {
	modelValue: boolean
	residentId?: string
	incidentId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	submit: []
	close: []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm } = useIncidentForm()

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
const incidentDateString = computed<string>({
	get: (): string => {
		const incidentDate = form.value.incidentDate
		if (!incidentDate) return new Date().toISOString().split('T')[0]!
		if (typeof incidentDate === 'string') return incidentDate
		if (incidentDate instanceof Date) {
			return incidentDate.toISOString().split('T')[0]!
		}
		return new Date().toISOString().split('T')[0]!
	},
	set: (value: string) => {
		form.value.incidentDate = new Date(value)
	},
})

const types = [
	{ value: 'fall', label: 'Caída' },
	{ value: 'injury', label: 'Lesión' },
	{ value: 'medication-error', label: 'Error de Medicación' },
	{ value: 'behavioral', label: 'Conductual' },
	{ value: 'medical', label: 'Médico' },
	{ value: 'other', label: 'Otro' },
]

const severities = [
	{ value: 'low', label: 'Baja' },
	{ value: 'medium', label: 'Media' },
	{ value: 'high', label: 'Alta' },
	{ value: 'critical', label: 'Crítica' },
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
	<Modal
		:model-value="modelValue"
		title="Registrar Incidencia"
		size="md"
		@update:model-value="handleClose"
		@close="handleClose"
	>
		<form class="incident-form" @submit.prevent="handleSubmit">
			<FormField v-if="!residentId" label="Residente ID" required>
				<Input
					:model-value="form.residentId || ''"
					@update:model-value="v => (form.residentId = v)"
					type="text"
					required
					placeholder="ID del residente"
					:error="error || undefined"
				/>
			</FormField>

			<FormField label="Tipo de Incidencia" required>
				<Select
					:model-value="form.type || 'other'"
					@update:model-value="v => (form.type = String(v))"
					:options="types"
					required
				/>
			</FormField>

			<FormField label="Severidad" required>
				<Select
					:model-value="form.severity || 'medium'"
					@update:model-value="v => (form.severity = v)"
					:options="severities"
					required
				/>
			</FormField>

			<FormField label="Descripción" required>
				<Textarea
					:model-value="form.description || ''"
					@update:model-value="v => (form.description = v)"
					:rows="3"
					required
					placeholder="Descripción detallada de la incidencia"
				/>
			</FormField>

			<FormField label="Ubicación" hint="Opcional">
				<Input
					:model-value="form.location || ''"
					@update:model-value="v => (form.location = v || undefined)"
					type="text"
					placeholder="Ej: Habitación 101, Pasillo principal"
				/>
			</FormField>

			<FormField label="Fecha y Hora del Incidente" required>
				<DatePicker v-model="incidentDateString" required />
			</FormField>
		</form>

		<template #footer>
			<Button variant="secondary" @click="handleClose">Cancelar</Button>
			<Button
				variant="primary"
				:disabled="!isFormValid || isLoading"
				:loading="isLoading"
				@click="handleSubmit"
			>
				Registrar
			</Button>
		</template>
	</Modal>
</template>

<style scoped>
.incident-form {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}
</style>
