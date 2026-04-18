/**
 * Sudoku Board Renderer
 * Handles rendering and interaction with the Sudoku grid
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
 * Create a board renderer
 * @param {HTMLElement} container - Container element for the board
 * @param {Object} options
 * @param {function} options.onCellSelect - Callback when cell is selected with (row, col, value?)
 * @param {number} [options.gridSize=9] - Grid size
 * @returns {Object} Board renderer API
 */
export function createBoardRenderer(container, options = {}) {
    const { onCellSelect, gridSize = 9 } = options;
    const { boxRows, boxCols } = getBoxDimensions(gridSize);

    let cells = [];
    let selectedCell = null;
    let lastMoveCell = null;

    /**
     * Initialize the board
     */
    function init() {
        container.innerHTML = '';
        container.setAttribute('role', 'grid');
        container.setAttribute('aria-label', 'Sudoku puzzle');
        container.setAttribute('data-grid-size', gridSize);

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-col', col);
                cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);

                cell.addEventListener('click', () => handleCellClick(row, col));
                cell.addEventListener('keydown', (e) => handleCellKeydown(e, row, col));

                container.appendChild(cell);
            }
        }
    }

    /**
     * Handle cell click
     */
    function handleCellClick(row, col) {
        if (cells[row]?.[col]?.isOriginal) return;

        selectCell(row, col);
        onCellSelect?.(row, col);
    }

    /**
     * Handle keyboard navigation
     */
    function handleCellKeydown(e, row, col) {
        const key = e.key;

        // Number input
        if (/^[1-9]$/.test(key)) {
            if (!cells[row]?.[col]?.isOriginal) {
                onCellSelect?.(row, col, parseInt(key));
            }
            e.preventDefault();
            return;
        }

        // Clear cell
        if (key === 'Delete' || key === 'Backspace' || key === '0') {
            if (!cells[row]?.[col]?.isOriginal) {
                onCellSelect?.(row, col, null);
            }
            e.preventDefault();
            return;
        }

        // Arrow key navigation
        let newRow = row;
        let newCol = col;

        switch (key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(gridSize - 1, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(gridSize - 1, col + 1);
                break;
            default:
                return;
        }

        e.preventDefault();
        selectCell(newRow, newCol);
        getCellElement(newRow, newCol)?.focus();
    }

    /**
     * Get cell element by position
     */
    function getCellElement(row, col) {
        return container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /**
     * Select a cell
     */
    function selectCell(row, col) {
        container.querySelectorAll('.cell-selected, .cell-highlighted').forEach(el => {
            el.classList.remove('cell-selected', 'cell-highlighted');
        });

        selectedCell = { row, col };
        const cellEl = getCellElement(row, col);
        if (cellEl) {
            cellEl.classList.add('cell-selected');
        }

        highlightRelatedCells(row, col);
    }

    /**
     * Highlight cells in same row, column, and box
     */
    function highlightRelatedCells(row, col) {
        const startBoxRow = Math.floor(row / boxRows) * boxRows;
        const startBoxCol = Math.floor(col / boxCols) * boxCols;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (r === row && c === col) continue;

                const inRow = r === row;
                const inCol = c === col;
                const inBox = r >= startBoxRow && r < startBoxRow + boxRows &&
                    c >= startBoxCol && c < startBoxCol + boxCols;

                if (inRow || inCol || inBox) {
                    getCellElement(r, c)?.classList.add('cell-highlighted');
                }
            }
        }
    }

    /**
     * Render cells from data
     * @param {Array} newCells - 2D array of cell objects {row, col, value, isOriginal}
     */
    function render(newCells) {
        cells = newCells;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = cells[row][col];
                const cellEl = getCellElement(row, col);
                if (!cellEl) continue;

                cellEl.textContent = cell.value || '';
                cellEl.setAttribute('aria-label',
                    `Row ${row + 1}, Column ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`
                );

                cellEl.classList.toggle('cell-original', cell.isOriginal);
            }
        }
    }

    /**
     * Update a single cell value
     * @param {number} row
     * @param {number} col
     * @param {number|null} value
     */
    function updateCell(row, col, value) {
        if (!cells[row]) return;

        cells[row][col] = {
            ...cells[row][col],
            value
        };

        const cellEl = getCellElement(row, col);
        if (!cellEl) return;

        cellEl.textContent = value || '';

        if (value) {
            if (lastMoveCell) {
                lastMoveCell.classList.remove('last-move');
            }
            cellEl.classList.add('last-move');
            lastMoveCell = cellEl;
        } else {
            cellEl.classList.remove('last-move');
            if (lastMoveCell === cellEl) {
                lastMoveCell = null;
            }
        }
    }

    /**
     * Get currently selected cell position
     */
    function getSelected() {
        return selectedCell;
    }

    /**
     * Clear selection
     */
    function clearSelection() {
        container.querySelectorAll('.cell-selected, .cell-highlighted').forEach(el => {
            el.classList.remove('cell-selected', 'cell-highlighted');
        });
        selectedCell = null;
    }

    /**
     * Shake cell to indicate error
     * @param {number} row
     * @param {number} col
     */
    function shakeCell(row, col) {
        const cellEl = getCellElement(row, col);
        if (!cellEl) return;

        cellEl.classList.add('cell-error');
        setTimeout(() => cellEl.classList.remove('cell-error'), 600);
    }

    // Initialize on creation
    init();

    return {
        render,
        updateCell,
        selectCell,
        getSelected,
        clearSelection,
        shakeCell
    };
}
