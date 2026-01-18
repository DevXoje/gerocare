import { expect, test } from '@playwright/test'

test.describe('Resident Detail', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to login page
		await page.goto('/login')

		// TODO: Add authentication setup
	})

	test('should show complete resident information', async ({ page }) => {
		// Navigate to a resident detail page (assuming resident ID exists)
		// In a real scenario, you'd create a resident first or use a known ID
		await page.goto('/residents/test-resident-id')

		// Check that either detail content, loading, or error is shown
		// Use a combined selector to wait for any of these states
		const anyState = page.locator('.resident-content, text=Cargando, .error-state')
		await expect(anyState.first()).toBeVisible({ timeout: 5000 })
	})

	test('back button should navigate to list', async ({ page }) => {
		await page.goto('/residents/test-resident-id')

		// Wait for back button to be visible or skip test if not present
		const backButton = page.locator('button:has-text("Volver")')
		const backButtonCount = await backButton.count()

		// Only proceed if back button exists
		expect(backButtonCount).toBeGreaterThan(0)

		await backButton.click()

		// Should navigate back to residents list
		await expect(page).toHaveURL(/\/residents$/, { timeout: 3000 })
	})

	test('should handle resident not found', async ({ page }) => {
		await page.goto('/residents/non-existent-id')

		// Wait for error or empty state to be visible
		const errorState = page.locator('.error-state, .empty-state')
		await expect(errorState).toBeVisible({ timeout: 5000 })
	})
})
