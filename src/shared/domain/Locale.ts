import type { SelectOption } from '@/shared/domain/SelectOption'

export const LOCALE_STORAGE_KEY = 'locale' as const

export enum Locale {
	Spanish = 'es',
	English = 'en',
}

export const isLocale = (value: string | null | undefined): value is Locale =>
	!!value && localeValues.includes(value as Locale)

export const localeOptions: SelectOption<Locale>[] = [
	{ value: Locale.Spanish, label: 'Español', icon: '🇪🇸' },
	{ value: Locale.English, label: 'English', icon: '🇬🇧' },
]

export const localeLabels: Record<Locale, string> = {
	[Locale.Spanish]: 'Español',
	[Locale.English]: 'English',
}

export const localeIcons: Record<Locale, string> = {
	[Locale.Spanish]: '🇪🇸',
	[Locale.English]: '🇬🇧',
}

export const localeValues: Locale[] = [Locale.Spanish, Locale.English]

export const getLocaleOption = (locale: Locale): SelectOption<Locale> =>
	localeOptions.find(option => option.value === locale) ?? localeOptions[0]!
