/**
 * Theme Manager
 * Handles dark/light theme switching with system preference detection
 */

const THEME_KEY = 'sudoku-theme';

/**
 * Get the current theme preference
 * @returns {'light' | 'dark' | 'system'}
 */
export function getThemePreference() {
    return localStorage.getItem(THEME_KEY) || 'system';
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 * @returns {'light' | 'dark'}
 */
export function getEffectiveTheme() {
    const preference = getThemePreference();
    if (preference === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preference;
}

/**
 * Apply theme to document
 * @param {'light' | 'dark'} theme
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

/**
 * Update theme toggle button icon
 * @param {'light' | 'dark'} theme
 */
function updateThemeButton(theme) {
    const btn = document.getElementById('themeBtn');
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
    const current = getEffectiveTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

/**
 * Initialize theme system
 */
export function initTheme() {
    // Apply initial theme
    applyTheme(getEffectiveTheme());

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (getThemePreference() === 'system') {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Setup toggle button
    const btn = document.getElementById('themeBtn');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
}
