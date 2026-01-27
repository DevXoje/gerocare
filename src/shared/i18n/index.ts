import { computed } from 'vue'
import { createI18n } from 'vue-i18n'

import { isLocale, LOCALE_STORAGE_KEY, Locale } from '@/shared/domain/Locale'

import en from './locales/en'
import es from './locales/es'

export type I18nTranslationFunction = (key: string, params?: Record<string, any>) => string

function loadSavedLocale(): Locale {
	if (typeof window === 'undefined') return Locale.Spanish

	try {
		const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
		return isLocale(saved) ? saved : Locale.Spanish
	} catch (error) {
		console.warn('Error loading locale from localStorage:', error)
	}

	return Locale.Spanish
}

function saveLocale(locale: Locale) {
	if (typeof window === 'undefined') return

	try {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale)
	} catch (error) {
		console.warn('Error saving locale to localStorage:', error)
	}
}

// Cargar idioma guardado al inicializar
const savedLocale = loadSavedLocale()

const i18n = createI18n({
	legacy: false,
	locale: savedLocale,
	fallbackLocale: Locale.Spanish,
	messages: {
		es,
		en,
	},
})

export const useI18n = () => {
	const { t, locale } = i18n.global

	const setLocale = (newLocale: Locale) => {
		locale.value = newLocale
		saveLocale(newLocale)
	}

	const getCurrentLocale = (): Locale => {
		return locale.value as Locale
	}

	return {
		t: t as I18nTranslationFunction,
		i18n,
		locale: computed(() => locale.value as Locale),
		setLocale,
		getCurrentLocale,
	}
}

export default i18n
