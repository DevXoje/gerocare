<script setup lang="ts">
import { computed, watch } from 'vue'

import { useCarePlanForm } from '@/business/care-plans/app/useCarePlanForm'
import { Button, DatePicker, FormField, Input, Select, Textarea } from '@/business/common/presentation/atoms'
import { Modal } from '@/business/common/presentation/organisms'

interface Props {
	modelValue: boolean
	residentId?: string
	carePlanId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	submit: []
	close: []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm } = useCarePlanForm()

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
const startDateString = computed<string>({
	get: (): string => {
		const startDate = form.value.startDate
		if (!startDate) return new Date().toISOString().split('T')[0]
		if (typeof startDate === 'string') return startDate
		// Type narrowing: if it's not string and not falsy, it must be Date
		if (startDate instanceof Date) {
			return startDate.toISOString().split('T')[0]!
		}
		return new Date().toISOString().split('T')[0]!
	},
	set: (value: string) => {
		form.value.startDate = new Date(value)
	},
})

const endDateString = computed<string>({
	get: (): string => {
		const endDate = form.value.endDate
		if (!endDate) return ''
		if (typeof endDate === 'string') return endDate
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

const categories = [
	{ value: 'hygiene', label: 'Higiene' },
	{ value: 'nutrition', label: 'Nutrición' },
	{ value: 'mobility', label: 'Movilidad' },
	{ value: 'social', label: 'Social' },
	{ value: 'medical', label: 'Médico' },
	{ value: 'cognitive', label: 'Cognitivo' },
]

const frequencies = [
	{ value: 'daily', label: 'Diario' },
	{ value: 'weekly', label: 'Semanal' },
	{ value: 'biweekly', label: 'Quincenal' },
	{ value: 'monthly', label: 'Mensual' },
	{ value: 'as-needed', label: 'Según necesidad' },
]

const priorities = [
	{ value: 'low', label: 'Baja' },
	{ value: 'medium', label: 'Media' },
	{ value: 'high', label: 'Alta' },
	{ value: 'urgent', label: 'Urgente' },
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
	<Modal :model-value="modelValue" title="Nuevo Plan de Atención Individual (PAI)" size="md"
		@update:model-value="handleClose" @close="handleClose">
		<form class="care-plan-form" @submit.prevent="handleSubmit">
			<FormField v-if="!residentId" label="Residente ID" required>
				<Input :model-value="form.residentId || ''" @update:model-value="v => (form.residentId = v)" type="text"
					required placeholder="ID del residente" :error="error || undefined" />
			</FormField>

			<FormField label="Título" required>
				<Input :model-value="form.title || ''" @update:model-value="v => (form.title = v)" type="text" required
					placeholder="Ej: Higiene diaria" />
			</FormField>

			<FormField label="Descripción" required>
				<Textarea :model-value="form.description || ''" @update:model-value="v => (form.description = v)"
					:rows="3" required placeholder="Descripción detallada del plan de atención" />
			</FormField>

			<FormField label="Categoría" required>
				<Select :model-value="form.category || 'hygiene'" @update:model-value="v => (form.category = String(v))"
					:options="categories" required />
			</FormField>

			<FormField label="Frecuencia" required>
				<Select :model-value="form.frequency || 'daily'" @update:model-value="v => (form.frequency = String(v))"
					:options="frequencies" required />
			</FormField>

			<FormField label="Prioridad" required>
				<Select :model-value="form.priority || 'medium'" @update:model-value="v => (form.priority = v)"
					:options="priorities" required />
			</FormField>

			<FormField label="Fecha de Inicio" required>
				<DatePicker v-model="startDateString" required />
			</FormField>

			<FormField label="Fecha de Fin" hint="Opcional, dejar vacío si no tiene fecha de fin">
				<DatePicker v-model="endDateString" :min="startDateString" />
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
.care-plan-form {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}
</style>
