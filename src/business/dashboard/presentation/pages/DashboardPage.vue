<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import { EmptyState, Input, Skeleton } from '@/business/common/presentation/atoms'
import { IncidentCard, StaffListItem } from '@/business/common/presentation/molecules'
import { BottomNavigation, MobileHeader } from '@/business/common/presentation/organisms'
import { useDashboard } from '@/business/dashboard/app/useDashboard'
import QuickActions from '@/business/dashboard/presentation/components/QuickActions.vue'
import RecentActivity from '@/business/dashboard/presentation/components/RecentActivity.vue'
import StatCards from '@/business/dashboard/presentation/components/StatCards.vue'

const authStore = useAuthStore()

const { stats, recentActivities, quickActions, staffOnDuty, recentIncidents, isLoading } =
	useDashboard()

const userName = computed(() => authStore.user?.displayName || 'Usuario')

const handleMenuClick = () => {
	// TODO: Open sidebar menu
}

const handleSearchChange = () => {
	// TODO: Implement search
}

const bottomNavItems = computed(() => [
	{
		label: 'Home',
		icon: 'dashboard',
		route: '/dashboard',
		active: true,
	},
	{
		label: 'Residents',
		icon: 'groups',
		route: '/residents',
	},
	{
		label: 'Shifts',
		icon: 'calendar_month',
		route: '/shifts',
	},
	{
		label: 'Settings',
		icon: 'settings',
		route: '/settings',
	},
])
</script>

<template>
	<div class="dashboard-container">
		<MobileHeader title="Residencia360" :show-search="false" class="dashboard-header" @menu-click="handleMenuClick"
			@search-change="handleSearchChange" />

		<main class="dashboard-main">
			<div class="dashboard-content">
				<!-- Welcome Section -->
				<div class="dashboard-welcome">
					<p class="dashboard-welcome__greeting">Good Morning,</p>
					<h2 class="dashboard-welcome__name">{{ userName }}</h2>
				</div>

				<!-- Search Bar -->
				<div class="dashboard-search">
					<Input model-value="" type="search" placeholder="Search resident, med, or staff..." variant="search"
						class="dashboard-search__input" />
				</div>

				<!-- KPI Cards -->
				<div v-if="isLoading" class="stat-cards-skeleton">
					<Skeleton v-for="i in 4" :key="i" variant="rectangular" height="140px" animation="pulse" />
				</div>
				<StatCards v-else :stats="stats" @stat-click="() => { }" />

				<!-- Staff on Duty -->
				<div class="dashboard-section">
					<div class="dashboard-section__header">
						<h3 class="dashboard-section__title">Staff on Duty</h3>
						<button type="button" class="dashboard-section__action">View Schedule</button>
					</div>
					<div class="dashboard-section__content">
						<div v-if="staffOnDuty.length > 0" class="staff-list">
							<StaffListItem v-for="(staff, index) in staffOnDuty" :key="index" :name="staff.name"
								:avatar="staff.avatar" :status="staff.status" :highlighted="staff.highlighted"
								clickable />
							<div class="staff-list__add">
								<button type="button" class="staff-list__add-button">
									<span class="staff-list__add-icon">add</span>
								</button>
								<span class="staff-list__add-label">Add</span>
							</div>
						</div>
						<EmptyState v-else icon="material:groups" title="No staff on duty"
							description="There are no staff members currently on duty." class="dashboard-empty-state" />
					</div>
				</div>

				<!-- Recent Incidents -->
				<div class="dashboard-section">
					<div class="dashboard-section__header">
						<h3 class="dashboard-section__title">Recent Incidents</h3>
						<button type="button" class="dashboard-section__action">View All</button>
					</div>
					<div class="dashboard-section__content">
						<div v-if="recentIncidents.length > 0" class="incidents-list">
							<IncidentCard v-for="(incident, index) in recentIncidents" :key="index"
								:title="incident.title" :resident="incident.resident" :room="incident.room"
								:time="incident.time" :severity="incident.severity" :icon="incident.icon" clickable />
						</div>
						<EmptyState v-else icon="material:report_problem" title="No recent incidents"
							description="There are no recent incidents to display." class="dashboard-empty-state" />
					</div>
				</div>

				<!-- Legacy sections for desktop -->
				<div class="dashboard__grid">
					<div class="dashboard__main">
						<RecentActivity :activities="recentActivities" />
					</div>
					<div class="dashboard__sidebar">
						<QuickActions :actions="quickActions" />
					</div>
				</div>
			</div>
		</main>

		<BottomNavigation :items="bottomNavItems" active-route="/dashboard" :show-floating-button="true" />
	</div>
