<script setup lang="ts">
defineOptions({
	name: 'AppBottomNavigation',
})

interface NavigationItem {
	label: string
	icon: string
	route?: string
	active?: boolean
}

interface Props {
	items: NavigationItem[]
	activeRoute?: string
	showFloatingButton?: boolean
	floatingButtonIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
	activeRoute: undefined,
	showFloatingButton: false,
	floatingButtonIcon: 'add',
})

const emit = defineEmits<{
	'item-click': [item: NavigationItem, index: number]
	'floating-button-click': []
}>()

const handleItemClick = (item: NavigationItem, index: number) => {
	emit('item-click', item, index)
}

const handleFloatingButtonClick = () => {
	emit('floating-button-click')
}

const isItemActive = (item: NavigationItem) => {
	if (props.activeRoute && item.route) {
		return item.route === props.activeRoute
	}
	return item.active || false
}
</script>

<template>
	<nav class="bottom-navigation">
		<div class="bottom-navigation__container">
			<button
				v-for="(item, index) in items"
				:key="index"
				type="button"
				class="bottom-navigation__item"
				:class="{ 'bottom-navigation__item--active': isItemActive(item) }"
				@click="handleItemClick(item, index)"
			>
				<span
					class="bottom-navigation__icon"
					:class="{ 'bottom-navigation__icon--filled': isItemActive(item) }"
				>
					{{ item.icon }}
				</span>
				<span class="bottom-navigation__label">{{ item.label }}</span>
			</button>

			<button
				v-if="showFloatingButton"
				type="button"
				class="bottom-navigation__floating-button"
				@click="handleFloatingButtonClick"
			>
				<span class="bottom-navigation__floating-icon">{{ floatingButtonIcon }}</span>
			</button>
		</div>

		<!-- Safe area spacer for iPhone home indicator -->
		<div class="bottom-navigation__safe-area"></div>
	</nav>
</template>

<style scoped>
.bottom-navigation {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: var(--color-bg-primary);
	border-top: 1px solid var(--color-border-default);
	z-index: 50;
}

.bottom-navigation__container {
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: 4rem;
	/* 64px */
	padding: 0 var(--spacing-sm);
	position: relative;
}

.bottom-navigation__item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-xs);
	background: none;
	border: none;
	cursor: pointer;
	padding: var(--spacing-xs);
	color: var(--color-text-secondary);
	transition:
		color var(--transition-base),
		transform var(--transition-base);
	min-width: 0;
}

.bottom-navigation__item:active {
	transform: scale(0.9);
}

.bottom-navigation__item:hover {
	color: var(--color-text-primary);
}

.bottom-navigation__item--active {
	color: var(--color-text-link);
}

.bottom-navigation__icon {
	font-size: var(--font-size-xl);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	line-height: 1;
}

.bottom-navigation__icon--filled {
	font-variation-settings:
		'FILL' 1,
		'wght' 400;
}

.bottom-navigation__label {
	font-size: 0.625rem;
	/* 10px */
	font-weight: var(--font-weight-medium);
	line-height: 1;
}

.bottom-navigation__item--active .bottom-navigation__label {
	font-weight: var(--font-weight-bold);
}

.bottom-navigation__floating-button {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	top: -2rem;
	/* -32px - half of button height */
	width: 3rem;
	/* 48px */
	height: 3rem;
	border-radius: var(--radius-full);
	background-color: var(--color-button-primary-solid-bg);
	color: var(--color-text-inverse);
	border: 4px solid var(--color-bg-primary);
	box-shadow: var(--shadow-lg);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all var(--transition-base);
}

.bottom-navigation__floating-button:hover {
	background-color: var(--color-button-primary-solid-hover);
	transform: translateX(-50%) scale(1.05);
	box-shadow: var(--shadow-xl);
}

.bottom-navigation__floating-button:active {
	transform: translateX(-50%) scale(0.95);
}

.bottom-navigation__floating-icon {
	font-size: var(--font-size-xl);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-inverse);
}

.bottom-navigation__safe-area {
	height: 1.5rem;
	/* 24px - safe area for iPhone home indicator */
	width: 100%;
	background-color: var(--color-bg-primary);
}
</style>
