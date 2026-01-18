<script setup lang="ts">
import { Button, Card } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'DashboardQuickActions',
})

interface Action {
	label: string
	icon?: string
	to?: string
	action?: () => void
	variant?: 'primary' | 'secondary'
}

interface Props {
	actions: Action[]
}

defineProps<Props>()

const emit = defineEmits<{
	action: [action: Action]
}>()

const handleAction = (action: Action) => {
	if (action.action) {
		action.action()
	}
	emit('action', action)
}
</script>

<template>
	<Card variant="elevated" padding="lg">
		<div class="quick-actions">
			<h3 class="quick-actions__title">Acciones Rápidas</h3>
			<div class="quick-actions__grid">
				<Button v-for="(action, index) in actions" :key="index" :variant="action.variant || 'primary'"
					:to="action.to" block @click="handleAction(action)">
					<span v-if="action.icon" class="quick-actions__icon">{{ action.icon }}</span>
					{{ action.label }}
				</Button>
			</div>
		</div>
	</Card>
</template>

<style scoped>
.quick-actions__title {
	margin: 0 0 var(--spacing-xl) 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.quick-actions__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: var(--spacing-md);
}

.quick-actions__icon {
	margin-right: var(--spacing-xs);
}
</style>
