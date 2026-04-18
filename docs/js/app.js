/**
 * Sudoku - Single Player Client-Side App
 */

import { initTheme } from './theme.js';
import { generateSudoku, validateMove } from './generator.js';
import { createBoardRenderer } from './board.js';

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const sudokuBoard = document.getElementById('sudokuBoard');
const displayDifficulty = document.getElementById('displayDifficulty');

// Buttons
const newGameBtn = document.getElementById('newGameBtn');
const leaveGameBtn = document.getElementById('leaveGameBtn');
const helpBtn = document.getElementById('helpBtn');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const newGameAfterWin = document.getElementById('newGameAfterWin');
const closeCompletionBtn = document.getElementById('closeCompletionBtn');

// Inputs
const difficultySelect = document.getElementById('difficulty');
const gridSizeSelect = document.getElementById('gridSize');

// Modals
const helpModal = document.getElementById('helpModal');
const completionModal = document.getElementById('completionModal');

// State
let board = null;
let solution = null;
let cells = null;
let emptyCellCount = 0;
let solvedCount = 0;
let timerStart = null;
let timerInterval = null;

function startTimer() {
    timerStart = Date.now();
    clearInterval(timerInterval);
    const display = document.getElementById('liveTimer');
    display.textContent = '0:00';
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStart) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        display.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    const elapsed = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0;
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('completionTime').textContent =
        `${m}:${String(s).padStart(2, '0')}`;
}

function init() {
    initTheme();
    setupEventListeners();
}

function setupEventListeners() {
    newGameBtn.addEventListener('click', () => {
        const difficulty = difficultySelect.value;
        const gridSize = parseInt(gridSizeSelect.value, 10);
        createGame(difficulty, gridSize);
    });

    leaveGameBtn.addEventListener('click', leaveGame);

    // Number pad — click
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = parseInt(btn.dataset.num, 10);
            const selected = board?.getSelected();
            if (selected) {
                handleCellInput(selected.row, selected.col, num === 0 ? null : num);
            }
        });

        // Drag & drop support
        btn.setAttribute('draggable', 'true');
        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', btn.dataset.num);
            e.dataTransfer.effectAllowed = 'copy';
            btn.classList.add('dragging');
        });
        btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
    });

    // Touch drag support for mobile/tablet
    let touchDragNum = null;
    let touchGhost = null;
    let touchCurrentCell = null;

    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            // Only handle single touch
            if (e.touches.length !== 1) return;

            touchDragNum = btn.dataset.num;
            btn.classList.add('dragging');

            // Create ghost element
            touchGhost = document.createElement('div');
            touchGhost.className = 'touch-drag-ghost';
            touchGhost.textContent = touchDragNum === '0' ? '✕' : touchDragNum;
            document.body.appendChild(touchGhost);

            const touch = e.touches[0];
            touchGhost.style.left = `${touch.clientX - 25}px`;
            touchGhost.style.top = `${touch.clientY - 25}px`;
        }, { passive: true });

        btn.addEventListener('touchmove', (e) => {
            if (!touchGhost) return;
            e.preventDefault(); // Prevent scrolling while dragging

            const touch = e.touches[0];
            touchGhost.style.left = `${touch.clientX - 25}px`;
            touchGhost.style.top = `${touch.clientY - 25}px`;

            // Find cell under finger
            const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = elemBelow?.closest('.cell');

            // Update highlight
            if (touchCurrentCell && touchCurrentCell !== cell) {
                touchCurrentCell.classList.remove('drag-over');
            }
            if (cell && !cell.classList.contains('cell-original')) {
                cell.classList.add('drag-over');
                touchCurrentCell = cell;
            } else {
                touchCurrentCell = null;
            }
        }, { passive: false });

        btn.addEventListener('touchend', () => {
            btn.classList.remove('dragging');

            if (touchCurrentCell && touchDragNum !== null) {
                const row = parseInt(touchCurrentCell.dataset.row, 10);
                const col = parseInt(touchCurrentCell.dataset.col, 10);
                const num = parseInt(touchDragNum, 10);
                touchCurrentCell.classList.remove('drag-over');
                handleCellInput(row, col, num === 0 ? null : num);
            }

            // Cleanup
            if (touchGhost) {
                touchGhost.remove();
                touchGhost = null;
            }
            touchDragNum = null;
            touchCurrentCell = null;
        });

        btn.addEventListener('touchcancel', () => {
            btn.classList.remove('dragging');
            if (touchCurrentCell) touchCurrentCell.classList.remove('drag-over');
            if (touchGhost) touchGhost.remove();
            touchGhost = null;
            touchDragNum = null;
            touchCurrentCell = null;
        });
    });

    // Drop targets on board cells
    sudokuBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const cell = e.target.closest('.cell');
        if (cell && !cell.classList.contains('cell-original')) {
            cell.classList.add('drag-over');
        }
    });

    sudokuBoard.addEventListener('dragleave', (e) => {
        const cell = e.target.closest('.cell');
        if (cell) cell.classList.remove('drag-over');
    });

    sudokuBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        const cell = e.target.closest('.cell');
        if (cell) {
            cell.classList.remove('drag-over');
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);
            const num = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(row) && !isNaN(col) && !cell.classList.contains('cell-original')) {
                handleCellInput(row, col, num === 0 ? null : num);
            }
        }
    });

    // Modals
    helpBtn.addEventListener('click', () => showModal(helpModal));
    closeHelpBtn.addEventListener('click', () => hideModal(helpModal));

    newGameAfterWin.addEventListener('click', () => {
        hideModal(completionModal);
        leaveGame();
    });
    closeCompletionBtn.addEventListener('click', () => hideModal(completionModal));

    [helpModal, completionModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal(modal);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(helpModal);
            hideModal(completionModal);
        }
    });
}

