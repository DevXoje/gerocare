<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
	modelValue: string
	placeholder?: string
	required?: boolean
	error?: string | boolean
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: 'Seleccionar horarios...',
	required: false,
	error: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
}>()

// Common time slots
const commonTimes = [
	'06:00',
	'08:00',
	'10:00',
	'12:00',
	'14:00',
	'16:00',
	'18:00',
	'20:00',
	'22:00',
]

// Common presets
const presets = [
	{ label: 'Diario', value: '08:00' },
	{ label: 'Dos veces al día', value: '08:00, 20:00' },
	{ label: 'Tres veces al día', value: '08:00, 14:00, 20:00' },
]

// Selected times as array
const selectedTimes = ref<string[]>([])

// Preset selection mode
const selectedPreset = ref<string | null>(null)

// Parse modelValue to array of times
const parseFrequency = (frequency: string): string[] => {
	if (!frequency.trim()) return []
	if (frequency.includes(',')) {
		return frequency
			.split(',')
			.map(time => time.trim())
			.filter(time => time.length > 0)
	}
	return [frequency.trim()].filter(time => time.length > 0)
}

// Initialize from modelValue
watch(
	() => props.modelValue,
	newValue => {
		const times = parseFrequency(newValue)

		// Check if matches a preset
		const matchingPreset = presets.find(preset => preset.value === newValue)
		if (matchingPreset) {
			selectedPreset.value = matchingPreset.value
			selectedTimes.value = times
		} else {
			selectedPreset.value = null
			selectedTimes.value = times
		}
	},
	{ immediate: true }
)

// Convert selected times to frequency string
const updateFrequency = (times: string[]) => {
	const sortedTimes = [...times].sort()
	const frequencyString = sortedTimes.join(', ')
	emit('update:modelValue', frequencyString)
}

// Handle preset selection
const handlePresetSelect = (preset: { label: string; value: string }) => {
	selectedPreset.value = preset.value
	const times = parseFrequency(preset.value)
	selectedTimes.value = times
	updateFrequency(times)
}

// Handle time toggle
const handleTimeToggle = (time: string) => {
	const index = selectedTimes.value.indexOf(time)
	if (index > -1) {
		selectedTimes.value.splice(index, 1)
	} else {
		selectedTimes.value.push(time)
	}
	selectedPreset.value = null // Clear preset when manually selecting
	updateFrequency(selectedTimes.value)
}

// Handle custom time input
const customTime = ref('')
const showCustomTimeInput = ref(false)

const handleAddCustomTime = () => {
	const time = customTime.value.trim()
	if (time && !selectedTimes.value.includes(time)) {
		selectedTimes.value.push(time)
		selectedPreset.value = null
		updateFrequency(selectedTimes.value)
		customTime.value = ''
		showCustomTimeInput.value = false
	}
}

// Format time for display
const formatTime = (time: string): string => {
	// Ensure format HH:mm
	const parts = time.split(':')
	if (parts.length === 2) {
		return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
	}
	return time
}

// Display value
const displayValue = computed(() => {
	if (selectedPreset.value) {
		const preset = presets.find(p => p.value === selectedPreset.value)
		return preset?.label || ''
	}
	if (selectedTimes.value.length === 0) return ''
	if (selectedTimes.value.length === 1) return selectedTimes.value[0]
	return `${selectedTimes.value.length} horarios seleccionados`
})

