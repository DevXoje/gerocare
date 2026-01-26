<script setup lang="ts">
import { computed, ref } from 'vue'

import { usePasswordStrength } from '@/shared/composables/usePasswordStrength'

import Input from '@design-system/atoms/Input.vue'

defineOptions({
	name: 'AppPasswordInput',
})

interface Props {
	modelValue: string
	placeholder?: string
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	autocomplete?: string
	id?: string
	name?: string
	showStrengthFeedback?: boolean
	toggleMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: '••••••••',
	disabled: false,
	required: false,
	error: false,
	autocomplete: 'new-password',
	id: undefined,
	name: undefined,
	showStrengthFeedback: true,
	toggleMask: true,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
	blur: [event: FocusEvent]
	focus: [event: FocusEvent]
}>()

const showPassword = ref(false)

const inputType = computed(() => (showPassword.value ? 'text' : 'password'))

const toggleVisibility = () => {
	if (!props.disabled) {
		showPassword.value = !showPassword.value
	}
}

const handleInputUpdate = (value: string | number) => {
	emit('update:modelValue', String(value))
}

const passwordRef = computed(() => props.modelValue)
const { level, label, crackTime, suggestions } = usePasswordStrength(
	passwordRef,
	props.showStrengthFeedback
)
</script>

<template>
	<div class="password-input">
		<div class="password-input__content">
			<div class="password-input__wrapper">
				<Input :id="id" :name="name" :model-value="modelValue" :type="inputType" :placeholder="placeholder"
					:disabled="disabled" :required="required" :error="error" :autocomplete="autocomplete"
					@update:model-value="handleInputUpdate" @blur="emit('blur', $event)" @focus="emit('focus', $event)" />
				<button v-if="toggleMask" type="button" class="password-input__toggle" :disabled="disabled"
					:aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="toggleVisibility">
					<span class="password-input__toggle-icon material-symbols-outlined">
						{{ showPassword ? 'visibility_off' : 'visibility' }}
					</span>
				</button>
			</div>

			<!-- Feedback de fortaleza -->
			<div v-show="showStrengthFeedback" class="password-input__strength"
				:class="{ 'password-input__strength--hidden': !modelValue || level < 0 }">
				<!-- Barra de progreso -->
				<div class="password-input__strength-bar">
					<div class="password-input__strength-fill" :class="`password-input__strength-fill--${level}`"
						:style="{ width: modelValue && level >= 0 ? `${(level + 1) * 20}%` : '0%' }" />
				</div>

				<!-- Texto y tiempo -->
				<div class="password-input__strength-info">
					<span v-if="modelValue && level >= 0" class="password-input__strength-label"
						:class="`password-input__strength-label--${level}`">
						{{ label }}
					</span>
					<span v-else class="password-input__strength-label password-input__strength-label--empty">
						&nbsp;
					</span>
					<span v-if="crackTime" class="password-input__strength-time">
						Tiempo estimado: {{ crackTime }}
					</span>
					<span v-else class="password-input__strength-time">&nbsp;</span>
				</div>
			</div>
		</div>

		<!-- Sugerencias flotantes -->
		<ul v-if="modelValue && showStrengthFeedback && suggestions.length > 0" class="password-input__suggestions">
			<li v-for="(suggestion, index) in suggestions" :key="index" class="password-input__suggestion">
				{{ suggestion }}
			</li>
		</ul>
	</div>
</template>

<style scoped>
.password-input {
	position: relative;
	width: 100%;
}

.password-input__content {
	position: relative;
	width: 100%;
}

.password-input__wrapper {
	position: relative;
	width: 100%;
}

.password-input__toggle {
	position: absolute;
	right: var(--spacing-md);
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: transparent;
	border: none;
	border-radius: var(--radius-sm);
	cursor: pointer;
	color: var(--color-text-tertiary);
	transition: all var(--transition-base);
	z-index: 1;
}

.password-input__toggle:hover:not(:disabled) {
	color: var(--color-text-primary);
	background-color: var(--color-bg-hover);
}

.password-input__toggle:disabled {
	cursor: not-allowed;
	opacity: 0.5;
}

.password-input__toggle-icon {
	font-family: 'Material Symbols Outlined', sans-serif;
	font-variation-settings:
		'FILL' 0,
		'wght' 400;
	font-size: var(--font-size-lg);
	line-height: 1;
}

:deep(.input) {
	padding-right: 2.75rem;
}

.password-input__strength {
	position: relative;
	margin-top: var(--spacing-sm);
	min-height: 4px;
}

.password-input__strength--hidden {
	visibility: hidden;
}

.password-input__strength-bar {
	height: 4px;
	background-color: var(--color-bg-secondary);
	border-radius: var(--radius-sm);
	overflow: hidden;
}

.password-input__strength-fill {
	height: 100%;
	transition: width var(--transition-base), background-color var(--transition-base);
}

.password-input__strength-fill--0 {
	background-color: var(--token-color-error-500);
}

.password-input__strength-fill--1 {
	background-color: var(--token-color-warning-500);
}

.password-input__strength-fill--2 {
	background-color: var(--token-color-warning-400, var(--token-color-warning-500));
}

.password-input__strength-fill--3 {
	background-color: var(--token-color-success-500);
}

.password-input__strength-fill--4 {
	background-color: var(--token-color-success-600);
}

.password-input__strength-info {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-xs);
	margin-top: var(--spacing-xs);
}

.password-input__strength-label {
	font-weight: var(--font-weight-medium);
}

.password-input__strength-label--0 {
	color: var(--token-color-error-600);
}

.password-input__strength-label--1 {
	color: var(--token-color-warning-600);
}

.password-input__strength-label--2 {
	color: var(--token-color-warning-600);
}

.password-input__strength-label--3 {
	color: var(--token-color-success-600);
}

.password-input__strength-label--4 {
	color: var(--token-color-success-700);
}

.password-input__strength-time {
	color: var(--color-text-secondary);
	font-size: var(--font-size-xs);
}

.password-input__suggestions {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	z-index: 1000;
	margin-top: var(--spacing-xs);
	padding: var(--spacing-sm);
	padding-left: var(--spacing-lg);
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
	list-style: disc;
	max-height: 200px;
	overflow-y: auto;
}

.password-input__suggestion {
	margin-bottom: var(--spacing-xs);
	line-height: var(--line-height-normal);
}
</style>
