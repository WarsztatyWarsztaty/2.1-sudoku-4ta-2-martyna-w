/**
 * Silnik Sudoku (Sudoku Engine)
 * Generowanie plansz, rozwiązywanie, sprawdzanie unikalności i logiczne podpowiedzi
 */

class SudokuEngine {
  constructor() {
    this.SIZE = 9;
    this.BOX_SIZE = 3;
  }

  // Tworzy pustą planszę 9x9
  createEmptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  // Kopiuje planszę
  cloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  // Sprawdza, czy wstawienie wartości `val` na pozycji (row, col) jest poprawne według reguł Sudoku
  isValidPlacement(grid, row, col, val) {
    // Sprawdź wiersz
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === val) return false;
    }

    // Sprawdź kolumnę
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === val) return false;
    }

    // Sprawdź kwadrat 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if ((curR !== row || curC !== col) && grid[curR][curC] === val) {
          return false;
        }
      }
    }

    return true;
  }

  // Zwraca listę możliwych cyfr (kandydatów) dla danej komórki
  getCandidates(grid, row, col) {
    if (grid[row][col] !== 0) return [];
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValidPlacement(grid, row, col, num)) {
        candidates.push(num);
      }
    }
    return candidates;
  }

  // Tasowanie tablicy (Fisher-Yates)
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Generuje w pełni wypełnioną, poprawną planszę Sudoku
  generateCompleteBoard() {
    const grid = this.createEmptyGrid();

    const solve = () => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) {
            const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const num of numbers) {
              if (this.isValidPlacement(grid, r, c, num)) {
                grid[r][c] = num;
                if (solve()) return true;
                grid[r][c] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve();
    return grid;
  }

  // Zlicza liczbę rozwiązań danej planszy (zatrzymuje się na max 2, aby szybko stwierdzić unikalność)
  countSolutions(grid, limit = 2) {
    let count = 0;
    const tempGrid = this.cloneGrid(grid);

    const backtrack = () => {
      // Znajdź komórkę z najmniejszą liczbą kandydatów (heurystyka MRV)
      let minRow = -1;
      let minCol = -1;
      let minCandidates = 10;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (tempGrid[r][c] === 0) {
            const cand = this.getCandidates(tempGrid, r, c);
            if (cand.length === 0) return; // martwa gałąź
            if (cand.length < minCandidates) {
              minCandidates = cand.length;
              minRow = r;
              minCol = c;
            }
          }
        }
      }

      // Wszystkie komórki wypełnione - znaleziono rozwiązanie
      if (minRow === -1) {
        count++;
        return;
      }

      const candidates = this.getCandidates(tempGrid, minRow, minCol);
      for (const num of candidates) {
        tempGrid[minRow][minCol] = num;
        backtrack();
        tempGrid[minRow][minCol] = 0;
        if (count >= limit) return;
      }
    };

    backtrack();
    return count;
  }

  // Rozwiązuje planszę i zwraca tablicę 9x9 lub null
  solveBoard(grid) {
    const solved = this.cloneGrid(grid);

    const solve = () => {
      let minRow = -1;
      let minCol = -1;
      let minCandidates = 10;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (solved[r][c] === 0) {
            const cand = this.getCandidates(solved, r, c);
            if (cand.length === 0) return false;
            if (cand.length < minCandidates) {
              minCandidates = cand.length;
              minRow = r;
              minCol = c;
            }
          }
        }
      }

      if (minRow === -1) return true;

      const candidates = this.getCandidates(solved, minRow, minCol);
      for (const num of candidates) {
        solved[minRow][minCol] = num;
        if (solve()) return true;
        solved[minRow][minCol] = 0;
      }
      return false;
    };

    if (solve()) {
      return solved;
    }
    return null;
  }

  // Generuje zagadkę Sudoku o określonym poziomie trudności
  generatePuzzle(difficulty = 'medium') {
    // Liczba wskazówek (clues)
    const clueLimits = {
      easy: { min: 38, max: 44 },
      medium: { min: 32, max: 36 },
      hard: { min: 28, max: 31 },
      expert: { min: 24, max: 27 }
    };

    const targetClues = clueLimits[difficulty] || clueLimits.medium;
    const cluesCount = Math.floor(Math.random() * (targetClues.max - targetClues.min + 1)) + targetClues.min;
    const cellsToRemove = 81 - cluesCount;

    const solution = this.generateCompleteBoard();
    const puzzle = this.cloneGrid(solution);

    // Lista wszystkich współrzędnych komórek przetasowana
    const cellIndices = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cellIndices.push([r, c]);
      }
    }
    const shuffledCells = this.shuffle(cellIndices);

    let removed = 0;
    for (const [r, c] of shuffledCells) {
      if (removed >= cellsToRemove) break;

      const backup = puzzle[r][c];
      puzzle[r][c] = 0;

      // Sprawdź czy po usunięciu rozwiązanie nadal jest unikalne
      if (this.countSolutions(puzzle, 2) === 1) {
        removed++;
      } else {
        // Jeśli nie jest unikalne, przywracamy
        puzzle[r][c] = backup;
      }
    }

    return {
      puzzle,
      solution,
      difficulty,
      cluesCount: 81 - removed
    };
  }

  // Wyszukuje logiczną podpowiedź dla aktualnego stanu planszy gracza
  findSmartHint(currentGrid, solutionGrid) {
    // 1. Sprawdź komórki "Naked Single" - komórka z dokładnie jednym możliwym kandydatem
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          const candidates = this.getCandidates(currentGrid, r, c);
          if (candidates.length === 1) {
            const correctNum = solutionGrid[r][c];
            return {
              row: r,
              col: c,
              value: correctNum,
              type: 'naked-single',
              message: `W tym polu pasuje wyłącznie cyfra ${correctNum}, ponieważ inne cyfry są już obecne w tym wierszu, kolumnie lub kwadracie 3×3.`
            };
          }
        }
      }
    }

    // 2. Sprawdź komórki "Hidden Single" w wierszach, kolumnach i blokach
    // Wiersze
    for (let r = 0; r < 9; r++) {
      for (let num = 1; num <= 9; num++) {
        const possibleCols = [];
        for (let c = 0; c < 9; c++) {
          if (currentGrid[r][c] === 0 && this.isValidPlacement(currentGrid, r, c, num)) {
            possibleCols.push(c);
          }
        }
        if (possibleCols.length === 1) {
          const c = possibleCols[0];
          return {
            row: r,
            col: c,
            value: num,
            type: 'hidden-single-row',
            message: `W wierszu ${r + 1} cyfra ${num} może wystąpić tylko na tym jednym polu.`
          };
        }
      }
    }

    // Kolumny
    for (let c = 0; c < 9; c++) {
      for (let num = 1; num <= 9; num++) {
        const possibleRows = [];
        for (let r = 0; r < 9; r++) {
          if (currentGrid[r][c] === 0 && this.isValidPlacement(currentGrid, r, c, num)) {
            possibleRows.push(r);
          }
        }
        if (possibleRows.length === 1) {
          const r = possibleRows[0];
          return {
            row: r,
            col: c,
            value: num,
            type: 'hidden-single-col',
            message: `W kolumnie ${c + 1} cyfra ${num} może wystąpić tylko na tym jednym polu.`
          };
        }
      }
    }

    // Bloki 3x3
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        for (let num = 1; num <= 9; num++) {
          const spots = [];
          for (let r = br * 3; r < br * 3 + 3; r++) {
            for (let c = bc * 3; c < bc * 3 + 3; c++) {
              if (currentGrid[r][c] === 0 && this.isValidPlacement(currentGrid, r, c, num)) {
                spots.push({ r, c });
              }
            }
          }
          if (spots.length === 1) {
            return {
              row: spots[0].r,
              col: spots[0].c,
              value: num,
              type: 'hidden-single-box',
              message: `W tym kwadracie 3×3 cyfra ${num} pasuje tylko na tym jednym polu.`
            };
          }
        }
      }
    }

    // 3. Fallback: znajdź dowolną pustą komórkę z najmniejszą liczbą kandydatów
    let bestR = -1;
    let bestC = -1;
    let minCands = 10;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          const cands = this.getCandidates(currentGrid, r, c);
          if (cands.length > 0 && cands.length < minCands) {
            minCands = cands.length;
            bestR = r;
            bestC = c;
          }
        }
      }
    }

    if (bestR !== -1) {
      const val = solutionGrid[bestR][bestC];
      return {
        row: bestR,
        col: bestC,
        value: val,
        type: 'direct',
        message: `Podpowiedź dla pola (${bestR + 1}, ${bestC + 1}): Prawidłowa cyfra to ${val}.`
      };
    }

    return null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SudokuEngine;
}
