<script setup lang="ts">
defineOptions({
	name: 'AppEmptyState',
})

interface Props {
	title?: string
	description?: string
	icon?: string
	actionLabel?: string
}

withDefaults(defineProps<Props>(), {
	title: 'No hay datos',
	description: 'No se encontraron elementos para mostrar.',
	icon: '📭',
	actionLabel: undefined,
})

const emit = defineEmits<{
	action: []
}>()

const handleAction = () => {
	emit('action')
}
</script>

<template>
	<div class="empty-state">
		<div v-if="icon" class="empty-state__icon">{{ icon }}</div>
		<h3 v-if="title" class="empty-state__title">{{ title }}</h3>
		<p v-if="description" class="empty-state__description">{{ description }}</p>
		<slot name="action">
			<button v-if="actionLabel" type="button" class="empty-state__action" @click="handleAction">
				{{ actionLabel }}
			</button>
		</slot>
	</div>
</template>

<style scoped>
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-3xl) var(--spacing-xl);
	text-align: center;
}

.empty-state__icon {
	font-size: 4rem;
	margin-bottom: var(--spacing-lg);
	opacity: 0.5;
}

.empty-state__title {
	margin: 0 0 var(--spacing-md) 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.empty-state__description {
	margin: 0 0 var(--spacing-xl) 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	max-width: 400px;
}

.empty-state__action {
	padding: var(--spacing-md) var(--spacing-xl);
	background: var(--color-button-primary-bg);
	color: var(--color-button-primary-text);
	border: none;
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: opacity var(--transition-base);
}

.empty-state__action:hover {
	opacity: 0.9;
}
</style>
