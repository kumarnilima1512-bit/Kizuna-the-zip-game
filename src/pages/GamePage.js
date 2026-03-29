import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GamePage.css';

const CELL = 64;
const GAP = 8;
const PADDING = 24;
const GRID_SIZE = 5;
const NUM_DOTS = 5;

const DOT_COLORS = {
  1: '#FF3CAC',
  2: '#F9A826',
  3: '#00F5A0',
  4: '#2B86C5',
  5: '#784BA0',
};

const PATH_COLOR = '#FF3CAC';
const PATH_LIGHT = 'rgba(255,60,172,0.25)';

// ── PUZZLE GENERATOR ──────────────────────────────────────────────
// Uses a random walk with backtracking to fill all cells,
// then picks NUM_DOTS evenly spaced points as numbered stops.

function generatePuzzle(size, seed) {
  // Simple seeded random so same level number = same puzzle
  let s = seed + 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  const randInt = (n) => Math.floor(rand() * n);

  const total = size * size;
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Try to build a Hamiltonian path using backtracking + Warnsdorff heuristic
  const tryBuild = () => {
    const visited = Array(size).fill(null).map(() => Array(size).fill(false));
    const path = [];

    // Random start cell
    const startRow = randInt(size);
    const startCol = randInt(size);
    visited[startRow][startCol] = true;
    path.push({ row: startRow, col: startCol });

    const backtrack = () => {
      if (path.length === total) return true;

      const last = path[path.length - 1];

      // Warnsdorff: sort neighbors by how many onward moves they have
      const neighbors = shuffle(dirs)
        .map(d => ({ row: last.row + d.dr, col: last.col + d.dc }))
        .filter(n =>
          n.row >= 0 && n.row < size &&
          n.col >= 0 && n.col < size &&
          !visited[n.row][n.col]
        );

      // Sort by degree (fewest onward moves first — Warnsdorff)
      neighbors.sort((a, b) => {
        const degA = dirs.filter(d => {
          const nr = a.row + d.dr; const nc = a.col + d.dc;
          return nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc];
        }).length;
        const degB = dirs.filter(d => {
          const nr = b.row + d.dr; const nc = b.col + d.dc;
          return nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc];
        }).length;
        return degA - degB;
      });

      for (const next of neighbors) {
        visited[next.row][next.col] = true;
        path.push(next);
        if (backtrack()) return true;
        path.pop();
        visited[next.row][next.col] = false;
      }
      return false;
    };

    return backtrack() ? path : null;
  };

  // Try up to 10 times with different seeds
  let solution = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    s = seed + attempt + 1;
    solution = tryBuild();
    if (solution) break;
  }

  if (!solution) {
    // Fallback: hardcoded snake path
    solution = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        solution.push({ row: r, col: r % 2 === 0 ? c : size - 1 - c });
      }
    }
  }

  // Pick NUM_DOTS evenly spaced positions along the solution path
  const step = Math.floor(total / NUM_DOTS);
  const dots = [];
  for (let i = 0; i < NUM_DOTS; i++) {
    const idx = i === NUM_DOTS - 1 ? total - 1 : i * step;
    const cell = solution[idx];
    dots.push({ row: cell.row, col: cell.col, number: i + 1 });
  }

  return { size, dots, solution };
}
// ─────────────────────────────────────────────────────────────────

