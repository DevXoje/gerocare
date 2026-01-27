<script setup lang="ts">
import { createActivityLogRepository } from '@/business/activity-logs/infrastructure'
import EmailVerificationBanner from '@/business/auth/presentation/components/EmailVerificationBanner.vue'
import { createCarePlanRepository } from '@/business/care-plans/infrastructure'
import { Sidebar as AppSidebar } from '@design-system/organisms'
import { createIncidentRepository } from '@/business/incidents/infrastructure'
import { createMedicationRepository } from '@/business/medication/infrastructure'
import { createResidentRepository } from '@/business/residents/infrastructure'
import { createShiftRepository } from '@/business/shifts/infrastructure'
import { useSidebar } from '@/shared/composables/useSidebar'
import { useNetworkNotifications } from '@/shared/offline/app/useNetworkNotifications'
import { useSyncQueue } from '@/shared/offline/app/useSyncQueue'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import NetworkStatusBadge from '@/shared/offline/presentation/components/NetworkStatusBadge.vue'

const { isMobile, toggle } = useSidebar()

// Initialize offline capabilities only for private routes
useNetworkNotifications()

// Initialize offline sync queue with all repositories that support offline operations
const queue = createOfflineQueueRepository()
const residentRepository = createResidentRepository()
const activityLogRepository = createActivityLogRepository()
const incidentRepository = createIncidentRepository()
const medicationRepository = createMedicationRepository()
const carePlanRepository = createCarePlanRepository()
const shiftRepository = createShiftRepository()

useSyncQueue(queue, {
	resident: residentRepository,
	'activity-log': activityLogRepository,
	incident: incidentRepository,
	medication: medicationRepository,
	'care-plan': carePlanRepository,
	shift: shiftRepository,
})
</script>

<template>
	<div class="private-layout">
		<AppSidebar />

		<div class="layout-main">
			<EmailVerificationBanner />
			<header class="layout-header" v-if="isMobile">
				<button class="menu-toggle" @click="toggle" aria-label="Toggle menu">
					<span class="hamburger-icon">☰</span>
				</button>
				<h1 class="layout-title">GeroCare</h1>
			</header>

			<main class="layout-content">
				<RouterView />
			</main>
		</div>

		<NetworkStatusBadge position="fixed" :show-label="true" />
	</div>
</template>

<style scoped>
.private-layout {
	display: flex;
	min-height: 100vh;
	width: 100%;
}

.layout-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-left: 0;
	transition: margin-left 0.3s ease-in-out;
}

@media (min-width: 768px) {
	.layout-main {
		margin-left: 280px;
	}
}

.layout-header {
	position: sticky;
	top: 0;
	z-index: 100;
	background: var(--color-bg-primary);
	padding: var(--spacing-lg) var(--spacing-xl);
	box-shadow: var(--shadow-sm);
	display: flex;
	align-items: center;
	gap: var(--spacing-lg);
}

@media (min-width: 768px) {
	.layout-header {
		display: none;
	}
}

.menu-toggle {
	background: none;
	border: none;
	font-size: var(--font-size-2xl);
	cursor: pointer;
	padding: var(--spacing-sm);
	color: var(--color-text-primary);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-md);
	transition: background-color var(--transition-base);
}

.menu-toggle:hover {
	background-color: var(--color-bg-hover);
}

.hamburger-icon {
	font-size: 1.5rem;
	line-height: 1;
}

.layout-title {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.layout-content {
	flex: 1;
	width: 100%;
	overflow-x: hidden;
}
</style>
