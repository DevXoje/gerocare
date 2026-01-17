<script setup lang="ts">
import { computed } from 'vue'
import type { Resident } from '../../domain/Resident'
import { calculateAge } from '../../domain/Resident'

interface Props {
  resident: Resident | null
  isLoading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
})

const age = computed(() => {
  if (!props.resident) return 0
  return calculateAge(props.resident.dateOfBirth)
})

const fullName = computed(() => {
  if (!props.resident) return ''
  return `${props.resident.firstName} ${props.resident.lastName}`
})
</script>

<template>
  <div class="resident-detail">
    <div v-if="isLoading" class="loading-state">
      <p>Cargando información del residente...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="!resident" class="empty-state">
      <p>Residente no encontrado</p>
    </div>

    <div v-else class="resident-content">
      <div class="resident-header">
        <div class="resident-avatar-large">
          <img
            v-if="resident.photoURL"
            :src="resident.photoURL"
            :alt="fullName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            {{ resident.firstName[0] }}{{ resident.lastName[0] }}
          </div>
        </div>
        <div class="resident-header-info">
          <h1 class="resident-name-large">{{ fullName }}</h1>
          <p class="resident-age-large">{{ age }} años</p>
        </div>
      </div>

      <div class="resident-sections">
        <section class="info-section">
          <h2>Información Personal</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fecha de Nacimiento:</span>
              <span class="info-value">{{ resident.dateOfBirth.toLocaleDateString() }}</span>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>Información Médica</h2>
          <div class="info-grid">
            <div v-if="resident.medicalInfo.allergies.length > 0" class="info-item">
              <span class="info-label">Alergias:</span>
              <span class="info-value">{{ resident.medicalInfo.allergies.join(', ') }}</span>
            </div>
            <div v-if="resident.medicalInfo.chronicConditions.length > 0" class="info-item">
              <span class="info-label">Condiciones Crónicas:</span>
              <span class="info-value">{{ resident.medicalInfo.chronicConditions.join(', ') }}</span>
            </div>
            <div v-if="resident.medicalInfo.medications.length > 0" class="info-item">
              <span class="info-label">Medicaciones:</span>
              <span class="info-value">{{ resident.medicalInfo.medications.join(', ') }}</span>
            </div>
            <div v-if="resident.medicalInfo.dietaryRestrictions.length > 0" class="info-item">
              <span class="info-label">Restricciones Dietéticas:</span>
              <span class="info-value">{{ resident.medicalInfo.dietaryRestrictions.join(', ') }}</span>
            </div>
          </div>
        </section>

        <section v-if="resident.emergencyContacts.length > 0" class="info-section">
          <h2>Contactos de Emergencia</h2>
          <div class="contacts-list">
            <div
              v-for="(contact, index) in resident.emergencyContacts"
              :key="index"
              class="contact-item"
            >
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-relationship">{{ contact.relationship }}</div>
              <div class="contact-phone">{{ contact.phone }}</div>
              <div v-if="contact.email" class="contact-email">{{ contact.email }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resident-detail {
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

.resident-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.resident-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.resident-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 2.5rem;
  font-weight: 600;
  color: #6b7280;
}

.resident-header-info {
  flex: 1;
}

.resident-name-large {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
}

.resident-age-large {
  margin: 0;
  font-size: 1.125rem;
  color: #6b7280;
}

.resident-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-value {
  color: #111827;
  font-size: 1rem;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.contact-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.contact-relationship {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.contact-phone,
.contact-email {
  color: #111827;
  font-size: 0.875rem;
}
</style>

