/**
 * Design Tokens - TypeScript Constants
 *
 * These tokens are synchronized with the CSS Custom Properties defined in
 * src/assets/themes/tokens.css and src/assets/themes/semantic.css
 *
 * This file is primarily for:
 * - Type-safe autocompletion in development
 * - IDE support for design tokens
 * - Documentation of available tokens
 *
 * Note: These are not used at runtime. All styling should use CSS variables directly.
 */

export const tokens = {
	colors: {
		primary: {
			50: '#eef2ff',
			500: '#667eea',
			600: '#5568d3',
			700: '#764ba2',
		},
		neutral: {
			50: '#f9fafb',
			200: '#e5e7eb',
			500: '#6b7280',
		},
		semantic: {
			bg: {
				primary: 'var(--color-bg-primary)',
				secondary: 'var(--color-bg-secondary)',
				tertiary: 'var(--color-bg-tertiary)',
				hover: 'var(--color-bg-hover)',
				active: 'var(--color-bg-active)',
			},
			text: {
				primary: 'var(--color-text-primary)',
				secondary: 'var(--color-text-secondary)',
				tertiary: 'var(--color-text-tertiary)',
				link: 'var(--color-text-link)',
				linkHover: 'var(--color-text-link-hover)',
			},
			border: {
				default: 'var(--color-border-default)',
				hover: 'var(--color-border-hover)',
				focus: 'var(--color-border-focus)',
				error: 'var(--color-border-error)',
				success: 'var(--color-border-success)',
			},
		},
	},
	spacing: {
		xs: 'var(--spacing-xs)',
		sm: 'var(--spacing-sm)',
		md: 'var(--spacing-md)',
		lg: 'var(--spacing-lg)',
		xl: 'var(--spacing-xl)',
		'2xl': 'var(--spacing-2xl)',
		'3xl': 'var(--spacing-3xl)',
	},
	typography: {
		fontSize: {
			xs: 'var(--font-size-xs)',
			sm: 'var(--font-size-sm)',
			base: 'var(--font-size-base)',
			lg: 'var(--font-size-lg)',
			xl: 'var(--font-size-xl)',
			'2xl': 'var(--font-size-2xl)',
		},
		fontWeight: {
			normal: 'var(--font-weight-normal)',
			medium: 'var(--font-weight-medium)',
			semibold: 'var(--font-weight-semibold)',
			bold: 'var(--font-weight-bold)',
		},
	},
	shadows: {
		sm: 'var(--shadow-sm)',
		md: 'var(--shadow-md)',
		lg: 'var(--shadow-lg)',
		xl: 'var(--shadow-xl)',
	},
	radius: {
		sm: 'var(--radius-sm)',
		md: 'var(--radius-md)',
		lg: 'var(--radius-lg)',
		xl: 'var(--radius-xl)',
		full: 'var(--radius-full)',
	},
	transitions: {
		fast: 'var(--transition-fast)',
		base: 'var(--transition-base)',
		slow: 'var(--transition-slow)',
	},
} as const

// Helper type for type-safety (optional)
export type ColorToken = typeof tokens.colors
