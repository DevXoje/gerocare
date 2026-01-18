<script setup lang="ts">
import { useDashboard } from '@/business/dashboard/app/useDashboard'
import QuickActions from '@/business/dashboard/presentation/components/QuickActions.vue'
import RecentActivity from '@/business/dashboard/presentation/components/RecentActivity.vue'
import StatCards from '@/business/dashboard/presentation/components/StatCards.vue'

const { stats, recentActivities, quickActions } = useDashboard()
</script>

<template>
	<div class="dashboard-container">
		<div class="dashboard-content">
			<h1 class="dashboard-title">Dashboard</h1>

			<StatCards :stats="stats" @stat-click="() => {}" />

			<div class="dashboard__grid">
				<div class="dashboard__main">
					<RecentActivity :activities="recentActivities" />
				</div>
				<div class="dashboard__sidebar">
					<QuickActions :actions="quickActions" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.dashboard-container {
	min-height: 100vh;
	width: 100%;
}

.dashboard-content {
	padding: var(--spacing-xl);
	max-width: 1400px;
	margin: 0 auto;
}

.dashboard-title {
	margin: 0 0 var(--spacing-2xl) 0;
	color: var(--color-text-primary);
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
}

.dashboard__grid {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: var(--spacing-xl);
}

@media (max-width: 1024px) {
	.dashboard__grid {
		grid-template-columns: 1fr;
	}
}

.dashboard__main,
.dashboard__sidebar {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
}
</style>
