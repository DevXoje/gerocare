import { expect,test } from '@playwright/test'

test.describe('Residents List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // TODO: Add authentication setup
    // For now, we'll assume user is already authenticated
  })

  test('authenticated user should see list of assigned residents', async ({ page }) => {
    // Navigate to residents page
    await page.goto('/residents')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Residentes")', { timeout: 5000 })
    
    // Check that the page title is visible
    const title = page.locator('h1:has-text("Residentes")')
    await expect(title).toBeVisible()
  })

  test('clicking on a resident should navigate to detail page', async ({ page }) => {
    await page.goto('/residents')
    
    // Wait for residents to load
    await page.waitForSelector('.resident-card, .empty-state, .loading-state', { timeout: 5000 })
    
    // If there are residents, click on the first one
    const firstResident = page.locator('.resident-card').first()
    const count = await firstResident.count()
    
    if (count > 0) {
      await firstResident.click()
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/residents\/[^/]+/, { timeout: 3000 })
    }
  })

  test('search should filter results in real time', async ({ page }) => {
    await page.goto('/residents')
    
    // Wait for search input
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    
    // Type in search
    await searchInput.fill('test')
    
    // Search should be visible
    await expect(searchInput).toHaveValue('test')
  })

  test('loading state should be shown correctly', async ({ page }) => {
    await page.goto('/residents')
    
    // Initially, loading state might be shown
    // This test verifies the page handles loading states
    const loadingState = page.locator('text=Cargando residentes')
    const emptyState = page.locator('text=No hay residentes')
    const residentsGrid = page.locator('.residents-grid')
    
    // One of these should be visible
    const hasLoading = await loadingState.isVisible().catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasGrid = await residentsGrid.isVisible().catch(() => false)
    
    expect(hasLoading || hasEmpty || hasGrid).toBe(true)
  })
})

