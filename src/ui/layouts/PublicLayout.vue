<script setup lang="ts">
import LanguageSelector from '@design-system/themes/LanguageSelector.vue'
import ThemeSelector from '@design-system/themes/ThemeSelector.vue'
</script>

<template>
	<div class="public-layout">
		<header class="public-header">
			<div class="header-controls">
				<LanguageSelector />
				<ThemeSelector />
			</div>
		</header>
		<main class="public-content">
			<RouterView />
		</main>
	</div>
</template>

<style scoped>
.public-layout {
	min-height: 100vh;
	width: 100%;
	position: relative;
}

.public-header {
	position: fixed;
	top: 0;
	right: 0;
	padding: var(--spacing-lg);
	z-index: 100;
	display: flex;
	justify-content: flex-end;
}

.header-controls {
	display: flex;
	gap: var(--spacing-md);
	align-items: center;
	flex-wrap: wrap;
}

.header-controls :deep(.theme-selector),
.header-controls :deep(.language-selector) {
	width: auto;
	margin-bottom: 0;
	flex-shrink: 0;
}

.public-content {
	width: 100%;
	min-height: 100vh;
}
</style>
