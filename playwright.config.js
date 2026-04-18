import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { open: 'never' }]],

    /* Start local server before running tests */
    webServer: {
        command: 'npx serve docs -l 3333',
        url: 'http://localhost:3333',
        reuseExistingServer: !process.env.CI,
    },

    use: {
        baseURL: 'http://localhost:3333',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        // Desktop Chrome
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Mobile viewport (using Chrome)
        {
            name: 'mobile',
            use: { ...devices['Pixel 5'] },
        },

        // Tablet viewport (using Chrome)
        {
            name: 'tablet',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 768, height: 1024 },
            },
        },
    ],
});
