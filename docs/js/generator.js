/**
 * Sudoku Puzzle Generator
 * Generates valid Sudoku puzzles with unique solutions.
 * Supports different difficulty levels.
 */

/**
 * Get box dimensions for a given grid size
 * @param {number} size - Grid size
 * @returns {{ boxRows: number, boxCols: number }}
 */
function getBoxDimensions(size) {
    if (size === 6) {
        // Mini Sudoku: 6x6 with 3x2 boxes (3 cols, 2 rows)
        return { boxRows: 2, boxCols: 3 };
    }
    // Standard square boxes for 4x4 and 9x9
    const boxSize = Math.sqrt(size);
    return { boxRows: boxSize, boxCols: boxSize };
}

/**
 * Difficulty settings - number of cells to remove from complete puzzle
 * Values are for 9x9 grid (81 cells)
 */
const DIFFICULTY_SETTINGS = {
    easy: { minRemove: 30, maxRemove: 35 },
    medium: { minRemove: 40, maxRemove: 45 },
    hard: { minRemove: 50, maxRemove: 55 }
};

/**
 * Difficulty settings for 6x6 Mini Sudoku (36 cells)
 */
const DIFFICULTY_SETTINGS_6x6 = {
    easy: { minRemove: 14, maxRemove: 18 },
    medium: { minRemove: 18, maxRemove: 22 },
    hard: { minRemove: 22, maxRemove: 26 }
};

/**
 * Difficulty settings for 4x4 kids grid (16 cells)
 */
const DIFFICULTY_SETTINGS_4x4 = {
    easy: { minRemove: 6, maxRemove: 8 },
    medium: { minRemove: 8, maxRemove: 10 },
    hard: { minRemove: 10, maxRemove: 12 }
};

/**
 * Generate a complete valid Sudoku solution using backtracking
 * @param {number} size - Grid size (default 9)
 * @returns {number[][]} Complete Sudoku grid
 */
function generateSolution(size = 9) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    const { boxRows, boxCols } = getBoxDimensions(size);

    function isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num) return false;
        }

        // Check column
        for (let y = 0; y < size; y++) {
            if (grid[y][col] === num) return false;
        }

        // Check box (using boxRows and boxCols for rectangular boxes)
        const boxRow = Math.floor(row / boxRows) * boxRows;
        const boxCol = Math.floor(col / boxCols) * boxCols;
        for (let y = boxRow; y < boxRow + boxRows; y++) {
            for (let x = boxCol; x < boxCol + boxCols; x++) {
                if (grid[y][x] === num) return false;
            }
        }

        return true;
    }

    function solve(grid) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    // Shuffle numbers for randomness
                    const nums = shuffleArray([...Array(size)].map((_, i) => i + 1));
                    for (const num of nums) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve(grid);
    return grid;
}

/**
 * Count solutions for a puzzle (stops at 2)
 * @param {number[][]} puzzle - Puzzle to check
 * @returns {number} Number of solutions (0, 1, or 2)
 */
function countSolutions(puzzle, size = 9) {
    const grid = puzzle.map(row => [...row]);
    const { boxRows, boxCols } = getBoxDimensions(size);
    let count = 0;

    function isValid(row, col, num) {
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num) return false;
        }
        for (let y = 0; y < size; y++) {
            if (grid[y][col] === num) return false;
        }
        // Check box using boxRows and boxCols for rectangular boxes
        const boxRow = Math.floor(row / boxRows) * boxRows;
        const boxCol = Math.floor(col / boxCols) * boxCols;
        for (let y = boxRow; y < boxRow + boxRows; y++) {
            for (let x = boxCol; x < boxCol + boxCols; x++) {
                if (grid[y][x] === num) return false;
            }
        }
        return true;
    }

    function solve() {
        if (count >= 2) return; // Stop early if multiple solutions

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= size; num++) {
                        if (isValid(row, col, num)) {
                            grid[row][col] = num;
                            solve();
                            grid[row][col] = 0;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }

    solve();
    return count;
}

/**
 * Create puzzle by removing cells from solution
 * Ensures unique solution is maintained
 * @param {number[][]} solution - Complete solution
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number[][]} Puzzle with some cells removed (0 = empty)
 */
