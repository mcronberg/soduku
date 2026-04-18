/**
 * Sudoku UI Tests - Theme Toggle
 * Tests dark/light mode functionality
 */
import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should start with light theme by default', async ({ page }) => {
        const html = page.locator('html');
        const theme = await html.getAttribute('data-theme');
        expect(theme === null || theme === 'light').toBeTruthy();
    });

    test('should toggle to dark theme when button clicked', async ({ page }) => {
        const themeBtn = page.locator('#themeBtn');
        await themeBtn.click();
        
        const html = page.locator('html');
        await expect(html).toHaveAttribute('data-theme', 'dark');
    });

    test('should toggle back to light theme on second click', async ({ page }) => {
        const themeBtn = page.locator('#themeBtn');
        
        // Click twice
        await themeBtn.click();
        await themeBtn.click();
        
        const html = page.locator('html');
        await expect(html).toHaveAttribute('data-theme', 'light');
    });

    test('should persist theme in localStorage', async ({ page }) => {
        const themeBtn = page.locator('#themeBtn');
        await themeBtn.click();
        
        // Check localStorage
        const storedTheme = await page.evaluate(() => localStorage.getItem('sudoku-theme'));
        expect(storedTheme).toBe('dark');
    });

    test('should respect system dark mode preference', async ({ page }) => {
        // Emulate dark mode preference BEFORE loading the page
        await page.emulateMedia({ colorScheme: 'dark' });
        
        // Clear any stored preference and reload
        await page.evaluate(() => localStorage.removeItem('sudoku-theme'));
        await page.reload();
        
        const html = page.locator('html');
        await expect(html).toHaveAttribute('data-theme', 'dark');
    });

    test('should update button icon when theme changes', async ({ page }) => {
        const themeBtn = page.locator('#themeBtn');
        
        // Light mode shows moon icon (click to go dark)
        await expect(themeBtn).toContainText('🌙');
        
        await themeBtn.click();
        
        // Dark mode shows sun icon (click to go light)
        await expect(themeBtn).toContainText('☀️');
    });
});
