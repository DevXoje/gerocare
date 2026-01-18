import type { SelectOption } from '@/shared/domain/SelectOption'
export const THEME_STORAGE_KEY = 'theme-mode' as const

export enum ThemeMode {
	Light = 'light',
	Dark = 'dark',
	Auto = 'auto',
}

export const isThemeMode = (value: string | null | undefined): value is ThemeMode =>
	!!value && themeModeValues.includes(value as ThemeMode)

export const themeModeOptions: SelectOption<ThemeMode>[] = [
	{ value: ThemeMode.Light, label: 'Claro', icon: '☀️' },
	{ value: ThemeMode.Dark, label: 'Oscuro', icon: '🌙' },
	{ value: ThemeMode.Auto, label: 'Automático', icon: '💻' },
]

export const themeModeLabels: Record<ThemeMode, string> = {
	[ThemeMode.Light]: 'Claro',
	[ThemeMode.Dark]: 'Oscuro',
	[ThemeMode.Auto]: 'Automático',
}

export const themeModeIcons: Record<ThemeMode, string> = {
	[ThemeMode.Light]: '☀️',
	[ThemeMode.Dark]: '🌙',
	[ThemeMode.Auto]: '💻',
}

export const themeModeValues: ThemeMode[] = [ThemeMode.Light, ThemeMode.Dark, ThemeMode.Auto]

export const getThemeOption = (themeMode: ThemeMode): SelectOption<ThemeMode> =>
	themeModeOptions.find(option => option.value === themeMode) ?? themeModeOptions[0]!
