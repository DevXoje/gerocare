<script setup lang="ts">
import { computed, onMounted } from 'vue'

import Card from '@/business/common/presentation/atoms/Card.vue'
import StatCard from '@/business/common/presentation/molecules/StatCard.vue'
import Table from '@/business/common/presentation/organisms/Table.vue'
import { useReports } from '@/business/reports/app/useReports'

const { summaryCards, stats, incidentStats, isLoading, loadReports } = useReports()

onMounted(async () => {
	await loadReports()
})

const incidentTypeColumns = [
	{ key: 'type', label: 'Tipo de Incidencia' },
	{ key: 'count', label: 'Cantidad' },
]

const incidentTypeRows = computed(() => {
	const typeLabels: Record<string, string> = {
		fall: 'Caída',
		injury: 'Lesión',
		'medication-error': 'Error de Medicación',
		behavioral: 'Conductual',
		medical: 'Médico',
		other: 'Otro',
	}

	return Object.entries(incidentStats.value.byType).map(([type, count]) => ({
		type: typeLabels[type] || type,
		count,
	}))
})

const incidentSeverityColumns = [
	{ key: 'severity', label: 'Severidad' },
	{ key: 'count', label: 'Cantidad' },
]

const incidentSeverityRows = computed(() => {
	const severityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
		critical: 'Crítica',
	}

	return Object.entries(incidentStats.value.bySeverity).map(([severity, count]) => ({
		severity: severityLabels[severity] || severity,
		count,
	}))
})
</script>

<template>
	<div class="reports-page">
		<div class="reports-page__header">
			<h1 class="reports-page__title">Reportes y Estadísticas</h1>
		</div>

		<div v-if="isLoading" class="reports-page__loading">
			<p>Cargando reportes...</p>
		</div>

		<div v-else class="reports-page__content">
			<!-- Summary Cards -->
			<div class="reports-page__summary">
				<StatCard
					v-for="(card, index) in summaryCards"
					:key="index"
					:value="card.value"
					:label="card.label"
					:icon="card.icon"
					:variant="card.variant"
				/>
			</div>

			<!-- Detailed Stats -->
			<div class="reports-page__sections">
				<!-- Incidents Statistics -->
				<Card variant="elevated" padding="lg" class="reports-page__section">
					<h2 class="reports-section__title">Estadísticas de Incidencias</h2>

					<div class="reports-section__content">
						<div class="reports-section__table">
							<h3 class="reports-section__subtitle">Por Tipo</h3>
							<Table :columns="incidentTypeColumns" :data="incidentTypeRows" />
						</div>

						<div class="reports-section__table">
							<h3 class="reports-section__subtitle">Por Severidad</h3>
							<Table :columns="incidentSeverityColumns" :data="incidentSeverityRows" />
						</div>
					</div>
				</Card>

				<!-- Overall Statistics -->
				<Card variant="elevated" padding="lg" class="reports-page__section">
					<h2 class="reports-section__title">Resumen General</h2>

					<div class="reports-section__grid">
						<div class="reports-stat-item">
							<span class="reports-stat-item__label">Residentes Totales</span>
							<span class="reports-stat-item__value">{{ stats.residents.total }}</span>
						</div>

						<div class="reports-stat-item">
							<span class="reports-stat-item__label">Medicaciones Activas</span>
							<span class="reports-stat-item__value">{{ stats.medications.active }}</span>
						</div>

						<div class="reports-stat-item">
							<span class="reports-stat-item__label">PAI Activos</span>
							<span class="reports-stat-item__value">{{ stats.carePlans.active }}</span>
						</div>

						<div class="reports-stat-item">
							<span class="reports-stat-item__label">Incidencias Resueltas</span>
							<span class="reports-stat-item__value">{{ stats.incidents.resolved }}</span>
						</div>

						<div class="reports-stat-item">
							<span class="reports-stat-item__label">Turnos Completados</span>
							<span class="reports-stat-item__value">{{ stats.shifts.completed }}</span>
						</div>

						<div class="reports-stat-item">
							<span class="reports-stat-item__label">Incidencias Críticas</span>
							<span class="reports-stat-item__value reports-stat-item__value--critical">
								{{ stats.incidents.critical }}
							</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</div>
</template>

<style scoped>
.reports-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
	padding: var(--spacing-xl);
	max-width: 1400px;
	margin: 0 auto;
}

.reports-page__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-lg);
}

.reports-page__title {
	margin: 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
}

.reports-page__loading {
	padding: var(--spacing-2xl);
	text-align: center;
	color: var(--color-text-secondary);
}

.reports-page__content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}

.reports-page__summary {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
}

.reports-page__sections {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}

.reports-page__section {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.reports-section__title {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.reports-section__content {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: var(--spacing-xl);
}

.reports-section__table {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.reports-section__subtitle {
	margin: 0;
	font-size: var(--font-size-base);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-secondary);
}

.reports-section__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
}

.reports-stat-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	padding: var(--spacing-md);
	background: var(--color-bg-secondary);
	border-radius: var(--radius-md);
}

.reports-stat-item__label {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	font-weight: var(--font-weight-medium);
}

.reports-stat-item__value {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
}

.reports-stat-item__value--critical {
	color: var(--token-color-error-600);
}
</style>
