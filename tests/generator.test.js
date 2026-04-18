import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSudoku, validateMove, getTestPuzzle, TEST_PUZZLES } from '../docs/js/generator.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function hasNoDuplicates(arr) {
    const vals = arr.filter(v => v !== 0);
    return new Set(vals).size === vals.length;
}

function assertValidGrid(grid, size) {
    const boxSize = Math.sqrt(size);

    // All cells filled (solution check)
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            assert(grid[r][c] >= 1 && grid[r][c] <= size,
                `Cell [${r}][${c}] out of range: ${grid[r][c]}`);

    // Rows
    for (let r = 0; r < size; r++)
        assert(hasNoDuplicates(grid[r]), `Duplicate in row ${r}`);

    // Columns
    for (let c = 0; c < size; c++)
        assert(hasNoDuplicates(grid.map(row => row[c])), `Duplicate in col ${c}`);

    // Boxes
    for (let br = 0; br < boxSize; br++) {
        for (let bc = 0; bc < boxSize; bc++) {
            const box = [];
            for (let r = br * boxSize; r < (br + 1) * boxSize; r++)
                for (let c = bc * boxSize; c < (bc + 1) * boxSize; c++)
                    box.push(grid[r][c]);
            assert(hasNoDuplicates(box), `Duplicate in box [${br}][${bc}]`);
        }
    }
}

// ─── generateSudoku ─────────────────────────────────────────────────────────

test('9x9 easy — solution is a valid complete grid', () => {
    const { solution } = generateSudoku({ difficulty: 'easy', gridSize: 9 });
    assertValidGrid(solution, 9);
});

test('9x9 medium — solution is a valid complete grid', () => {
    const { solution } = generateSudoku({ difficulty: 'medium', gridSize: 9 });
    assertValidGrid(solution, 9);
});

test('9x9 hard — solution is a valid complete grid', () => {
    const { solution } = generateSudoku({ difficulty: 'hard', gridSize: 9 });
    assertValidGrid(solution, 9);
});

test('4x4 easy — solution is a valid complete grid', () => {
    const { solution } = generateSudoku({ difficulty: 'easy', gridSize: 4 });
    assertValidGrid(solution, 4);
});

test('9x9 easy — puzzle has 30–35 empty cells', () => {
    const { puzzle } = generateSudoku({ difficulty: 'easy', gridSize: 9 });
    const empty = puzzle.flat().filter(v => v === 0).length;
    assert(empty >= 30 && empty <= 35, `Empty cells: ${empty}`);
});

test('9x9 medium — puzzle has 40–45 empty cells', () => {
    const { puzzle } = generateSudoku({ difficulty: 'medium', gridSize: 9 });
    const empty = puzzle.flat().filter(v => v === 0).length;
    assert(empty >= 40 && empty <= 45, `Empty cells: ${empty}`);
});

test('9x9 hard — puzzle has 50–55 empty cells', () => {
    const { puzzle } = generateSudoku({ difficulty: 'hard', gridSize: 9 });
    const empty = puzzle.flat().filter(v => v === 0).length;
    assert(empty >= 50 && empty <= 55, `Empty cells: ${empty}`);
});

test('4x4 easy — puzzle has 6–8 empty cells', () => {
    const { puzzle } = generateSudoku({ difficulty: 'easy', gridSize: 4 });
    const empty = puzzle.flat().filter(v => v === 0).length;
    assert(empty >= 6 && empty <= 8, `Empty cells: ${empty}`);
});

test('puzzle prefilled cells match solution', () => {
    const { puzzle, solution } = generateSudoku({ difficulty: 'medium', gridSize: 9 });
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (puzzle[r][c] !== 0)
                assert.equal(puzzle[r][c], solution[r][c],
                    `Mismatch at [${r}][${c}]`);
});

test('invalid gridSize throws', () => {
    assert.throws(() => generateSudoku({ gridSize: 5 }), /perfect square/);
});

// ─── validateMove ────────────────────────────────────────────────────────────

test('validateMove — correct value returns true', () => {
    const { solution } = generateSudoku({ difficulty: 'easy', gridSize: 9 });
    assert(validateMove(solution, 0, 0, solution[0][0]));
});

test('validateMove — wrong value returns false', () => {
    const { solution } = generateSudoku({ difficulty: 'easy', gridSize: 9 });
    const wrong = solution[0][0] === 9 ? 1 : 9;
    assert(!validateMove(solution, 0, 0, wrong));
});

test('validateMove — checks every cell in solution', () => {
    const { solution } = generateSudoku({ difficulty: 'medium', gridSize: 9 });
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            assert(validateMove(solution, r, c, solution[r][c]),
                `validateMove failed at [${r}][${c}]`);
});

// ─── TEST_PUZZLES (static test data) ─────────────────────────────────────────

test('4x4 test puzzle — solution is valid', () => {
    const { solution } = getTestPuzzle(4);
    assertValidGrid(solution, 4);
});

test('9x9 test puzzle — solution is valid', () => {
    const { solution } = getTestPuzzle(9);
    assertValidGrid(solution, 9);
});

test('4x4 test puzzle — emptyCells match solution', () => {
    const { solution, emptyCells } = getTestPuzzle(4);
    for (const { row, col, value } of emptyCells) {
        assert.equal(solution[row][col], value,
            `Empty cell [${row}][${col}] should be ${value}`);
    }
});

test('9x9 test puzzle — emptyCells match solution', () => {
    const { solution, emptyCells } = getTestPuzzle(9);
    for (const { row, col, value } of emptyCells) {
        assert.equal(solution[row][col], value,
            `Empty cell [${row}][${col}] should be ${value}`);
    }
});

test('4x4 test puzzle — puzzle has zeros at emptyCells positions', () => {
    const { puzzle, emptyCells } = getTestPuzzle(4);
    for (const { row, col } of emptyCells) {
        assert.equal(puzzle[row][col], 0,
            `Cell [${row}][${col}] should be empty (0)`);
    }
});

test('9x9 test puzzle — puzzle has zeros at emptyCells positions', () => {
    const { puzzle, emptyCells } = getTestPuzzle(9);
    for (const { row, col } of emptyCells) {
        assert.equal(puzzle[row][col], 0,
            `Cell [${row}][${col}] should be empty (0)`);
    }
});

test('getTestPuzzle — throws for invalid size', () => {
    assert.throws(() => getTestPuzzle(6), /No test puzzle/);
});
