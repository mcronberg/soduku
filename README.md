# 🧩 Sudoku

A free, client-side Sudoku game that runs entirely in the browser — no server, no account, no install required.

**Play now:** [mcronberg.github.io/Soduku](https://mcronberg.github.io/Soduku)  
**Source:** [github.com/mcronberg/Soduku](https://github.com/mcronberg/Soduku)

> Created by [Michell Cronberg](https://github.com/mcronberg) with [Claude](https://claude.ai) (AI).  
> This project serves three purposes: a free Sudoku game for everyone, a clonable repo for adding your own features, and a practical example of AI-assisted development.

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

**Online:** [mcronberg.github.io/Soduku](https://mcronberg.github.io/Soduku)

Or clone the repo and open `docs/index.html` directly in any modern browser — no build step needed.

## Clone & Extend

```
git clone https://github.com/mcronberg/Soduku.git
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

## About This Project

This repo was built entirely through AI-assisted development using [Claude](https://claude.ai) inside VS Code with GitHub Copilot. It is intentionally simple — vanilla JS, vanilla CSS, zero dependencies — so the code is easy to read, understand, and extend. A good starting point if you want to learn how AI tools can help you build real software from scratch.