function createPuzzle(solution, difficulty) {
    const size = solution.length;
    const puzzle = solution.map(row => [...row]);

    // Use appropriate settings based on grid size
    let settingsTable;
    if (size === 4) {
        settingsTable = DIFFICULTY_SETTINGS_4x4;
    } else if (size === 6) {
        settingsTable = DIFFICULTY_SETTINGS_6x6;
    } else {
        settingsTable = DIFFICULTY_SETTINGS;
    }
    const settings = settingsTable[difficulty] || settingsTable.medium;

    // Get all cell positions and shuffle
    const positions = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            positions.push([row, col]);
        }
    }
    shuffleArray(positions);

    // Target number of cells to remove
    const targetRemove = randomInt(settings.minRemove, settings.maxRemove);
    let removed = 0;

    for (const [row, col] of positions) {
        if (removed >= targetRemove) break;

        const backup = puzzle[row][col];
        puzzle[row][col] = 0;

        // Check if puzzle still has unique solution
        if (countSolutions(puzzle, size) !== 1) {
            puzzle[row][col] = backup; // Restore if multiple solutions
        } else {
            removed++;
        }
    }

    return puzzle;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a new Sudoku puzzle
 * @param {Object} options
 * @param {string} [options.difficulty='medium'] - 'easy' | 'medium' | 'hard'
 * @param {number} [options.gridSize=9] - Grid size (4, 6, or 9)
 * @returns {{ puzzle: number[][], solution: number[][] }}
 */
export function generateSudoku({ difficulty = 'medium', gridSize = 9 } = {}) {
    // Validate supported grid sizes
    const supportedSizes = [4, 6, 9];
    if (!supportedSizes.includes(gridSize)) {
        throw new Error('Grid size must be 4, 6, or 9');
    }

    const solution = generateSolution(gridSize);
    const puzzle = createPuzzle(solution, difficulty);

    return { puzzle, solution };
}

/**
 * Validate a move against the solution
 * @param {number[][]} solution - The solution grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} value - Value to check
 * @returns {boolean} True if value is correct
 */
export function validateMove(solution, row, col, value) {
    return solution[row][col] === value;
}

/**
 * Static test puzzles with known solutions for UI testing.
 * These puzzles never change, making them ideal for automated tests.
 */
export const TEST_PUZZLES = {
    /**
     * 4x4 test puzzle - 6 empty cells
     * Empty cells at: (0,0), (1,1), (1,3), (2,0), (3,2), (3,3)
     */
    '4x4': {
        puzzle: [
            [0, 2, 3, 4],
            [3, 0, 1, 0],
            [0, 3, 4, 1],
            [4, 1, 0, 0]
        ],
        solution: [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 3, 4, 1],
            [4, 1, 2, 3]
        ],
        emptyCells: [
            { row: 0, col: 0, value: 1 },
            { row: 1, col: 1, value: 4 },
            { row: 1, col: 3, value: 2 },
            { row: 2, col: 0, value: 2 },
            { row: 3, col: 2, value: 2 },
            { row: 3, col: 3, value: 3 }
        ]
    },

    /**
     * 6x6 Mini Sudoku test puzzle - 8 empty cells
     * Box layout: 3 columns x 2 rows per box
     */
    '6x6': {
        puzzle: [
            [0, 2, 3, 4, 5, 0],
            [4, 5, 6, 1, 2, 3],
            [2, 3, 0, 5, 6, 4],
            [5, 6, 4, 0, 3, 1],
            [3, 0, 2, 6, 4, 5],
            [6, 4, 5, 3, 0, 2]
        ],
        solution: [
            [1, 2, 3, 4, 5, 6],
            [4, 5, 6, 1, 2, 3],
            [2, 3, 1, 5, 6, 4],
            [5, 6, 4, 2, 3, 1],
            [3, 1, 2, 6, 4, 5],
            [6, 4, 5, 3, 1, 2]
        ],
        emptyCells: [
            { row: 0, col: 0, value: 1 },
            { row: 0, col: 5, value: 6 },
            { row: 2, col: 2, value: 1 },
            { row: 3, col: 3, value: 2 },
            { row: 4, col: 1, value: 1 },
            { row: 5, col: 4, value: 1 }
        ]
    },

    /**
     * 9x9 test puzzle - easy with 10 empty cells for quick testing
     */
    '9x9': {
        puzzle: [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        solution: [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ],
        // First 6 empty cells for quick test
        emptyCells: [
            { row: 0, col: 2, value: 4 },
            { row: 0, col: 3, value: 6 },
            { row: 0, col: 5, value: 8 },
            { row: 0, col: 6, value: 9 },
            { row: 0, col: 7, value: 1 },
            { row: 0, col: 8, value: 2 }
        ]
    }
};

/**
 * Get a test puzzle by grid size
 * @param {number} gridSize - 4, 6, or 9
 * @returns {{ puzzle: number[][], solution: number[][], emptyCells: Array<{row: number, col: number, value: number}> }}
 */
export function getTestPuzzle(gridSize) {
    const key = `${gridSize}x${gridSize}`;
    if (!TEST_PUZZLES[key]) {
        throw new Error(`No test puzzle for grid size ${gridSize}`);
    }
    return TEST_PUZZLES[key];
}

/**
 * Get box dimensions for a given grid size (exported for board.js)
 * @param {number} size - Grid size
 * @returns {{ boxRows: number, boxCols: number }}
 */
export { getBoxDimensions };