// Handle click outside
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement
	if (
		!target.closest('.time-schedule-selector') &&
		!dropdownRef.value?.contains(target) &&
		!triggerRef.value?.contains(target)
	) {
		showCustomTimeInput.value = false
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
	<div class="time-schedule-selector">
		<!-- Display selected value / dropdown trigger -->
		<div
			ref="triggerRef"
			class="time-schedule-selector__trigger"
			@click="showCustomTimeInput = !showCustomTimeInput"
		>
			<span class="time-schedule-selector__value">
				{{ displayValue || placeholder }}
			</span>
			<span class="time-schedule-selector__arrow">▼</span>
		</div>

		<!-- Dropdown -->
		<div v-if="showCustomTimeInput" ref="dropdownRef" class="time-schedule-selector__dropdown">
			<!-- Presets -->
			<div class="time-schedule-selector__section">
				<p class="time-schedule-selector__section-title">Presets comunes</p>
				<div class="time-schedule-selector__presets">
					<button
						v-for="preset in presets"
						:key="preset.value"
						type="button"
						class="time-schedule-selector__preset"
						:class="{ 'time-schedule-selector__preset--active': selectedPreset === preset.value }"
						@click="handlePresetSelect(preset)"
					>
						{{ preset.label }}
					</button>
				</div>
			</div>

			<!-- Common time slots -->
			<div class="time-schedule-selector__section">
				<p class="time-schedule-selector__section-title">Horarios comunes</p>
				<div class="time-schedule-selector__times">
					<button
						v-for="time in commonTimes"
						:key="time"
						type="button"
						class="time-schedule-selector__time"
						:class="{ 'time-schedule-selector__time--selected': selectedTimes.includes(time) }"
						@click="handleTimeToggle(time)"
					>
						{{ formatTime(time) }}
					</button>
				</div>
			</div>

			<!-- Custom time input -->
			<div class="time-schedule-selector__section">
				<p class="time-schedule-selector__section-title">Añadir horario personalizado</p>
				<div class="time-schedule-selector__custom">
					<input
						v-model="customTime"
						type="time"
						class="time-schedule-selector__custom-input"
						placeholder="HH:mm"
					/>
					<button
						type="button"
						class="time-schedule-selector__custom-button"
						@click="handleAddCustomTime"
					>
						Añadir
					</button>
				</div>
			</div>

			<!-- Selected times display -->
			<div v-if="selectedTimes.length > 0" class="time-schedule-selector__section">
				<p class="time-schedule-selector__section-title">Horarios seleccionados</p>
				<div class="time-schedule-selector__selected">
					<span
						v-for="time in selectedTimes"
						:key="time"
						class="time-schedule-selector__selected-tag"
					>
						{{ formatTime(time) }}
						<button
							type="button"
							class="time-schedule-selector__selected-remove"
							@click="handleTimeToggle(time)"
						>
							✕
						</button>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.time-schedule-selector {
	position: relative;
	width: 100%;
}

.time-schedule-selector__trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--spacing-md);
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	cursor: pointer;
	transition: all var(--transition-base);
}

.time-schedule-selector__trigger:hover {
	background-color: var(--color-bg-hover);
	border-color: var(--color-border-hover);
}

.time-schedule-selector__value {
	flex: 1;
	color: var(--color-text-primary);
	font-size: var(--font-size-base);
}

.time-schedule-selector__arrow {
	color: var(--color-text-secondary);
	font-size: var(--font-size-xs);
}

.time-schedule-selector__dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: var(--spacing-xs);
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	max-height: 400px;
	overflow-y: auto;
	z-index: 1000;
	padding: var(--spacing-md);
}

.time-schedule-selector__section {
	margin-bottom: var(--spacing-lg);
}

.time-schedule-selector__section:last-child {
	margin-bottom: 0;
}

.time-schedule-selector__section-title {
	margin: 0 0 var(--spacing-sm) 0;
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.time-schedule-selector__presets {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.time-schedule-selector__preset {
	padding: var(--spacing-sm) var(--spacing-md);
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-sm);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all var(--transition-base);
	text-align: left;
}

.time-schedule-selector__preset:hover {
	background-color: var(--color-bg-hover);
}

.time-schedule-selector__preset--active {
	background-color: var(--color-bg-active);
	border-color: var(--color-border-focus);
	color: var(--color-text-link);
}

.time-schedule-selector__times {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--spacing-xs);
}

.time-schedule-selector__time {
	padding: var(--spacing-sm);
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-sm);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all var(--transition-base);
}

.time-schedule-selector__time:hover {
	background-color: var(--color-bg-hover);
}

.time-schedule-selector__time--selected {
	background-color: var(--color-bg-active);
	border-color: var(--color-border-focus);
	color: var(--color-text-link);
	font-weight: var(--font-weight-semibold);
}

.time-schedule-selector__custom {
	display: flex;
	gap: var(--spacing-sm);
}

.time-schedule-selector__custom-input {
	flex: 1;
	padding: var(--spacing-sm) var(--spacing-md);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-sm);
	font-size: var(--font-size-sm);
	color: var(--color-text-primary);
	background-color: var(--color-bg-primary);
}

.time-schedule-selector__custom-button {
	padding: var(--spacing-sm) var(--spacing-md);
	background-color: var(--color-button-primary-bg);
	border: none;
	border-radius: var(--radius-sm);
	color: var(--color-button-primary-text);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	cursor: pointer;
	transition: all var(--transition-base);
}

.time-schedule-selector__custom-button:hover {
	background-color: var(--color-button-primary-hover);
}

.time-schedule-selector__selected {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-xs);
}

.time-schedule-selector__selected-tag {
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-xs);
	padding: var(--spacing-xs) var(--spacing-sm);
	background-color: var(--color-bg-active);
	border: 1px solid var(--color-border-focus);
	border-radius: var(--radius-sm);
	color: var(--color-text-link);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
}

.time-schedule-selector__selected-remove {
	padding: 0;
	background: none;
	border: none;
	color: var(--color-text-link);
	font-size: var(--font-size-base);
	cursor: pointer;
	line-height: 1;
	opacity: 0.7;
	transition: opacity var(--transition-base);
}

.time-schedule-selector__selected-remove:hover {
	opacity: 1;
}
</style>