/**
 * Generate a new puzzle and start the game
 */
function createGame(difficulty, gridSize) {
    newGameBtn.disabled = true;
    newGameBtn.textContent = 'Generating...';

    // Defer so the UI updates before the blocking backtracking computation
    setTimeout(() => {
        try {
            const { puzzle, solution: sol } = generateSudoku({ difficulty, gridSize });
            solution = sol;
            emptyCellCount = 0;
            solvedCount = 0;

            // Build 2D cells array
            cells = [];
            for (let row = 0; row < gridSize; row++) {
                cells[row] = [];
                for (let col = 0; col < gridSize; col++) {
                    const val = puzzle[row][col];
                    const isOriginal = val !== 0;
                    cells[row][col] = { row, col, value: isOriginal ? val : null, isOriginal };
                    if (!isOriginal) emptyCellCount++;
                }
            }

            board = createBoardRenderer(sudokuBoard, {
                gridSize,
                onCellSelect: (row, col, value) => {
                    if (value !== undefined) handleCellInput(row, col, value);
                }
            });

            board.render(cells);
            displayDifficulty.textContent =
                difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            updateNumPad(gridSize);
            showGameScreen();
            startTimer();
        } catch {
            showToast('Failed to generate puzzle', 'error');
        } finally {
            newGameBtn.disabled = false;
            newGameBtn.textContent = 'Create Game';
        }
    }, 10);
}

/**
 * Handle a number input on a cell
 */
function handleCellInput(row, col, value) {
    if (!cells || !solution) return;
    if (cells[row]?.[col]?.isOriginal) return;

    const prevValue = cells[row][col].value;

    if (value === null) {
        // Clear the cell
        if (prevValue !== null) {
            solvedCount--;
            cells[row][col].value = null;
            board.updateCell(row, col, null);
        }
        return;
    }

    if (!validateMove(solution, row, col, value)) {
        board.shakeCell(row, col);
        showToast('Incorrect number!', 'error');
        return;
    }

    // Correct move — only count as new solve if cell was empty
    if (prevValue === null) solvedCount++;
    cells[row][col].value = value;
    board.updateCell(row, col, value);

    if (solvedCount >= emptyCellCount) {
        stopTimer();
        setTimeout(() => showModal(completionModal), 300);
    }
}

function leaveGame() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStart = null;
    board = null;
    solution = null;
    cells = null;
    solvedCount = 0;
    emptyCellCount = 0;
    showStartScreen();
}

function updateNumPad(gridSize) {
    document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
        const num = parseInt(btn.dataset.num, 10);
        btn.style.display = (num === 0 || num <= gridSize) ? '' : 'none';
    });
}

function showGameScreen() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
}

function showStartScreen() {
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function showModal(modal) { modal.classList.remove('hidden'); }
function hideModal(modal) { modal.classList.add('hidden'); }

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}
