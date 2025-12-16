import { useMemo, useState } from 'react';
import { TicTacToeBoard } from './components/TicTacToeBoard';
import { GameStatus } from './components/GameStatus';
import { GameToolbar } from './components/GameToolbar';
import { BoardState, Player } from './types/game';
import { createEmptyBoard, determineWinner, isBoardFull } from './utils/gameLogic';

const App = () => {
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');

  const winnerInfo = useMemo(() => determineWinner(board), [board]);
  const winner = winnerInfo?.winner ?? null;
  const winningLine = winnerInfo?.line ?? null;
  const draw = !winner && isBoardFull(board);

  const handleCellClick = (index: number) => {
    let moveAccepted = false;

    setBoard((prevBoard) => {
      if (prevBoard[index] || determineWinner(prevBoard)) {
        return prevBoard;
      }

      const nextBoard: BoardState = prevBoard.map((cell, cellIndex) =>
        cellIndex === index ? currentPlayer : cell
      );
      moveAccepted = true;
      return nextBoard;
    });

    if (moveAccepted) {
      setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'));
    }
  };

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('X');
  };

  const movesCount = board.filter(Boolean).length;
  const canReset = movesCount > 0;

  return (
    <main className="app">
      <header className="app__header">
        <p className="app__eyebrow">React + TypeScript</p>
        <h1 className="app__title">Tic-Tac-Toe</h1>
        <p className="app__subtitle">보드, 셀, 상태 표시가 분리된 UI 컴포넌트 예제</p>
      </header>

      <section className="app__content">
        <GameStatus
          currentPlayer={currentPlayer}
          winner={winner}
          isDraw={draw}
          movesCount={movesCount}
        />

        <TicTacToeBoard
          cells={board}
          winningLine={winningLine}
          disabled={Boolean(winner) || draw}
          onCellClick={handleCellClick}
        />
      </section>

      <GameToolbar onReset={handleReset} canReset={canReset} />
    </main>
  );
};

export default App;