</template>

<style scoped>
.dashboard-container {
	min-height: 100vh;
	width: 100%;
	background-color: var(--color-bg-secondary);
}

.dashboard-main {
	margin-top: 72px;
	/* MobileHeader height */
	padding-bottom: 6rem;
	/* Space for BottomNavigation */
}

.dashboard-content {
	padding: var(--spacing-lg);
	max-width: 1400px;
	margin: 0 auto;
}

.dashboard-welcome {
	padding: var(--spacing-md) 0 var(--spacing-lg);
}

.dashboard-welcome__greeting {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	font-weight: var(--font-weight-medium);
	margin: 0 0 var(--spacing-xs) 0;
}

.dashboard-welcome__name {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	margin: 0;
}

.dashboard-search {
	margin-bottom: var(--spacing-2xl);
}

.dashboard-search__input {
	width: 100%;
}

.dashboard-section {
	margin-bottom: var(--spacing-2xl);
}

.dashboard-section__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--spacing-lg);
}

.dashboard-section__title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-primary);
	margin: 0;
}

.dashboard-section__action {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-link);
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	transition:
		color var(--transition-base),
		transform var(--transition-base);
}

.dashboard-section__action:hover {
	color: var(--color-text-link-hover);
}

.dashboard-section__action:active {
	transform: scale(0.95);
}

.dashboard-section__content {
	width: 100%;
}

.staff-list {
	display: flex;
	gap: var(--spacing-lg);
	overflow-x: auto;
	padding-bottom: var(--spacing-sm);
	-webkit-overflow-scrolling: touch;
}

.staff-list::-webkit-scrollbar {
	display: none;
}

.staff-list {
	-ms-overflow-style: none;
	scrollbar-width: none;
}

.staff-list__add {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-sm);
	min-width: 4.5rem;
	flex-shrink: 0;
}

.staff-list__add-button {
	width: 3.5rem;
	height: 3.5rem;
	border-radius: var(--radius-full);
	background-color: var(--color-bg-hover);
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: var(--color-text-tertiary);
	transition: all var(--transition-base);
}

.staff-list__add-button:hover {
	background-color: var(--color-button-secondary-hover);
	color: var(--color-text-secondary);
}

.staff-list__add-button:active {
	transform: scale(0.95);
}

.staff-list__add-icon {
	font-size: var(--font-size-xl);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	line-height: 1;
}

.staff-list__add-label {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-tertiary);
	text-align: center;
}

.incidents-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.dashboard__grid {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: var(--spacing-xl);
	margin-top: var(--spacing-2xl);
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

@media (min-width: 1024px) {
	.dashboard-main {
		margin-top: 0;
	}

	.dashboard-header {
		display: none;
	}

	.dashboard-container :deep(.bottom-navigation) {
		display: none;
	}
}

.dashboard-empty-state {
	padding: var(--spacing-2xl) var(--spacing-lg);
}

.stat-cards-skeleton {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--spacing-md);
	margin-bottom: var(--spacing-2xl);
}

@media (min-width: 768px) {
	.stat-cards-skeleton {
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-lg);
	}
}

@media (max-width: 480px) {
	.stat-cards-skeleton {
		grid-template-columns: 1fr;
	}
}
</style>
