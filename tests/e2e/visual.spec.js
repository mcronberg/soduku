/**
 * Sudoku UI Tests - Visual Regression
 * Takes screenshots to catch visual changes
 */
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    test('start screen light mode', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot('start-screen-light.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('start screen dark mode', async ({ page }) => {
        await page.goto('/');
        await page.locator('#themeBtn').click();
        await expect(page).toHaveScreenshot('start-screen-dark.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('game board 9x9 light mode', async ({ page }) => {
        await page.goto('/');
        await page.locator('#newGameBtn').click();

        // Wait for board to render
        await page.waitForSelector('#sudokuBoard .cell');

        await expect(page).toHaveScreenshot('game-9x9-light.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('game board 4x4 kids mode', async ({ page }) => {
        await page.goto('/');
        await page.locator('#gridSize').selectOption('4');
        await page.locator('#newGameBtn').click();

        await page.waitForSelector('#sudokuBoard .cell');

        await expect(page).toHaveScreenshot('game-4x4-kids.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('help modal', async ({ page }) => {
        await page.goto('/');
        await page.locator('#helpBtn').click();

        await expect(page).toHaveScreenshot('help-modal.png', {
            maxDiffPixelRatio: 0.1
        });
    });
});

test.describe('Mobile Visual Regression', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('mobile start screen', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot('mobile-start.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('mobile game board', async ({ page }) => {
        await page.goto('/');
        await page.locator('#newGameBtn').click();
        await page.waitForSelector('#sudokuBoard .cell');

        await expect(page).toHaveScreenshot('mobile-game.png', {
            maxDiffPixelRatio: 0.1
        });
    });
});
