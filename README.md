# 🧩 Sudoku

A client-side Sudoku game that runs entirely in the browser — no server required.

## Features

- **Puzzle Generation in the Browser** - Unique puzzles generated locally using backtracking
- **Guaranteed Unique Solution** - Every puzzle has exactly one correct answer
- **Move Validation** - Incorrect numbers are rejected with a shake animation
- **Live Timer** - Tracks your solve time, displayed in the completion screen
- **Three Difficulty Levels** - Easy, Medium, and Hard (4×4 and 9×9 grids)
- **Dark/Light Theme** - Automatic system preference detection or manual toggle
- **Responsive Design** - Works on mobile, tablet, and desktop
- **No Account Required** - Open and play

## Play

Hosted on GitHub Pages: **https://yourusername.github.io/repository-name**

Or open `docs/index.html` directly in any modern browser.

## GitHub Pages Setup

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set Source to **Deploy from a branch** → `main` / `docs` folder
4. Save — the site will be live at `https://yourusername.github.io/repository-name`

## Project Structure

```
docs/
  index.html
  css/
    themes.css   # CSS custom properties for light/dark themes
    style.css    # Layout and component styles
  js/
    generator.js # Sudoku puzzle generator and move validator
    board.js     # Board renderer and keyboard/mouse interactions
    theme.js     # Dark/light theme toggle
    app.js       # Main application logic
tests/
  generator.test.js  # 13 unit tests for puzzle generation and validation
```

## Running Tests

Requires Node.js 22+. No dependencies needed.

```
node --test tests/generator.test.js
```
