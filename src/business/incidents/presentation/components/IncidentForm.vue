<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button, DatePicker, FormField, Input, Select, Textarea } from '@design-system/atoms'
import { ResidentSelector } from '@design-system/molecules'
import { Modal } from '@design-system/organisms'
import { useIncidentForm } from '@/business/incidents/app/useIncidentForm'
import type { Incident } from '@/business/incidents/domain/Incident'

// Plantillas de descripción por tipo de incidencia
const descriptionTemplates: Record<Incident['type'], string[]> = {
	fall: [
		'Residente se cayó mientras [descripción]. No se observaron lesiones visibles. Se evaluó y se aplicaron medidas preventivas.',
		'Caída reportada en [ubicación]. Residente fue asistido inmediatamente. Se realizó evaluación médica. Estado: estable.',
		'Incidente de caída. El residente perdió el equilibrio al [acción]. No hubo impacto en la cabeza. Supervisión aumentada.',
	],
	injury: [
		'Lesión observada en [parte del cuerpo]. Se aplicó primeros auxilios. Se contactó con el médico para evaluación.',
		'Herida superficial en [ubicación]. Limpiada y vendada. Estado actual: estable. Se monitoreará durante las próximas horas.',
		'Lesión reportada durante [actividad]. Tipo: [tipo de lesión]. Se realizó curación y se documentó para seguimiento.',
	],
	'medication-error': [
		'Error en administración de medicación: [medicamento]. Se administró dosis incorrecta/medicamento incorrecto. Acción tomada: [medidas].',
		'Medicación administrada fuera de horario. Medicamento: [nombre]. Hora correcta: [hora]. Se notificó al supervisor.',
		'Omisión de dosis de [medicamento]. Razón: [motivo]. Se reprogramó administración. Supervisor notificado.',
	],
	behavioral: [
		'Comportamiento alterado: [descripción del comportamiento]. Se intentó calmar con [método]. Residente se tranquilizó. Se documentó para seguimiento.',
		'Episodio de agitación. Residente mostró [comportamiento específico]. Se aplicaron técnicas de desescalación. Resultado: calmado.',
		'Cambio significativo en comportamiento. Observado: [comportamiento]. Antecedentes: [contexto]. Se notificó al equipo médico.',
	],
	medical: [
		'Episodio médico reportado: [síntoma/condición]. Signos vitales tomados. Estado: [descripción]. Médico notificado.',
		'Cambio en estado de salud observado. Síntomas: [lista]. Se contactó con el personal médico. Esperando evaluación.',
		'Condición médica detectada. Residente presentó [síntomas]. Acciones tomadas: [medidas]. Seguimiento programado.',
	],
	other: [
		'[Descripción detallada del incidente]. Circunstancias: [contexto]. Acciones tomadas: [medidas]. Resultado: [estado final].',
		'Incidente reportado: [tipo]. Descripción: [detalles]. Ubicación: [lugar]. Personas involucradas: [si aplica].',
	],
}

const showTemplates = ref(false)

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
		const currentDate = form.value.incidentDate || new Date()
		const date = new Date(value)
		// Preserve time when updating date
		if (currentDate instanceof Date) {
			date.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds())
		}
		form.value.incidentDate = date
	},
})

