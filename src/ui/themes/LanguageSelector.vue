<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '@/shared/i18n'
import { Locale, localeOptions } from '@/shared/domain/Locale'

const { locale, setLocale, t } = useI18n()
const isHovered = ref(false)

const handleSelect = (selectedLocale: Locale) => {
	setLocale(selectedLocale)
}

const handleKeyDown = (event: KeyboardEvent, selectedLocale: Locale) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleSelect(selectedLocale)
	}
}

const handleMouseEnter = () => {
	isHovered.value = true
}

const handleMouseLeave = () => {
	isHovered.value = false
}

const getLanguageLabel = (localeValue: Locale): string => {
	return t(`common.languages.${localeValue}`)
}
</script>

<template>
	<div
		class="language-selector"
		:class="{ 'language-selector--hovered': isHovered }"
		:aria-label="t('common.languageSelector')"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
	>
		<button
			v-for="option in localeOptions"
			:key="option.value"
			type="button"
			:aria-selected="locale === option.value"
			:aria-label="getLanguageLabel(option.value)"
			:class="{
				'language-selector__button': true,
				'language-selector__button--active': locale === option.value,
				'language-selector__button--hidden': !isHovered && locale !== option.value,
			}"
			@click="handleSelect(option.value)"
			@keydown="handleKeyDown($event, option.value)"
		>
			<span class="language-selector__icon">{{ option.icon }}</span>
		</button>
	</div>
</template>

<style scoped>
.language-selector {
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

.language-selector__button {
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

.language-selector__button--active {
	background-color: var(--color-bg-active);
	color: var(--color-text-primary);
	box-shadow: var(--shadow-sm);
	flex: 0 0 auto;
}

.language-selector__button--hidden {
	opacity: 0;
	width: 0;
	padding-left: 0;
	padding-right: 0;
	overflow: hidden;
	pointer-events: none;
}

.language-selector--hovered .language-selector__button--hidden {
	opacity: 1;
	width: auto;
	padding-left: var(--spacing-md);
	padding-right: var(--spacing-md);
	pointer-events: auto;
	flex: 0 0 auto;
}

.language-selector__button:hover:not(.language-selector__button--active):not(.language-selector__button--hidden) {
	background-color: var(--color-bg-hover);
}

.language-selector__icon {
	font-size: var(--font-size-base);
	line-height: 1;
}
</style>
