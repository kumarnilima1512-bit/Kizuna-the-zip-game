import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GamePage.css';

const CELL = 64;
const GAP = 8;
const PADDING = 24;

const PUZZLE = {
  size: 5,
  dots: [
    { row: 0, col: 0, number: 1 },
    { row: 1, col: 4, number: 2 },
    { row: 2, col: 0, number: 3 },
    { row: 3, col: 4, number: 4 },
    { row: 4, col: 0, number: 5 },
  ],
  solution: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 2 },
    { row: 1, col: 1 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 2, col: 4 },
    { row: 3, col: 4 },
    { row: 3, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 1 },
    { row: 3, col: 0 },
    { row: 4, col: 0 },
    { row: 4, col: 1 },
    { row: 4, col: 2 },
    { row: 4, col: 3 },
    { row: 4, col: 4 },
  ],
};

const DOT_COLORS = {
  1: '#FF3CAC',
  2: '#F9A826',
  3: '#00F5A0',
  4: '#2B86C5',
  5: '#784BA0',
};

const PATH_COLOR = '#FF3CAC';
const PATH_LIGHT = 'rgba(255,60,172,0.25)';

const makeGrid = (size) =>
  Array(size).fill(null).map(() => Array(size).fill(null));

function GamePage() {
  const navigate = useNavigate();
  const size = PUZZLE.size;

  const [path, setPath] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(3);

  // Timer
  useEffect(() => {
    if (!running || won) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, won]);

  // Global mouseup — stops drawing anywhere on page
  useEffect(() => {
    const handleGlobalMouseUp = () => setDrawing(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getDot = (row, col) =>
    PUZZLE.dots.find(d => d.row === row && d.col === col);

  const isInPath = (row, col) =>
    path.some(p => p.row === row && p.col === col);

  const getNextDotNumber = (currentPath) => {
    for (let i = 0; i < PUZZLE.dots.length; i++) {
      const dot = PUZZLE.dots[i];
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
    if (lastDot && lastDot.number === PUZZLE.dots.length) {
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

    // Backtrack — if entering previous cell, remove last
    if (path.length >= 2) {
      const prev = path[path.length - 2];
      if (prev.row === row && prev.col === col) {
        setPath(p => p.slice(0, -1));
        return;
      }
    }

    if (!isAdjacent(row, col, path)) return;
    if (isInPath(row, col)) return;

    // If this cell has a dot, must be the next number in order
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
    if (nextIdx < PUZZLE.solution.length) {
      setHint(PUZZLE.solution[nextIdx]);
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
    setHintsLeft(3);
    setHint(null);
  };

  const getCellStyle = (row, col) => {
    const dot = getDot(row, col);
    const inPath = isInPath(row, col);
    const isHint = hint && hint.row === row && hint.col === col;

    if (dot) {
      return {
        background: DOT_COLORS[dot.number],
        border: `2px solid ${DOT_COLORS[dot.number]}`,
        boxShadow: `0 0 18px ${DOT_COLORS[dot.number]}99`,
      };
    }
    if (isHint) {
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
          <p className="puzzle-label">Today's Puzzle</p>
          <p className="puzzle-rule">Draw a path · 1 → 2 → 3 → 4 → 5 · Fill every cell</p>
        </div>

        {/* GRID WRAPPER */}
        <div
          className="grid-wrapper"
          style={{ padding: PADDING }}
        >
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
                    {dot && (
                      <span className="dot-label">{dot.number}</span>
                    )}
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
            <h2>You solved it!</h2>
            <p>Time: <strong>{formatTime(seconds)}</strong></p>
            <p style={{ color: '#888899', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Come back tomorrow for a new puzzle!
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={handleReset}
            >
              Play Again
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