function GamePage() {
  const navigate = useNavigate();

  const [levelIndex, setLevelIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(GRID_SIZE, 0));
  const [path, setPath] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(3);

  const size = puzzle.size;

  // Generate new puzzle when level changes
  useEffect(() => {
    setPuzzle(generatePuzzle(GRID_SIZE, levelIndex * 999 + levelIndex));
  }, [levelIndex]);

  // Timer
  useEffect(() => {
    if (!running || won) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, won]);

  // Global mouseup
  useEffect(() => {
    const up = () => setDrawing(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getDot = (row, col) =>
    puzzle.dots.find(d => d.row === row && d.col === col);

  const isInPath = (row, col) =>
    path.some(p => p.row === row && p.col === col);

  const getNextDotNumber = (currentPath) => {
    for (let i = 0; i < puzzle.dots.length; i++) {
      const dot = puzzle.dots[i];
      if (!currentPath.some(p => p.row === dot.row && p.col === dot.col)) {
        return dot.number;
      }
    }
    return null;
  };

  const isAdjacent = (row, col, currentPath) => {
    if (currentPath.length === 0) return false;
    const last = currentPath[currentPath.length - 1];
    return Math.abs(row - last.row) + Math.abs(col - last.col) === 1;
  };

  const checkWin = (currentPath) => {
    if (currentPath.length !== size * size) return;
    const lastCell = currentPath[currentPath.length - 1];
    const lastDot = getDot(lastCell.row, lastCell.col);
    if (lastDot && lastDot.number === puzzle.dots.length) {
      setWon(true);
      setRunning(false);
    }
  };

  const handleCellDown = (row, col) => {
    const dot = getDot(row, col);
    if (!dot || dot.number !== 1) return;
    setPath([{ row, col }]);
    setDrawing(true);
  };

  const handleCellEnter = (row, col) => {
    if (!drawing || path.length === 0) return;

    // Backtrack
    if (path.length >= 2) {
      const prev = path[path.length - 2];
      if (prev.row === row && prev.col === col) {
        setPath(p => p.slice(0, -1));
        return;
      }
    }

    if (!isAdjacent(row, col, path)) return;
    if (isInPath(row, col)) return;

    const dot = getDot(row, col);
    if (dot) {
      const nextNum = getNextDotNumber(path);
      if (dot.number !== nextNum) return;
    }

    const newPath = [...path, { row, col }];
    setPath(newPath);
    checkWin(newPath);
  };

  const handleHint = () => {
    if (hintsLeft <= 0) return;
    const nextIdx = path.length;
    if (nextIdx < puzzle.solution.length) {
      setHint(puzzle.solution[nextIdx]);
      setHintsLeft(h => h - 1);
      setTimeout(() => setHint(null), 1500);
    }
  };

  const handleReset = () => {
    setPath([]);
    setDrawing(false);
    setSeconds(0);
    setRunning(true);
    setWon(false);
    setHint(null);
  };

  const handleNextLevel = () => {
    setLevelIndex(i => i + 1);
    setPath([]);
    setDrawing(false);
    setSeconds(0);
    setRunning(true);
    setWon(false);
    setHint(null);
    setHintsLeft(3);
  };

  const getCellStyle = (row, col) => {
    const dot = getDot(row, col);
    const inPath = isInPath(row, col);
    const isHintCell = hint && hint.row === row && hint.col === col;

    if (dot) {
      return {
        background: DOT_COLORS[dot.number],
        border: `2px solid ${DOT_COLORS[dot.number]}`,
        boxShadow: `0 0 18px ${DOT_COLORS[dot.number]}99`,
      };
    }
    if (isHintCell) {
      return {
        background: 'rgba(255,255,255,0.25)',
        border: '2px solid #fff',
        boxShadow: '0 0 18px #ffffff88',
      };
    }
    if (inPath) {
      return {
        background: PATH_LIGHT,
        border: `1.5px solid ${PATH_COLOR}`,
      };
    }
    return {};
  };

  const gridPixelSize = size * CELL + (size - 1) * GAP;
  const currentLevel = levelIndex + 1;

  return (
    <div className="game-page">

      {/* HEADER */}
      <header className="game-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <span className="game-logo">Kizuna</span>
        <div className="timer">{formatTime(seconds)}</div>
      </header>

      <main className="game-main">
        <div className="game-top">
          <p className="puzzle-label">Level {currentLevel}</p>
          <p className="puzzle-rule">
            Draw a path · 1 → 2 → 3 → 4 → 5 · Fill every cell
          </p>
        </div>

        {/* GRID WRAPPER */}
        <div className="grid-wrapper" style={{ padding: PADDING }}>

          {/* SVG LINE OVERLAY */}
          <svg
            width={gridPixelSize}
            height={gridPixelSize}
            style={{
              position: 'absolute',
              top: PADDING,
              left: PADDING,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            {path.map((cell, i) => {
              if (i === 0) return null;
              const prev = path[i - 1];
              const x1 = prev.col * (CELL + GAP) + CELL / 2;
              const y1 = prev.row * (CELL + GAP) + CELL / 2;
              const x2 = cell.col * (CELL + GAP) + CELL / 2;
              const y2 = cell.row * (CELL + GAP) + CELL / 2;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke={PATH_COLOR}
                  strokeWidth={CELL * 0.45}
                  strokeLinecap="round"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* GRID CELLS */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${size}, ${CELL}px)`,
              gap: GAP,
              position: 'relative',
              zIndex: 3,
            }}
          >
            {Array(size).fill(null).map((_, ri) =>
              Array(size).fill(null).map((_, ci) => {
                const dot = getDot(ri, ci);
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={`cell ${dot ? 'dot-cell' : ''}`}
                    style={getCellStyle(ri, ci)}
                    onMouseDown={() => handleCellDown(ri, ci)}
                    onMouseEnter={() => handleCellEnter(ri, ci)}
                  >
                    {dot && <span className="dot-label">{dot.number}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${(path.length / (size * size)) * 100}%` }}
          />
        </div>
        <p className="progress-text">{path.length}/{size * size} cells filled</p>

        {/* CONTROLS */}
        <div className="controls">
          <button className="ctrl-btn" onClick={handleReset}>↺ Reset</button>
          <button
            className="ctrl-btn hint-btn"
            onClick={handleHint}
            disabled={hintsLeft <= 0}
          >
            💡 Hint ({hintsLeft})
          </button>
        </div>
      </main>

      {/* WIN MODAL */}
      {won && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-logo">🎉</div>
            <h2>Level {currentLevel} cleared!</h2>
            <p>Time: <strong>{formatTime(seconds)}</strong></p>
            <p style={{ color: '#888899', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Ready for the next challenge?
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={handleNextLevel}
            >
              Next Level →
            </button>
            <button
              className="btn-secondary"
              style={{ marginTop: '0.75rem' }}
              onClick={handleReset}
            >
              Replay this level
            </button>
            <button
              className="btn-secondary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage;