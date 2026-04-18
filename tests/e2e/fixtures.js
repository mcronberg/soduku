/**
 * Test utilities and fixtures for Playwright tests
 */
import { test as base } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// File URL to docs/index.html
export const INDEX_URL = `file:///${path.resolve(__dirname, '../../docs/index.html').replace(/\\/g, '/')}`;

/**
 * Extended test fixture that provides the game URL
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        // Override goto to use our file URL when '/' is passed
        const originalGoto = page.goto.bind(page);
        page.goto = async (url, options) => {
            if (url === '/') {
                return originalGoto(INDEX_URL, options);
            }
            return originalGoto(url, options);
        };
        await use(page);
    },
});

export { expect } from '@playwright/test';
