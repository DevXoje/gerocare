import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEsPackage from '@zxcvbn-ts/language-es-es'
import { computed, type ComputedRef } from 'vue'

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordStrengthResult {
	level: PasswordStrengthLevel
	label: string
	crackTime: string | null
	suggestions: string[]
}

const STRENGTH_LABELS: Record<PasswordStrengthLevel, string> = {
	0: 'Muy débil',
	1: 'Débil',
	2: 'Buena',
	3: 'Fuerte',
	4: 'Muy fuerte',
}

// Configurar zxcvbn-ts con español (se ejecuta una sola vez al importar el módulo)
const options = {
	translations: zxcvbnEsPackage.translations,
	graphs: zxcvbnCommonPackage.adjacencyGraphs,
	dictionary: {
		...zxcvbnCommonPackage.dictionary,
		...zxcvbnEsPackage.dictionary,
	},
}
zxcvbnOptions.setOptions(options)

function isValidPasswordStrengthLevel(
	value: PasswordStrengthLevel | -1
): value is PasswordStrengthLevel {
	return value >= 0 && value <= 4
}

export function usePasswordStrength(password: ComputedRef<string> | (() => string), enabled = true) {
	const strength = computed(() => {
		const passwordValue = typeof password === 'function' ? password() : password.value
		if (!passwordValue || !enabled) return null
		return zxcvbn(passwordValue)
	})

	const level = computed<PasswordStrengthLevel | -1>(() => {
		if (!strength.value) return -1
		return strength.value.score as PasswordStrengthLevel
	})

	const label = computed(() => {
		const currentLevel = level.value
		if (!isValidPasswordStrengthLevel(currentLevel)) return ''
		return STRENGTH_LABELS[currentLevel] || ''
	})

	const crackTime = computed<string | null>(() => {
		if (!strength.value) return null
		const time = strength.value.crackTimesDisplay.offlineSlowHashing1e4PerSecond
		return typeof time === 'string' ? time : String(time)
	})

	const suggestions = computed(() => {
		if (!strength.value?.feedback?.suggestions) return []
		return strength.value.feedback.suggestions
	})

	const result = computed<PasswordStrengthResult | null>(() => {
		const currentLevel = level.value
		if (!isValidPasswordStrengthLevel(currentLevel)) return null
		return {
			level: currentLevel,
			label: label.value,
			crackTime: crackTime.value,
			suggestions: suggestions.value,
		}
	})

	return {
		strength: result,
		level,
		label,
		crackTime,
		suggestions,
	}
}
