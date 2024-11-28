import React, { useState, useEffect } from "react";
import "./App.css";

const App: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(Array(9).fill(Array(9).fill(0)));
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [hints, setHints] = useState(3);

  useEffect(() => {
    generateSudoku("easy");
  }, []);

  const generateEmptyGrid = (): number[][] => Array(9).fill(0).map(() => Array(9).fill(0));

  const solveSudoku = (board: number[][]): number[][] | null => {
    const findEmpty = (): [number, number] | null => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] === 0) return [i, j];
        }
      }
      return null;
    };

    const isValid = (row: number, col: number, num: number): boolean => {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num || board[Math.floor(row / 3) * 3 + Math.floor(i / 3)][Math.floor(col / 3) * 3 + (i % 3)] === num) {
          return false;
        }
      }
      return true;
    };

    const empty = findEmpty();
    if (!empty) return board;

    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
      if (isValid(row, col, num)) {
        board[row][col] = num;

        if (solveSudoku(board)) return board;

        board[row][col] = 0;
      }
    }

    return null;
  };

  const removeNumbers = (board: number[][], difficulty: "easy" | "medium" | "hard"): number[][] => {
    const removals = { easy: 20, medium: 35, hard: 50 };
    const copy = JSON.parse(JSON.stringify(board));

    let count = removals[difficulty];
    while (count > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (copy[row][col] !== 0) {
        copy[row][col] = 0;
        count--;
      }
    }

    return copy;
  };

  const generateSudoku = (difficulty: "easy" | "medium" | "hard") => {
    const solvedGrid = solveSudoku(generateEmptyGrid());
    if (solvedGrid) {
      const puzzleGrid = removeNumbers(solvedGrid, difficulty);
      setGrid(puzzleGrid);
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (/^[1-9]?$/.test(value)) {
      const num = parseInt(value) || 0;

      // Check if the input number is valid for the row, column, and 3x3 subgrid
      const isValid = (row: number, col: number, num: number): boolean => {
        // Check row
        for (let i = 0; i < 9; i++) {
          if (grid[row][i] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
          if (grid[i][col] === num) return false;
        }

        // Check 3x3 subgrid
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = startRow; i < startRow + 3; i++) {
          for (let j = startCol; j < startCol + 3; j++) {
            if (grid[i][j] === num) return false;
          }
        }

        return true;
      };

      if (isValid(row, col, num)) {
        // If valid, update the grid with the new number
        const newGrid = grid.map((r, i) =>
          r.map((cell, j) => (i === row && j === col ? num : cell))
        );
        setGrid(newGrid);
      } else {
        alert(
          "Invalid input: number already exists in the row, column, or 3x3 subgrid."
        );
      }
    }
  };

  const handleSolve = () => {
    const solvedGrid = solveSudoku(grid.map((row) => [...row]));
    if (solvedGrid) {
      setGrid(solvedGrid);
      alert("Solved successfully!");
    } else {
      alert("No solution exists for the given board.");
    }
  };

  const giveHint = () => {
    if (hints > 0) {
      let emptyCells: [number, number][] = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (grid[i][j] === 0) {
            emptyCells.push([i, j]);
          }
        }
      }

      if (emptyCells.length === 0) {
        alert("No empty cells left to give a hint!");
        return;
      }

      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [row, col] = emptyCells[randomIndex];

      const solvedGrid = solveSudoku(grid.map((row) => [...row]));
      if (solvedGrid) {
        const hintValue = solvedGrid[row][col];
        const newGrid = grid.map((r, i) =>
          r.map((cell, j) => (i === row && j === col ? hintValue : cell))
        );
        setGrid(newGrid);
        setHints(hints - 1);
        alert(`Hint: ${hintValue} for position (${row + 1}, ${col + 1})`);
      } else {
        alert("Unable to provide a hint as the board is unsolvable.");
      }
    } else {
      alert("No hints remaining!");
    }
  };

  return (
    <div className="app">
      <h1>Sudoku Game</h1>
      <div className="sudoku-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              className="sudoku-cell"
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={cell === 0 ? "" : cell}
              onChange={(e) =>
                handleInputChange(rowIndex, colIndex, e.target.value)
              }
              maxLength={1}
            />
          ))
        )}
      </div>
      <div className="controls">
        <select
          value={difficulty}
          onChange={(e) => {
            const selectedDifficulty = e.target.value as | "easy" | "medium" | "hard";
            setDifficulty(selectedDifficulty);
            generateSudoku(selectedDifficulty);
          }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={handleSolve}>Solve</button>
        <button onClick={giveHint} disabled={hints === 0}>
          Get Hint ({hints})
        </button>
      </div>
    </div>
  );
};

export default App;
