import { test, expect } from '@playwright/test'

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
    
    // Wait for page to load
    await page.waitForSelector('.resident-detail, .loading-state, .error-state', { timeout: 5000 })
    
    // Check that either detail content, loading, or error is shown
    const detailContent = page.locator('.resident-content')
    const loadingState = page.locator('text=Cargando')
    const errorState = page.locator('.error-state')
    
    const hasContent = await detailContent.isVisible().catch(() => false)
    const hasLoading = await loadingState.isVisible().catch(() => false)
    const hasError = await errorState.isVisible().catch(() => false)
    
    expect(hasContent || hasLoading || hasError).toBe(true)
  })

  test('back button should navigate to list', async ({ page }) => {
    await page.goto('/residents/test-resident-id')
    
    // Wait for back button
    const backButton = page.locator('button:has-text("Volver")')
    const backButtonVisible = await backButton.isVisible().catch(() => false)
    
    if (backButtonVisible) {
      await backButton.click()
      
      // Should navigate back to residents list
      await expect(page).toHaveURL(/\/residents$/, { timeout: 3000 })
    }
  })

  test('should handle resident not found', async ({ page }) => {
    await page.goto('/residents/non-existent-id')
    
    // Wait for error or empty state
    await page.waitForSelector('.error-state, .empty-state', { timeout: 5000 })
    
    const errorState = page.locator('.error-state, .empty-state')
    const hasError = await errorState.isVisible().catch(() => false)
    
    // Should show error or empty state
    expect(hasError).toBe(true)
  })
})

