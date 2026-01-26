<script setup lang="ts">
import { ref } from 'vue'

import { useTheme } from '@/shared/composables/useTheme'
import { ThemeMode, themeModeOptions } from '@/shared/domain/Theme'

const { themeMode, setTheme } = useTheme()
const isHovered = ref(false)

const handleSelect = (mode: ThemeMode) => {
	setTheme(mode)
}

const handleKeyDown = (event: KeyboardEvent, mode: ThemeMode) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleSelect(mode)
	}
}

const handleMouseEnter = () => {
	isHovered.value = true
}

const handleMouseLeave = () => {
	isHovered.value = false
}
</script>

<template>
	<div
		class="theme-selector"
		:class="{ 'theme-selector--hovered': isHovered }"
		aria-label="Selector de tema"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
	>
		<button
			v-for="option in themeModeOptions"
			:key="option.value"
			type="button"
			:aria-selected="themeMode === option.value"
			:aria-label="option.label"
			:class="{
				'theme-selector__button': true,
				'theme-selector__button--active': themeMode === option.value,
				'theme-selector__button--hidden': !isHovered && themeMode !== option.value,
			}"
			@click="handleSelect(option.value)"
			@keydown="handleKeyDown($event, option.value)"
		>
			<span class="theme-selector__icon">{{ option.icon }}</span>
		</button>
	</div>
</template>

<style scoped>
.theme-selector {
	display: flex;
	gap: 0;
	background-color: var(--color-bg-secondary);
	border-radius: var(--radius-md);
	padding: 2px;
	border: 1px solid var(--color-border-default);
	width: fit-content;
	margin-bottom: var(--spacing-lg);
	overflow: hidden;
	transition: all var(--transition-base);
}

.theme-selector__button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-sm) var(--spacing-md);
	background-color: transparent;
	border: none;
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition:
		opacity var(--transition-base),
		width var(--transition-base),
		padding var(--transition-base),
		background-color var(--transition-base);
	color: var(--color-text-secondary);
	font-family: inherit;
	white-space: nowrap;
}

.theme-selector__button--active {
	background-color: var(--color-bg-active);
	color: var(--color-text-primary);
	box-shadow: var(--shadow-sm);
	flex: 0 0 auto;
}

.theme-selector__button--hidden {
	opacity: 0;
	width: 0;
	padding-left: 0;
	padding-right: 0;
	overflow: hidden;
	pointer-events: none;
}

.theme-selector--hovered .theme-selector__button--hidden {
	opacity: 1;
	width: auto;
	padding-left: var(--spacing-md);
	padding-right: var(--spacing-md);
	pointer-events: auto;
	flex: 0 0 auto;
}

.theme-selector__button:hover:not(.theme-selector__button--active):not(.theme-selector__button--hidden) {
	background-color: var(--color-bg-hover);
}

.theme-selector__icon {
	font-size: var(--font-size-base);
	line-height: 1;
}
</style>
