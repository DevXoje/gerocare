<script setup lang="ts">
import { computed, watch } from 'vue'

import { useActivityLogForm } from '@/business/activity-logs/app/useActivityLogForm'
import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import { Button, DatePicker, FormField, Input, Select, Textarea } from '@design-system/atoms'
import { Modal } from '@design-system/organisms'

interface Props {
	modelValue: boolean
	residentId?: string
	activityLogId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	submit: []
	close: []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm, loadActivityLogToForm } =
	useActivityLogForm()

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

// Load activity log if editing
watch(
	() => props.activityLogId,
	newId => {
		if (newId && props.modelValue) {
			loadActivityLogToForm(newId)
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
const timestampString = computed<string>({
	get: (): string => {
		const timestamp = form.value.timestamp
		if (!timestamp) return new Date().toISOString().split('T')[0]!
		if (typeof timestamp === 'string') return timestamp
		if (timestamp instanceof Date) {
			return timestamp.toISOString().split('T')[0]!
		}
		return new Date().toISOString().split('T')[0]!
	},
	set: (value: string) => {
		form.value.timestamp = new Date(value)
	},
})

const activityTypes = [
	{ value: 'hygiene', label: 'Higiene' },
	{ value: 'mobility', label: 'Movilidad' },
	{ value: 'nutrition', label: 'Nutrición' },
	{ value: 'medication', label: 'Medicación' },
	{ value: 'social', label: 'Social' },
	{ value: 'other', label: 'Otro' },
]

const statuses = [
	{ value: 'completed', label: 'Completada' },
	{ value: 'partial', label: 'Parcial' },
	{ value: 'skipped', label: 'Omitida' },
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
	<Modal :model-value="modelValue" :title="activityLogId ? 'Editar Actividad' : 'Registrar Actividad'" size="md"
		@update:model-value="handleClose" @close="handleClose">
		<form class="activity-log-form" @submit.prevent="handleSubmit">
			<FormField v-if="!residentId" label="Residente ID" required>
				<Input :model-value="form.residentId || ''" @update:model-value="v => (form.residentId = String(v))"
					type="text" required placeholder="ID del residente" :error="error || undefined" />
			</FormField>

			<FormField label="Tipo de Actividad" required>
				<Select :model-value="form.activityType || 'other'"
					@update:model-value="v => (form.activityType = v as ActivityLog['activityType'])"
					:options="activityTypes" required />
			</FormField>

			<FormField label="Título" required>
				<Input :model-value="form.title || ''" @update:model-value="v => (form.title = String(v))" type="text"
					required placeholder="Título de la actividad" />
			</FormField>

			<FormField label="Descripción" required>
				<Textarea :model-value="form.description || ''" @update:model-value="v => (form.description = v)"
					:rows="3" required placeholder="Descripción detallada de la actividad realizada" />
			</FormField>

			<FormField label="Fecha y Hora" required>
				<DatePicker v-model="timestampString" required />
			</FormField>

			<FormField label="Duración (minutos)" hint="Opcional">
				<Input :model-value="form.duration?.toString() || ''" @update:model-value="
					v => (form.duration = typeof v === 'number' ? v : v ? Number(v) : undefined)
				" type="number" min="1" placeholder="Ej: 30" />
			</FormField>

			<FormField label="Estado" required>
				<Select :model-value="form.status || 'completed'"
					@update:model-value="v => (form.status = v as ActivityLog['status'])" :options="statuses"
					required />
			</FormField>

			<FormField label="Notas" hint="Opcional">
				<Textarea :model-value="form.notes || ''" @update:model-value="v => (form.notes = v || undefined)"
					:rows="2" placeholder="Notas adicionales u observaciones" />
			</FormField>

			<div v-if="error" class="activity-log-form__error">{{ error }}</div>

			<div class="activity-log-form__actions">
				<Button variant="secondary" type="button" @click="handleClose">Cancelar</Button>
				<Button variant="primary" type="submit" :disabled="!isFormValid || isLoading" :loading="isLoading">
					{{ activityLogId ? 'Actualizar' : 'Registrar' }}
				</Button>
			</div>
		</form>
	</Modal>
</template>

<style scoped>
.activity-log-form {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.activity-log-form__error {
	padding: var(--spacing-md);
	background: var(--color-error-background);
	color: var(--color-error);
	border-radius: var(--border-radius-md);
	font-size: var(--font-size-sm);
}

.activity-log-form__actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--spacing-md);
	margin-top: var(--spacing-md);
}
</style>
