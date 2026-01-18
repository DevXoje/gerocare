<script setup lang="ts">
import { computed } from 'vue'

import Badge from '@/business/common/presentation/atoms/Badge.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import EmptyState from '@/business/common/presentation/atoms/EmptyState.vue'
import Skeleton from '@/business/common/presentation/atoms/Skeleton.vue'

import type { Incident } from '../../domain/Incident'
import { getSeverityDisplayName, getStatusDisplayName, getTypeDisplayName } from '../../domain/Incident'

interface Props {
  incidents: Incident[]
  isLoading?: boolean
  error?: string | null
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  clickable: false,
})

const emit = defineEmits<{
  'incident-click': [incident: Incident]
}>()

const getSeverityVariant = (severity: Incident['severity']): 'default' | 'primary' | 'warning' | 'error' => {
  const map: Record<Incident['severity'], 'default' | 'primary' | 'warning' | 'error'> = {
    low: 'default',
    medium: 'primary',
    high: 'warning',
    critical: 'error',
  }
  return map[severity]
}

const getStatusVariant = (status: Incident['status']): 'default' | 'primary' | 'success' | 'warning' => {
  const map: Record<Incident['status'], 'default' | 'primary' | 'success' | 'warning'> = {
    reported: 'warning',
    'in-progress': 'primary',
    resolved: 'success',
    closed: 'default',
  }
  return map[status]
}

const handleClick = (incident: Incident) => {
  if (props.clickable) {
    emit('incident-click', incident)
  }
}
</script>

<template>
  <div class="incident-list">
    <div v-if="isLoading" class="incident-list__skeleton">
      <Skeleton v-for="i in 3" :key="i" variant="rectangular" height="150px" />
    </div>

    <EmptyState v-else-if="!error && incidents.length === 0" title="No hay incidencias"
      description="No se encontraron incidencias registradas." icon="⚠️" />

    <div v-else-if="error" class="incident-list__error">{{ error }}</div>

    <div v-else class="incident-list__items">
      <Card v-for="incident in incidents" :key="incident.id" variant="elevated" padding="lg" :clickable="clickable"
        class="incident-list__item" @click="handleClick(incident)">
        <div class="incident-item">
          <div class="incident-item__header">
            <h3 class="incident-item__title">{{ getTypeDisplayName(incident.type) }}</h3>
            <div class="incident-item__badges">
              <Badge :variant="getStatusVariant(incident.status)" size="sm">
                {{ getStatusDisplayName(incident.status) }}
              </Badge>
              <Badge :variant="getSeverityVariant(incident.severity)" size="sm">
                {{ getSeverityDisplayName(incident.severity) }}
              </Badge>
            </div>
          </div>

          <div class="incident-item__meta">
            <span class="incident-item__date">
              {{ incident.incidentDate.toLocaleDateString() }} - {{ incident.incidentDate.toLocaleTimeString() }}
            </span>
            <span v-if="incident.location" class="incident-item__location">📍 {{ incident.location }}</span>
          </div>

          <p class="incident-item__description">{{ incident.description }}</p>

          <div v-if="incident.resolvedAt" class="incident-item__resolution">
            <span class="incident-item__resolved-date">
              Resuelto: {{ incident.resolvedAt.toLocaleDateString() }}
            </span>
            <span v-if="incident.resolutionNotes" class="incident-item__resolution-notes">
              Notas: {{ incident.resolutionNotes }}
            </span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.incident-list {
  width: 100%;
}

.incident-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.incident-list__error {
  padding: var(--spacing-xl);
  color: var(--color-border-error);
  text-align: center;
  font-size: var(--font-size-sm);
}

.incident-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.incident-list__item {
  transition: transform var(--transition-base);
}

.incident-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.incident-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.incident-item__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  flex: 1;
}

.incident-item__badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.incident-item__meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.incident-item__date {
  font-weight: var(--font-weight-medium);
}

.incident-item__location {
  font-weight: var(--font-weight-medium);
}

.incident-item__description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

.incident-item__resolution {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-default);
}

.incident-item__resolved-date {
  font-size: var(--font-size-xs);
  color: var(--token-color-success-600);
  font-weight: var(--font-weight-medium);
}

.incident-item__resolution-notes {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
