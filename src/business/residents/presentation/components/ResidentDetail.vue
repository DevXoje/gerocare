<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCarePlans } from '@/business/care-plans/app/useCarePlans'
import CarePlanList from '@/business/care-plans/presentation/components/CarePlanList.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import Skeleton from '@/business/common/presentation/atoms/Skeleton.vue'
import Tabs from '@/business/common/presentation/molecules/Tabs.vue'
import { useIncidents } from '@/business/incidents/app/useIncidents'
import IncidentList from '@/business/incidents/presentation/components/IncidentList.vue'
import { useMedication } from '@/business/medication/app/useMedication'
import MedicationList from '@/business/medication/presentation/components/MedicationList.vue'

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

const activeTab = ref('overview')

const age = computed(() => {
  if (!props.resident) return 0
  return calculateAge(props.resident.dateOfBirth)
})

const fullName = computed(() => {
  if (!props.resident) return ''
  return `${props.resident.firstName} ${props.resident.lastName}`
})

// Load related data when resident changes
const { carePlans, isLoading: isLoadingCarePlans, loadCarePlans } = useCarePlans()
const { incidents, isLoading: isLoadingIncidents, loadIncidents } = useIncidents()
const { medications, isLoading: isLoadingMedications, loadMedications } = useMedication()

watch(
  () => props.resident?.id,
  (residentId) => {
    if (residentId) {
      loadMedications(residentId)
      loadCarePlans(residentId)
      loadIncidents(residentId)
    }
  },
  { immediate: true }
)

const tabs = [
  { id: 'overview', label: 'Información General' },
  { id: 'medication', label: 'Medicación' },
  { id: 'care-plans', label: 'PAI' },
  { id: 'incidents', label: 'Incidencias' },
]

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}
</script>

<template>
  <div class="resident-detail">
    <div v-if="isLoading" class="loading-state">
      <Skeleton variant="rectangular" height="200px" />
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
          <div class="avatar-placeholder">
            {{ resident.firstName[0] }}{{ resident.lastName[0] }}
          </div>
        </div>
        <div class="resident-header-info">
          <h1 class="resident-name-large">{{ fullName }}</h1>
          <p class="resident-age-large">{{ age }} años</p>
        </div>
      </div>

      <Card variant="elevated" padding="md">
        <Tabs :model-value="activeTab" :tabs="tabs" @change="handleTabChange" />

        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-panel">
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
                  <div v-if="resident.medicalInfo.allergies && resident.medicalInfo.allergies.length > 0" class="info-item">
                    <span class="info-label">Alergias:</span>
                    <span class="info-value">{{ resident.medicalInfo.allergies.join(', ') }}</span>
                  </div>
                  <div v-if="resident.medicalInfo.chronicConditions && resident.medicalInfo.chronicConditions.length > 0" class="info-item">
                    <span class="info-label">Condiciones Crónicas:</span>
                    <span class="info-value">{{ resident.medicalInfo.chronicConditions.join(', ') }}</span>
                  </div>
                  <div v-if="resident.medicalInfo.medications && resident.medicalInfo.medications.length > 0" class="info-item">
                    <span class="info-label">Medicaciones:</span>
                    <span class="info-value">{{ resident.medicalInfo.medications.join(', ') }}</span>
                  </div>
                  <div v-if="resident.medicalInfo.dietaryRestrictions && resident.medicalInfo.dietaryRestrictions.length > 0" class="info-item">
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

          <!-- Medication Tab -->
          <div v-if="activeTab === 'medication'" class="tab-panel">
            <MedicationList
              :medications="medications"
              :is-loading="isLoadingMedications"
              :error="null"
              clickable
            />
          </div>

          <!-- Care Plans Tab -->
          <div v-if="activeTab === 'care-plans'" class="tab-panel">
            <CarePlanList
              :care-plans="carePlans"
              :is-loading="isLoadingCarePlans"
              :error="null"
              clickable
            />
          </div>

          <!-- Incidents Tab -->
          <div v-if="activeTab === 'incidents'" class="tab-panel">
            <IncidentList
              :incidents="incidents"
              :is-loading="isLoadingIncidents"
              :error="null"
              clickable
            />
          </div>
        </div>
      </Card>
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
  color: var(--color-text-secondary);
}

.error-message {
  color: var(--token-color-error-600);
}

.resident-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.resident-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: var(--spacing-xl);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
}

.resident-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  font-size: 2.5rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.resident-header-info {
  flex: 1;
}

.resident-name-large {
  margin: 0 0 0.5rem 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.resident-age-large {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.tab-content {
  margin-top: var(--spacing-xl);
}

.tab-panel {
  min-height: 400px;
}

.resident-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section h2 {
  margin: 0 0 1rem 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.contact-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.contact-relationship {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 0.5rem;
}

.contact-phone,
.contact-email {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
</style>
