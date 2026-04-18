---
description: Guidelines for the Sudoku project - pure HTML, CSS, JS with no dependencies
applyTo: '**/*.{html,css,js}'
---

# Sudoku Project Guidelines

## Tech Stack

- **Pure HTML, CSS, JavaScript** - No frameworks, no libraries, no dependencies
- **ES Modules** - Use `import`/`export` for code organization
- **CSS Custom Properties** - Use variables from `themes.css` for theming

## Project Structure

```
docs/
  index.html          # Single HTML file
  css/
    themes.css        # CSS custom properties (light/dark)
    style.css         # All styles
  js/
    generator.js      # Puzzle generation and validation
    board.js          # Board rendering and interaction
    theme.js          # Theme toggle logic
    app.js            # Main application entry point
tests/
  generator.test.js   # Unit tests (Node.js test runner)
```

## Responsive Design Requirements

All code must work on:
- **Mobile** (320px - 480px)
- **Tablet** (481px - 1024px)  
- **Desktop** (1025px+)

Use CSS media queries and flexible layouts:
```css
/* Mobile first approach */
.element { /* base mobile styles */ }

@media (min-width: 481px) { /* tablet */ }
@media (min-width: 1025px) { /* desktop */ }
```

## Code Style

- Use `const` and `let`, never `var`
- Use template literals for string interpolation
- Use arrow functions for callbacks
- Add JSDoc comments for public functions
- Keep functions small and focused

## Cache Busting

All CSS and JS files use version query strings to prevent browser caching:

```html
<link rel="stylesheet" href="css/themes.css?v=1.0.0">
<link rel="stylesheet" href="css/style.css?v=1.0.0">
<script type="module" src="js/app.js?v=1.0.0"></script>
```

**When making changes:** Update the version number (e.g., `?v=1.0.1`) in `index.html` to force browsers to fetch the new files.

The HTML also includes no-cache meta tags:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

## Testing

Run tests with Node.js 22+ (no dependencies):
```bash
node --test tests/generator.test.js
```

**Static test puzzles** are available via `getTestPuzzle(4)` or `getTestPuzzle(9)` from `generator.js`. Use these for UI/automation testing - they have known solutions that never change.

**Important:** After any code change that affects game logic, run all tests to verify nothing is broken. All tests must pass before considering a change complete.

## Documentation

**Important:** After any code change or new feature, update `README.md` to reflect:
- New features in the Features section
- Changes to project structure
- New test coverage
- Updated usage instructions