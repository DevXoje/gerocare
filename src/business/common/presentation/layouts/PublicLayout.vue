<script setup lang="ts">
import ThemeSelector from '@/business/common/theming/presentation/atoms/ThemeSelector.vue'
</script>

<template>
	<div class="public-layout">
		<header class="public-header">
			<ThemeSelector />
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

.public-header :deep(.theme-selector) {
	width: auto;
	min-width: 150px;
	margin-bottom: 0;
}

.public-content {
	width: 100%;
	min-height: 100vh;
}
</style>
