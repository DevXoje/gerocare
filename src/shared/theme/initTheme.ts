/**
 * Initialize theme before app mount to prevent FOUC (Flash of Unstyled Content)
 * This function must be called synchronously before rendering
 */

export function initTheme() {
	if (typeof window === 'undefined') return

	const THEME_STORAGE_KEY = 'theme-mode'
	const root = document.documentElement

	function getSystemPreference(): boolean {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}

	try {
		const saved = localStorage.getItem(THEME_STORAGE_KEY)
		const mode = saved === 'light' || saved === 'dark' ? saved : 'auto'

		root.classList.remove('light', 'dark')

		if (mode === 'auto') {
			const prefersDark = getSystemPreference()
			root.classList.toggle('dark', prefersDark)
		} else if (mode === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.add('light')
		}
	} catch {
		// Si hay error al leer localStorage, usar preferencia del sistema
		root.classList.remove('light', 'dark')
		const prefersDark = getSystemPreference()
		root.classList.toggle('dark', prefersDark)
	}
}