// Convert Date to time string for time input
const incidentTimeString = computed<string>({
	get: (): string => {
		const incidentDate = form.value.incidentDate
		if (!incidentDate) return new Date().toTimeString().slice(0, 5) // HH:mm format
		if (incidentDate instanceof Date) {
			const hours = incidentDate.getHours().toString().padStart(2, '0')
			const minutes = incidentDate.getMinutes().toString().padStart(2, '0')
			return `${hours}:${minutes}`
		}
		return new Date().toTimeString().slice(0, 5)
	},
	set: (value: string) => {
		const currentDate = form.value.incidentDate || new Date()
		// Parse time string (HH:mm)
		const [hours, minutes] = value.split(':').map(Number)
		const date = currentDate instanceof Date ? new Date(currentDate) : new Date()
		date.setHours(hours || 0, minutes || 0, 0, 0)
		form.value.incidentDate = date
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

// Plantillas disponibles para el tipo seleccionado
const availableTemplates = computed(() => {
	const type = form.value.type || 'other'
	return descriptionTemplates[type] || []
})

// Usar plantilla seleccionada
const useTemplate = (template: string) => {
	form.value.description = template
	showTemplates.value = false
}

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
	<Modal :model-value="modelValue" title="Registrar Incidencia" size="md" @update:model-value="handleClose"
		@close="handleClose">
		<form class="incident-form" @submit.prevent="handleSubmit">
			<FormField v-if="!residentId" label="Residente" required>
				<ResidentSelector :model-value="form.residentId || ''" @update:model-value="v => (form.residentId = v)"
					placeholder="Buscar residente..." required :error="error || undefined" />
			</FormField>

			<FormField label="Tipo de Incidencia" required>
				<Select :model-value="form.type || 'other'" @update:model-value="v => (form.type = v as Incident['type'])"
					:options="types" required />
			</FormField>

			<FormField label="Severidad" required>
				<Select :model-value="form.severity || 'medium'"
					@update:model-value="v => (form.severity = v as Incident['severity'])" :options="severities" required />
			</FormField>

			<FormField label="Descripción" required>
				<div class="description-field">
					<div class="description-field__actions">
						<Button v-if="availableTemplates.length > 0" variant="outline" size="sm" type="button"
							@click="showTemplates = !showTemplates">
							{{ showTemplates ? 'Ocultar' : 'Usar' }} plantillas
						</Button>
					</div>

					<div v-if="showTemplates && availableTemplates.length > 0" class="description-field__templates">
						<p class="description-field__templates-title">Plantillas disponibles:</p>
						<div class="description-field__templates-list">
							<button v-for="(template, index) in availableTemplates" :key="index" type="button"
								class="description-field__template-item" @click="useTemplate(template)">
								{{ template }}
							</button>
						</div>
					</div>

					<Textarea :model-value="form.description || ''" @update:model-value="v => (form.description = String(v))"
						:rows="3" required placeholder="Descripción detallada de la incidencia" />
				</div>
			</FormField>

			<FormField label="Ubicación" hint="Opcional">
				<Input :model-value="form.location || ''" @update:model-value="v => (form.location = v ? String(v) : undefined)"
					type="text" placeholder="Ej: Habitación 101, Pasillo principal" />
			</FormField>

			<FormField label="Fecha y Hora del Incidente" required>
				<div class="datetime-field">
					<DatePicker v-model="incidentDateString" required placeholder="Seleccionar fecha" />
					<Input :model-value="incidentTimeString" @update:model-value="v => (incidentTimeString = String(v))"
						type="time" required placeholder="HH:mm" class="datetime-field__time" />
				</div>
			</FormField>
		</form>

		<template #footer>
			<Button variant="secondary" @click="handleClose">Cancelar</Button>
			<Button variant="primary" :disabled="!isFormValid || isLoading" :loading="isLoading" @click="handleSubmit">
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

.description-field {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
}

.description-field__actions {
	display: flex;
	justify-content: flex-end;
}

.description-field__templates {
	margin-bottom: var(--spacing-sm);
	padding: var(--spacing-md);
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
}

.description-field__templates-title {
	margin: 0 0 var(--spacing-sm) 0;
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.description-field__templates-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.description-field__template-item {
	padding: var(--spacing-sm) var(--spacing-md);
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-sm);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	text-align: left;
	cursor: pointer;
	transition: all var(--transition-base);
}

.description-field__template-item:hover {
	background-color: var(--color-bg-hover);
	border-color: var(--color-border-hover);
	color: var(--color-text-link);
}

.datetime-field {
	display: flex;
	gap: var(--spacing-md);
	align-items: flex-start;
}

.datetime-field__time {
	flex-shrink: 0;
	min-width: 120px;
}
</style>
