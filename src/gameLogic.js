const PLAYER_X = 'X';
const PLAYER_O = 'O';
const BOARD_SIZE = 9;
const BOARD_DIMENSION = 3;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null);
}

function validatePosition(position) {
  if (Number.isInteger(position) && position >= 0 && position < BOARD_SIZE) {
    return;
  }

  throw new RangeError(`유효하지 않은 위치입니다: ${position}`);
}

function getNextPlayer(currentPlayer) {
  return currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function cloneBoard(board) {
  return [...board];
}

function applyMove(board, position, player) {
  validatePosition(position);

  if (board[position]) {
    throw new Error('이미 표시된 칸입니다.');
  }

  const updatedBoard = cloneBoard(board);
  updatedBoard[position] = player;
  return updatedBoard;
}

function calculateWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        player: board[a],
        line: [a, b, c]
      };
    }
  }

  return null;
}

function isBoardFull(board) {
  return board.every(Boolean);
}

module.exports = {
  PLAYER_X,
  PLAYER_O,
  BOARD_DIMENSION,
  createEmptyBoard,
  getNextPlayer,
  calculateWinner,
  isBoardFull,
  applyMove
};
