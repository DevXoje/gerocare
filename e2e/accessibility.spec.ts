import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Result } from 'axe-core'

/**
 * Helper function to ensure lang attribute is set on <html> for accessibility
 */
async function ensureLangAttribute(page: { evaluate: (fn: () => void) => Promise<void> }) {
	await page.evaluate(() => {
		const htmlElement = document.documentElement
		if (!htmlElement.getAttribute('lang') || htmlElement.getAttribute('lang') === '') {
			htmlElement.setAttribute('lang', 'es')
		}
	})
	// Wait for DOM to stabilize using requestAnimationFrame
	await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(undefined))))
}

/**
 * Helper function to log accessibility violations
 */
function logViolations(violations: Result[], pageName: string) {
	const hasViolations = violations.length > 0
	if (!hasViolations) return

	console.log(`Accessibility violations found on ${pageName}:`)
	for (const violation of violations) {
		console.log(`- ${violation.id}: ${violation.description}`)
		if (violation.impact) {
			console.log(`  Impact: ${violation.impact}`)
		}
		if (violation.nodes) {
			console.log(`  Nodes affected: ${violation.nodes.length}`)
		}
	}
}

test.describe('Accessibility Tests', () => {
	test('Login page should not have accessibility violations', async ({ page }) => {
		await page.goto('/login')

		// Wait for page to load
		await page.waitForLoadState('load')

		// Ensure lang attribute is set on <html> for accessibility
		await ensureLangAttribute(page)

		// Run accessibility scan
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze()

		// Log violations for debugging
		logViolations(accessibilityScanResults.violations, '/login')

		// Assert no violations
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('Dashboard should not have accessibility violations', async ({ page }) => {
		// Navigate to dashboard (will redirect to login if not authenticated)
		await page.goto('/dashboard')

		// Wait for page to load
		await page.waitForLoadState('load')

		// Wait for main content to be visible (either dashboard or login page)
		const mainContent = page.locator('.dashboard-main, .login')
		await mainContent.waitFor({ timeout: 5000 })

		// Verify we are on dashboard page (not redirected to login)
		const dashboardLocator = page.locator('.dashboard-main')
		await expect(dashboardLocator).toBeVisible({ timeout: 1000 })

		// Ensure lang attribute is set on <html> for accessibility
		await ensureLangAttribute(page)

		// Run accessibility scan
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze()

		// Log violations for debugging
		logViolations(accessibilityScanResults.violations, '/dashboard')

		// Assert no violations
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('Residents page should not have accessibility violations', async ({ page }) => {
		// Navigate to residents page (will redirect to login if not authenticated)
		await page.goto('/residents')

		// Wait for page to load
		await page.waitForLoadState('load')

		// Wait for main content to be visible (either residents page or login)
		const mainContent = page.locator('.residents-page, .login')
		await mainContent.waitFor({ timeout: 5000 })

		// Verify we are on residents page (not redirected to login)
		const residentsLocator = page.locator('.residents-page')
		await expect(residentsLocator).toBeVisible({ timeout: 1000 })

		// Ensure lang attribute is set on <html> for accessibility
		await ensureLangAttribute(page)

		// Run accessibility scan
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze()

		// Log violations for debugging
		logViolations(accessibilityScanResults.violations, '/residents')

		// Assert no violations
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('Medication page should not have accessibility violations', async ({ page }) => {
		// Navigate to medication page (will redirect to login if not authenticated)
		await page.goto('/medication')

		// Wait for page to load
		await page.waitForLoadState('load')

		// Wait for main content to be visible (either medication page or login)
		const mainContent = page.locator('.medication-page, .login')
		await mainContent.waitFor({ timeout: 5000 })

		// Verify we are on medication page (not redirected to login)
		const medicationLocator = page.locator('.medication-page')
		await expect(medicationLocator).toBeVisible({ timeout: 1000 })

		// Ensure lang attribute is set on <html> for accessibility
		await ensureLangAttribute(page)

		// Run accessibility scan
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze()

		// Log violations for debugging
		logViolations(accessibilityScanResults.violations, '/medication')

		// Assert no violations
		expect(accessibilityScanResults.violations).toEqual([])
	})
})
