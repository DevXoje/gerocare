<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { Input } from '@design-system/atoms'
import type { Resident } from '@/business/residents/domain/Resident'
import { useResidentStore } from '@/business/residents/store'

interface Props {
	modelValue: string
	placeholder?: string
	required?: boolean
	error?: string | boolean
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: 'Buscar residente...',
	required: false,
	error: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
}>()

const residentStore = useResidentStore()
const searchQuery = ref('')
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLElement | null>(null)

// Load residents on mount
onMounted(async () => {
	if (residentStore.residents.length === 0) {
		await residentStore.fetchResidents()
	}
})

// Filter residents by search query
const filteredResidents = computed(() => {
	if (!searchQuery.value.trim()) {
		return residentStore.residents
	}

	const query = searchQuery.value.toLowerCase().trim()
	return residentStore.residents.filter(
		resident =>
			resident.firstName.toLowerCase().includes(query) ||
			resident.lastName.toLowerCase().includes(query) ||
			`${resident.firstName} ${resident.lastName}`.toLowerCase().includes(query) ||
			resident.id.toLowerCase().includes(query)
	)
})

// Update search query when selected resident changes
watch(
	() => props.modelValue,
	newValue => {
		if (newValue) {
			const resident = residentStore.residentById(newValue)
			if (resident) {
				searchQuery.value = `${resident.firstName} ${resident.lastName}`
			}
		} else {
			searchQuery.value = ''
		}
	},
	{ immediate: true }
)

const handleResidentSelect = (resident: Resident) => {
	emit('update:modelValue', resident.id)
	searchQuery.value = `${resident.firstName} ${resident.lastName}`
	isOpen.value = false
}

const handleInputFocus = () => {
	isOpen.value = true
}

const handleInputBlur = (event: FocusEvent) => {
	// Delay to allow click on dropdown items
	setTimeout(() => {
		if (!dropdownRef.value?.contains(event.relatedTarget as Node)) {
			isOpen.value = false
		}
	}, 200)
}

const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement
	if (!target.closest('.resident-selector')) {
		isOpen.value = false
	}
}

// Watch search query to open dropdown when typing
watch(searchQuery, () => {
	if (searchQuery.value.trim()) {
		isOpen.value = true
	}
})

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
	<div class="resident-selector">
		<div ref="inputRef">
			<Input :model-value="searchQuery" type="text" :placeholder="placeholder" :required="required" :error="error"
				variant="search" @update:model-value="v => (searchQuery = String(v))" @focus="handleInputFocus"
				@blur="handleInputBlur" />
		</div>

		<div v-if="isOpen && filteredResidents.length > 0" ref="dropdownRef" class="resident-selector__dropdown">
			<button v-for="resident in filteredResidents" :key="resident.id" type="button"
				class="resident-selector__option"
				:class="{ 'resident-selector__option--selected': resident.id === modelValue }"
				@click="handleResidentSelect(resident)">
				<div class="resident-selector__option-content">
					<span class="resident-selector__option-name">
						{{ resident.firstName }} {{ resident.lastName }}
					</span>
					<span class="resident-selector__option-id">ID: {{ resident.id }}</span>
				</div>
				<span v-if="resident.id === modelValue" class="resident-selector__option-check">✓</span>
			</button>
		</div>

		<div v-if="isOpen && searchQuery.trim() && filteredResidents.length === 0" ref="dropdownRef"
			class="resident-selector__dropdown resident-selector__dropdown--empty">
			<p class="resident-selector__empty">No se encontraron residentes</p>
		</div>

		<div v-if="isOpen && !searchQuery.trim() && residentStore.isLoading" ref="dropdownRef"
			class="resident-selector__dropdown resident-selector__dropdown--loading">
			<p class="resident-selector__loading">Cargando residentes...</p>
		</div>
	</div>
</template>

<style scoped>
.resident-selector {
	position: relative;
	width: 100%;
}

.resident-selector__dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: var(--spacing-xs);
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	max-height: 300px;
	overflow-y: auto;
	z-index: 1000;
}

.resident-selector__option {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-md);
	padding: var(--spacing-md);
	background-color: transparent;
	border: none;
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: background-color var(--transition-base);
	text-align: left;
	border-bottom: 1px solid var(--color-border-default);
}

.resident-selector__option:last-child {
	border-bottom: none;
}

.resident-selector__option:hover {
	background-color: var(--color-bg-hover);
}

.resident-selector__option--selected {
	background-color: var(--color-bg-active);
}

.resident-selector__option-content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	flex: 1;
}

.resident-selector__option-name {
	font-weight: var(--font-weight-medium);
	color: var(--color-text-primary);
}

.resident-selector__option-id {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.resident-selector__option-check {
	color: var(--color-text-link);
	font-weight: var(--font-weight-bold);
	font-size: var(--font-size-lg);
}

.resident-selector__empty,
.resident-selector__loading {
	padding: var(--spacing-lg);
	text-align: center;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}
</style>
