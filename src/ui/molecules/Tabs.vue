<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
	name: 'AppTabs',
})

interface Tab {
	id: string
	label: string
	icon?: string
	disabled?: boolean
}

interface Props {
	tabs: Tab[]
	modelValue?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
	change: [value: string]
}>()

const activeTab = computed({
	get: () => props.modelValue || props.tabs[0]?.id || '',
	set: (value: string) => {
		if (value) {
			emit('update:modelValue', value)
			emit('change', value)
		}
	},
})

const handleTabClick = (tab: Tab) => {
	if (!tab.disabled) {
		activeTab.value = tab.id
	}
}
</script>

<template>
	<div class="tabs">
		<div class="tabs__header" role="tablist">
			<button
				v-for="tab in tabs"
				:key="tab.id"
				:id="`tab-${tab.id}`"
				role="tab"
				:aria-selected="activeTab === tab.id"
				:aria-disabled="tab.disabled"
				:class="{
					tabs__tab: true,
					'tabs__tab--active': activeTab === tab.id,
					'tabs__tab--disabled': tab.disabled,
				}"
				:disabled="tab.disabled"
				@click="handleTabClick(tab)"
			>
				<span v-if="tab.icon" class="tabs__tab-icon">{{ tab.icon }}</span>
				<span class="tabs__tab-label">{{ tab.label }}</span>
			</button>
		</div>
		<div class="tabs__content">
			<slot :active-tab="activeTab" />
		</div>
	</div>
</template>

<style scoped>
.tabs {
	width: 100%;
}

.tabs__header {
	display: flex;
	gap: var(--spacing-xs);
	border-bottom: 2px solid var(--color-border-default);
	overflow-x: auto;
}

.tabs__tab {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	padding: var(--spacing-md) var(--spacing-lg);
	background: none;
	border: none;
	border-bottom: 2px solid transparent;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--transition-base);
	white-space: nowrap;
	margin-bottom: -2px;
}

.tabs__tab:hover:not(:disabled) {
	color: var(--color-text-primary);
	background-color: var(--color-bg-hover);
}

.tabs__tab--active {
	color: var(--token-color-primary-600);
	border-bottom-color: var(--token-color-primary-600);
}

.tabs__tab--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.tabs__tab-icon {
	font-size: var(--font-size-base);
}

.tabs__content {
	padding: var(--spacing-xl) 0;
}
</style>
