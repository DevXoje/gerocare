<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/business/common/presentation/atoms/Button.vue'
import AppDatePicker from '@/business/common/presentation/atoms/DatePicker.vue'
import AppFormField from '@/business/common/presentation/atoms/FormField.vue'
import AppInput from '@/business/common/presentation/atoms/Input.vue'
import { useNotifications } from '@/shared/composables/useNotifications'

import { useResidentForm } from '../../app/useResidentForm'
import { useResidents } from '../../app/useResidents'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { form, validate, reset } = useResidentForm()
const { createResident, isLoading } = useResidents()
const { error, success } = useNotifications()

const errors = ref<Record<string, string>>({})

const handleSubmit = async () => {
  errors.value = {}

  const validation = validate()
  if (!validation.success) {
    errors.value.general = validation.error
    error(validation.error, 5000)
    return
  }

  // Convert date string to Date object
  const residentData = {
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    dateOfBirth: form.value.dateOfBirth!,
    medicalInfo: {
      allergies: form.value.medicalInfo.allergies || [],
      chronicConditions: form.value.medicalInfo.chronicConditions || [],
      medications: form.value.medicalInfo.medications || [],
      dietaryRestrictions: form.value.medicalInfo.dietaryRestrictions || [],
    },
    emergencyContacts: form.value.emergencyContacts || [],
    assignedCaregivers: form.value.assignedCaregivers || [],
  }

  const result = await createResident(residentData)

  if (result.success) {
    success('Residente creado exitosamente', 5000)
    reset()
    emit('success')
  } else {
    error(result.error.message ?? 'Error al crear el residente', 5000)
  }
}

const handleCancel = () => {
  reset()
  dateValue.value = ''
  emit('cancel')
}

const dateValue = ref('')

const handleDateChange = (value: string) => {
  dateValue.value = value
  if (value) {
    form.value.dateOfBirth = new Date(value)
  } else {
    form.value.dateOfBirth = undefined
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="resident-form">
    <div class="resident-form__header">
      <h2 class="resident-form__title">Nuevo Residente</h2>
    </div>

    <div class="resident-form__body">
      <AppFormField label="Nombre" required :error="errors.firstName">
        <AppInput v-model="form.firstName" placeholder="Ingrese el nombre" required />
      </AppFormField>

      <AppFormField label="Apellido" required :error="errors.lastName">
        <AppInput v-model="form.lastName" placeholder="Ingrese el apellido" required />
      </AppFormField>

      <AppFormField label="Fecha de Nacimiento" required :error="errors.dateOfBirth">
        <AppDatePicker :model-value="dateValue" placeholder="Seleccione la fecha de nacimiento" required
          :max="new Date().toISOString().split('T')[0]" @update:model-value="handleDateChange" />
      </AppFormField>

      <div v-if="errors.general" class="resident-form__error">
        {{ errors.general }}
      </div>
    </div>

    <div class="resident-form__actions">
      <AppButton type="button" variant="outline" @click="handleCancel" :disabled="isLoading">
        Cancelar
      </AppButton>
      <AppButton type="submit" :loading="isLoading" :disabled="isLoading">
        Crear Residente
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.resident-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
}

.resident-form__header {
  margin-bottom: 0.5rem;
}

.resident-form__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.resident-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.resident-form__error {
  padding: var(--spacing-md);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-border-error);
  border-radius: var(--radius-md);
  color: var(--color-border-error);
  font-size: var(--font-size-sm);
}

.resident-form__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-default);
}

@media (max-width: 768px) {
  .resident-form {
    padding: 1.5rem;
  }

  .resident-form__actions {
    flex-direction: column-reverse;
  }

  .resident-form__actions>* {
    width: 100%;
  }
}
</style>
