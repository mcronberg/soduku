/**
 * Sudoku UI Tests - Responsive Design
 * Tests that the game works correctly on mobile, tablet, and desktop
 */
import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display start screen on load', async ({ page }) => {
        const startScreen = page.locator('#startScreen');
        await expect(startScreen).toBeVisible();
    });

    test('should show difficulty selector', async ({ page }) => {
        const difficultySelect = page.locator('#difficulty');
        await expect(difficultySelect).toBeVisible();
    });

    test('should show grid size selector', async ({ page }) => {
        const gridSizeSelect = page.locator('#gridSize');
        await expect(gridSizeSelect).toBeVisible();
    });

    test('should have New Game button visible', async ({ page }) => {
        const newGameBtn = page.locator('#newGameBtn');
        await expect(newGameBtn).toBeVisible();
    });
});

test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should display correctly on mobile', async ({ page }) => {
        await page.goto('/');

        const startScreen = page.locator('#startScreen');
        await expect(startScreen).toBeVisible();

        // Start a game
        await page.locator('#newGameBtn').click();

        // Board should be visible
        const board = page.locator('#sudokuBoard');
        await expect(board).toBeVisible();

        // Number pad should be visible
        const numPad = page.locator('.number-pad');
        await expect(numPad).toBeVisible();
    });

    test('board should fit within viewport on mobile', async ({ page }) => {
        await page.goto('/');
        await page.locator('#newGameBtn').click();

        const board = page.locator('#sudokuBoard');
        const box = await board.boundingBox();

        expect(box.width).toBeLessThanOrEqual(375);
    });
});

test.describe('Tablet Layout', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad

    test('should display correctly on tablet', async ({ page }) => {
        await page.goto('/');

        await page.locator('#newGameBtn').click();

        const board = page.locator('#sudokuBoard');
        await expect(board).toBeVisible();
    });
});

test.describe('Desktop Layout', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should display correctly on desktop', async ({ page }) => {
        await page.goto('/');

        await page.locator('#newGameBtn').click();

        const board = page.locator('#sudokuBoard');
        await expect(board).toBeVisible();
    });
});
