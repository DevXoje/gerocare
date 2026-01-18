<script setup lang="ts">
import { Select } from '@/business/common/presentation/atoms'
import { useTheme } from '@/shared/composables/useTheme'
import { ThemeMode, themeModeOptions } from '@/shared/domain/Theme'

const { themeMode, setTheme } = useTheme()

const handleUpdate = (value: ThemeMode) => {
	setTheme(value)
}
</script>

<template>
	<div class="theme-selector">
		<Select :model-value="themeMode" :options="themeModeOptions" @update:model-value="handleUpdate" />
	</div>
</template>

<style scoped>
.theme-selector {
	width: 100%;
	margin-bottom: var(--spacing-lg);
}
</style>
