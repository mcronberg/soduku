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
const statsBtn = document.getElementById('statsBtn');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const aboutBtn = document.getElementById('aboutBtn');
const closeAboutBtn = document.getElementById('closeAboutBtn');
const helpBtn = document.getElementById('helpBtn');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const newGameAfterWin = document.getElementById('newGameAfterWin');
const closeCompletionBtn = document.getElementById('closeCompletionBtn');

// Inputs
const difficultySelect = document.getElementById('difficulty');
const gridSizeSelect = document.getElementById('gridSize');

// Modals
const statsModal = document.getElementById('statsModal');
const aboutModal = document.getElementById('aboutModal');
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
let errorCount = 0;
let currentGameInfo = null;

// ============================================================
// Game Log — stored in localStorage
// ============================================================
const GAME_LOG_KEY = 'sudoku_game_log';

function getGameLog() {
    try {
        const raw = localStorage.getItem(GAME_LOG_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGameToLog(entry) {
    try {
        const log = getGameLog();
        const logEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            gridSize: entry.gridSize,
            difficulty: entry.difficulty,
            completed: entry.completed,
            timeSeconds: entry.timeSeconds,
            errorCount: entry.errorCount
        };
        log.push(logEntry);
        // Keep max 100 entries to avoid localStorage bloat
        if (log.length > 100) log.splice(0, log.length - 100);
        localStorage.setItem(GAME_LOG_KEY, JSON.stringify(log));
        return logEntry;
    } catch (e) {
        console.warn('[GameLog] Failed to save:', e);
        return null;
    }
}

function getGameStats() {
    const log = getGameLog();
    if (log.length === 0) {
        return { totalGames: 0, completedGames: 0, completionRate: 0, totalErrors: 0, avgErrors: 0, avgTime: 0, byDifficulty: {}, bySize: {}, bestTimes: {} };
    }
    const completed = log.filter(g => g.completed);
    const totalErrors = log.reduce((sum, g) => sum + (g.errorCount || 0), 0);
    const avgTime = completed.length > 0
        ? Math.round(completed.reduce((sum, g) => sum + g.timeSeconds, 0) / completed.length)
        : 0;
    const bestTime = (diff) => {
        const times = completed.filter(g => g.difficulty === diff).map(g => g.timeSeconds);
        return times.length > 0 ? Math.min(...times) : null;
    };
    return {
        totalGames: log.length,
        completedGames: completed.length,
        completionRate: Math.round((completed.length / log.length) * 100),
        totalErrors,
        avgErrors: Math.round((totalErrors / log.length) * 10) / 10,
        avgTime,
        byDifficulty: {
            easy: completed.filter(g => g.difficulty === 'easy').length,
            medium: completed.filter(g => g.difficulty === 'medium').length,
            hard: completed.filter(g => g.difficulty === 'hard').length
        },
        bySize: {
            4: completed.filter(g => g.gridSize === 4).length,
            6: completed.filter(g => g.gridSize === 6).length,
            9: completed.filter(g => g.gridSize === 9).length
        },
        bestTimes: { easy: bestTime('easy'), medium: bestTime('medium'), hard: bestTime('hard') }
    };
}

// Public API — accessible from browser console
window.sudokuLog = {
    getLog: getGameLog,
    getStats: getGameStats,
    clear: () => { localStorage.removeItem(GAME_LOG_KEY); console.log('[GameLog] Cleared'); }
};

function fmtTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function renderStats() {
    const container = document.getElementById('statsContent');
    const log = getGameLog();
    const stats = getGameStats();

    if (log.length === 0) {
        container.innerHTML = '<p class="stats-empty">No games recorded yet.<br>Play a few rounds and come back!</p>';
        return;
    }

    const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    const bestTimesRows = ['easy', 'medium', 'hard']
        .filter(d => stats.bestTimes[d] !== null)
        .map(d => `<tr><td>${diffLabel[d]}</td><td>${fmtTime(stats.bestTimes[d])}</td></tr>`)
        .join('');

    // Last 10 games, newest first
    const recent = [...log].reverse().slice(0, 10);
    const recentRows = recent.map(g => {
        const date = new Date(g.date);
        const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        const status = g.completed ? '✅' : '❌';
        return `<tr><td>${dateStr}</td><td>${g.gridSize}×${g.gridSize}</td><td>${diffLabel[g.difficulty] || g.difficulty}</td><td>${fmtTime(g.timeSeconds)}</td><td>${g.errorCount}</td><td>${status}</td></tr>`;
    }).join('');

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">${stats.totalGames}</div><div class="stat-label">Games played</div></div>
            <div class="stat-card"><div class="stat-value">${stats.completedGames}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-value">${stats.completionRate}%</div><div class="stat-label">Completion rate</div></div>
            <div class="stat-card"><div class="stat-value">${stats.avgErrors}</div><div class="stat-label">Avg. errors</div></div>
        </div>
        ${bestTimesRows ? `
        <div class="help-section">
            <h3>🏆 Best times (completed)</h3>
            <table class="stats-table">
                <thead><tr><th>Difficulty</th><th>Time</th></tr></thead>
                <tbody>${bestTimesRows}</tbody>
            </table>
        </div>` : ''}
        <div class="help-section">
            <h3>📋 Last ${recent.length} games</h3>
            <table class="stats-table">
                <thead><tr><th>Date</th><th>Grid</th><th>Difficulty</th><th>Time</th><th>Errors</th><th></th></tr></thead>
                <tbody>${recentRows}</tbody>
            </table>
        </div>
        <div style="text-align:center">
            <button class="stats-clear-btn" id="clearStatsBtn">Clear history</button>
        </div>
    `;

    document.getElementById('clearStatsBtn').addEventListener('click', () => {
        if (confirm('Delete all game history?')) {
            localStorage.removeItem(GAME_LOG_KEY);
            renderStats();
        }
    });
}

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
    statsBtn.addEventListener('click', () => { renderStats(); showModal(statsModal); });
    closeStatsBtn.addEventListener('click', () => hideModal(statsModal));
    aboutBtn.addEventListener('click', () => showModal(aboutModal));
    closeAboutBtn.addEventListener('click', () => hideModal(aboutModal));
    helpBtn.addEventListener('click', () => showModal(helpModal));
    closeHelpBtn.addEventListener('click', () => hideModal(helpModal));

    newGameAfterWin.addEventListener('click', () => {
        hideModal(completionModal);
        leaveGame();
    });
    closeCompletionBtn.addEventListener('click', () => hideModal(completionModal));

    [statsModal, aboutModal, helpModal, completionModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal(modal);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(statsModal);
            hideModal(aboutModal);
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
            errorCount = 0;
            currentGameInfo = { gridSize, difficulty };

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
        errorCount++;
        return;
    }

    // Correct move — only count as new solve if cell was empty
    if (prevValue === null) solvedCount++;
    cells[row][col].value = value;
    board.updateCell(row, col, value);

    if (solvedCount >= emptyCellCount) {
        const elapsed = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0;
        stopTimer();
        if (currentGameInfo) {
            saveGameToLog({
                gridSize: currentGameInfo.gridSize,
                difficulty: currentGameInfo.difficulty,
                completed: true,
                timeSeconds: elapsed,
                errorCount
            });
        }
        setTimeout(() => showModal(completionModal), 300);
    }
}

function leaveGame() {
    // Save abandoned game to log if any moves were made
    if (currentGameInfo && (solvedCount > 0 || errorCount > 0)) {
        saveGameToLog({
            gridSize: currentGameInfo.gridSize,
            difficulty: currentGameInfo.difficulty,
            completed: false,
            timeSeconds: timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0,
            errorCount
        });
    }
    clearInterval(timerInterval);
    timerInterval = null;
    timerStart = null;
    board = null;
    solution = null;
    cells = null;
    solvedCount = 0;
    emptyCellCount = 0;
    errorCount = 0;
    currentGameInfo = null;
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

                const showUpdateToast = () => {
                    const container = document.getElementById('toastContainer');
                    // Avoid duplicate toasts
                    if (container.querySelector('.toast-update')) return;
                    const toast = document.createElement('div');
                    toast.className = 'toast toast-update';
                    toast.innerHTML = '\uD83D\uDD04 Ny version tilg\u00E6ngelig &mdash; <button class="toast-update-btn">Opdater nu</button>';
                    container.appendChild(toast);
                    toast.querySelector('.toast-update-btn').addEventListener('click', () => {
                        if (registration.waiting) {
                            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        }
                        toast.remove();
                    });
                };

                // Already waiting when page loads
                if (registration.waiting) {
                    showUpdateToast();
                }

                // New SW found after page load
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateToast();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });

        // Reload page when new SW takes control
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}
