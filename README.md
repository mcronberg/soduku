# 🧩 Sudoku

A free, client-side Sudoku game that runs entirely in the browser — no server, no account, no install required.

**Play now:** [mcronberg.github.io/soduku](https://mcronberg.github.io/soduku)  
**Source:** [github.com/mcronberg/soduku](https://github.com/mcronberg/soduku)

> Created by [Michell Cronberg](https://github.com/mcronberg) with [Claude](https://claude.ai) (AI).  
> This project serves three purposes: a free Sudoku game for everyone, a clonable repo for adding your own features, and a practical example of AI-assisted development.

## Features

- **Progressive Web App (PWA)** - Install on any device, works offline
- **Puzzle Generation in the Browser** - Unique puzzles generated locally using backtracking
- **Guaranteed Unique Solution** - Every puzzle has exactly one correct answer
- **Move Validation** - Incorrect numbers are rejected with a shake animation
- **Live Timer** - Tracks your solve time, displayed in the completion screen
- **Three Difficulty Levels** - Easy, Medium, and Hard
- **Three Grid Sizes** - 4×4 (Kids), 6×6 (Mini Sudoku), and 9×9 (Standard)
- **Dark/Light Theme** - Automatic system preference detection or manual toggle
- **Responsive Design** - Works on mobile, tablet, and desktop
- **No Account Required** - Open and play

## Play

**Online:** [mcronberg.github.io/soduku](https://mcronberg.github.io/soduku)

Or clone the repo and open `docs/index.html` directly in any modern browser — no build step needed.

## Clone & Extend

```
git clone https://github.com/mcronberg/soduku.git
```

All game logic lives in `docs/js/`. There are no dependencies, no bundler, and no framework — just HTML, CSS, and ES modules. Open the files, make changes, refresh the browser.

## GitHub Pages Setup

1. Fork or push to GitHub
2. Go to **Settings → Pages**
3. Set Source to **Deploy from a branch** → `main` / `docs` folder
4. Save — the site will be live at `https://yourusername.github.io/Soduku`

## Project Structure

```
docs/
  index.html
  manifest.json    # PWA manifest
  sw.js            # Service worker for offline caching
  icons/
    icon.svg       # App icon (SVG)
  css/
    themes.css   # CSS custom properties for light/dark themes
    style.css    # Layout and component styles
  js/
    generator.js # Sudoku puzzle generator, validator, and test puzzles
    board.js     # Board renderer and keyboard/mouse interactions
    theme.js     # Dark/light theme toggle
    app.js       # Main application logic
tests/
  generator.test.js  # 25 unit tests for puzzle generation and validation
  e2e/
    theme.spec.js      # Theme toggle tests (light/dark mode)
    responsive.spec.js # Responsive design tests
    game.spec.js       # Game functionality tests
    visual.spec.js     # Visual regression tests
```

## Running Tests

### Unit Tests

Requires Node.js 22+. No dependencies needed.

```
npm test
```

### E2E Tests (Playwright)

Requires Node.js and npm. Install dependencies first:

```
npm install
npx playwright install chromium
```

Run E2E tests:

```
npm run test:e2e           # Run tests headless
npm run test:e2e:headed    # Run tests with browser visible
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:all       # Run all browser projects
```

Run all tests:

```
npm run test:all           # Unit tests + E2E tests
```

### Visual Regression Tests

Generate baseline screenshots:

```
npm run test:visual:update
```

Compare against baselines:

```
npm run test:visual
```

## Static Test Puzzles

For UI testing and automated verification, `generator.js` exports static puzzles with known solutions:

```javascript
import { getTestPuzzle, TEST_PUZZLES } from './docs/js/generator.js';

// Get 4x4 test puzzle
const { puzzle, solution, emptyCells } = getTestPuzzle(4);

// emptyCells contains all empty positions with their correct values:
// [{ row: 0, col: 0, value: 1 }, { row: 1, col: 1, value: 4 }, ...]
```

Both 4×4 and 9×9 test puzzles are available. These never change, making them ideal for:
- Playwright/Selenium UI tests
- Visual regression testing
- Manual QA verification

## About This Project

This repo was built entirely through AI-assisted development using [Claude](https://claude.ai) inside VS Code with GitHub Copilot. It is intentionally simple — vanilla JS, vanilla CSS, zero dependencies — so the code is easy to read, understand, and extend. A good starting point if you want to learn how AI tools can help you build real software from scratch.

