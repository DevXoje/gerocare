<script setup lang="ts">
import { computed,watch } from 'vue'

import Button from '@/business/common/presentation/atoms/Button.vue'
import DatePicker from '@/business/common/presentation/atoms/DatePicker.vue'
import FormField from '@/business/common/presentation/atoms/FormField.vue'
import Input from '@/business/common/presentation/atoms/Input.vue'
import Textarea from '@/business/common/presentation/atoms/Textarea.vue'
import Modal from '@/business/common/presentation/organisms/Modal.vue'

import { useMedicationForm } from '../../app/useMedicationForm'

interface Props {
  modelValue: boolean
  residentId?: string
  medicationId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': []
  'close': []
}>()

const { form, isLoading, error, isFormValid, submit, resetForm } = useMedicationForm()

// Sync residentId from props to form
watch(
  () => props.residentId,
  (newResidentId) => {
    if (newResidentId) {
      form.value.residentId = newResidentId
    }
  },
  { immediate: true }
)

// Load medication to form if medicationId is provided
watch(
  () => props.medicationId,
  (id) => {
    if (id) {
      // loadMedicationToForm would need to be available
      // For now, we'll handle this in the page component
    }
  }
)

// Reset form when modal closes
watch(
  () => props.modelValue,
  (isOpen) => {
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
    handleClose()
  }
}
</script>

<template>
  <Modal :model-value="modelValue" title="Nueva Medicación" size="md" @update:model-value="handleClose"
    @close="handleClose">
    <form class="medication-form" @submit.prevent="handleSubmit">
      <FormField v-if="!residentId" label="Residente ID" required>
        <Input :model-value="form.residentId || ''" @update:model-value="(v) => form.residentId = v" type="text"
          required placeholder="ID del residente" :error="error || undefined" />
      </FormField>

      <FormField label="Nombre del Medicamento" required>
        <Input :model-value="form.name || ''" @update:model-value="(v) => form.name = v" type="text" required
          placeholder="Ej: Paracetamol" />
      </FormField>

      <FormField label="Dosis" required>
        <Input :model-value="form.dosage || ''" @update:model-value="(v) => form.dosage = v" type="text" required
          placeholder="Ej: 500mg" />
      </FormField>

      <FormField label="Frecuencia" required hint="Ej: 8:00, 14:00, 20:00 o 'diario', 'dos veces al día'">
        <Input :model-value="form.frequency || ''" @update:model-value="(v) => form.frequency = v" type="text" required
          placeholder="Ej: 8:00, 14:00, 20:00" />
      </FormField>

      <FormField label="Fecha de Inicio" required>
        <DatePicker v-model="startDateString" required />
      </FormField>

      <FormField label="Fecha de Fin" hint="Opcional, dejar vacío si no tiene fecha de fin">
        <DatePicker v-model="endDateString" :min="startDateString" />
      </FormField>

      <FormField label="Instrucciones" hint="Opcional">
        <Textarea :model-value="form.instructions || ''" @update:model-value="(v) => form.instructions = v" :rows="3"
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
