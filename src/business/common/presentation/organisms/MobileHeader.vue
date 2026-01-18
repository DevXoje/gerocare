<script setup lang="ts">
import { Input } from '@/business/common/presentation/atoms'

defineOptions({
	name: 'AppMobileHeader',
})

interface Props {
	title: string
	searchPlaceholder?: string
	showSearch?: boolean
	avatar?: string
	searchValue?: string
}

withDefaults(defineProps<Props>(), {
	searchPlaceholder: 'Search...',
	showSearch: false,
	avatar: undefined,
	searchValue: '',
})

const emit = defineEmits<{
	'menu-click': []
	'search-change': [value: string]
	'avatar-click': []
	'search-click': []
}>()

const handleMenuClick = () => {
	emit('menu-click')
}

const handleAvatarClick = () => {
	emit('avatar-click')
}

const handleSearchClick = () => {
	emit('search-click')
}

const handleSearchInput = (value: string | number) => {
	emit('search-change', String(value))
}
</script>

<template>
	<header class="mobile-header">
		<div class="mobile-header__content">
			<button type="button" aria-label="Menu" class="mobile-header__menu-button" @click="handleMenuClick">
				<span class="mobile-header__menu-icon">menu</span>
			</button>

			<h1 class="mobile-header__title">{{ title }}</h1>

			<div class="mobile-header__actions">
				<button v-if="showSearch" type="button" aria-label="Search" class="mobile-header__search-button"
					@click="handleSearchClick">
					<span class="mobile-header__search-icon">search</span>
				</button>

				<div class="mobile-header__avatar-wrapper">
					<button v-if="avatar" type="button" class="mobile-header__avatar" @click="handleAvatarClick">
						<img :src="avatar" alt="User profile" class="mobile-header__avatar-image" />
					</button>
					<div v-else class="mobile-header__avatar mobile-header__avatar--placeholder">
						<span class="mobile-header__avatar-icon">person</span>
					</div>
				</div>
			</div>
		</div>

		<div v-if="showSearch" class="mobile-header__search-container">
			<Input :model-value="searchValue" type="search" :placeholder="searchPlaceholder"
				class="mobile-header__search-input" @update:model-value="handleSearchInput" />
		</div>
	</header>
</template>

<style scoped>
.mobile-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 40;
	background-color: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(12px);
	border-bottom: 1px solid var(--color-border-default);
	padding: var(--spacing-md) var(--spacing-lg);
}

.mobile-header__content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-md);
}

.mobile-header__menu-button {
	padding: var(--spacing-sm);
	margin-left: calc(var(--spacing-sm) * -1);
	border: none;
	background: none;
	cursor: pointer;
	border-radius: var(--radius-full);
	transition: background-color var(--transition-base);
	color: var(--color-text-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}

.mobile-header__menu-button:hover {
	background-color: var(--color-bg-hover);
}

.mobile-header__menu-icon {
	font-size: 1.75rem;
	/* 28px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-primary);
}

.mobile-header__title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-bold);
	line-height: var(--line-height-tight);
	color: var(--color-text-primary);
	margin: 0;
	flex: 1;
	text-align: center;
}

.mobile-header__actions {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}

.mobile-header__search-button {
	padding: var(--spacing-sm);
	border: none;
	background: none;
	cursor: pointer;
	border-radius: var(--radius-full);
	transition: background-color var(--transition-base);
	color: var(--color-text-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}

.mobile-header__search-button:hover {
	background-color: var(--color-bg-hover);
}

.mobile-header__search-icon {
	font-size: var(--font-size-xl);
	/* 24px */
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-primary);
}

.mobile-header__avatar-wrapper {
	position: relative;
}

.mobile-header__avatar {
	width: 2.25rem;
	/* 36px */
	height: 2.25rem;
	border-radius: var(--radius-full);
	border: 1px solid var(--color-border-default);
	overflow: hidden;
	background-color: var(--token-color-neutral-200);
	cursor: pointer;
	box-shadow: var(--shadow-sm);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	border: none;
}

.mobile-header__avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.mobile-header__avatar--placeholder {
	background-color: var(--token-color-neutral-200);
}

.mobile-header__avatar-icon {
	font-size: var(--font-size-lg);
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	color: var(--color-text-secondary);
}

.mobile-header__search-container {
	margin-top: var(--spacing-md);
}

.mobile-header__search-input {
	width: 100%;
}
</style>
