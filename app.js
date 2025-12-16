const boardElement = document.querySelector(".board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("statusText");
const resetButton = document.getElementById("resetButton");
const playerCards = document.querySelectorAll(".player-card");
const scoreEls = {
  X: document.getElementById("scoreX"),
  O: document.getElementById("scoreO"),
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const state = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  scores: { X: 0, O: 0 },
  isActive: true,
};

const setStatus = (message) => {
  statusText.textContent = message;
};

const setActivePlayerCard = (player) => {
  playerCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.player === player);
  });
};

const handleCellClick = (event) => {
  const button = event.target;
  if (!button.classList.contains("cell") || !state.isActive) return;

  const index = Number(button.dataset.index);
  if (state.board[index]) return;

  state.board[index] = state.currentPlayer;
  button.textContent = state.currentPlayer;
  button.classList.add(state.currentPlayer.toLowerCase());
  button.setAttribute("aria-label", `칸 ${index + 1}, ${state.currentPlayer}`);

  if (checkWinner()) {
    return;
  }

  if (state.board.every(Boolean)) {
    setStatus("무승부입니다. 새 게임을 시작하세요!");
    state.isActive = false;
    return;
  }

  state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  setActivePlayerCard(state.currentPlayer);
  setStatus(`플레이어 ${state.currentPlayer} 차례입니다.`);
};

const checkWinner = () => {
  for (const [a, b, c] of winningLines) {
    if (
      state.board[a] &&
      state.board[a] === state.board[b] &&
      state.board[a] === state.board[c]
    ) {
      announceWinner([a, b, c], state.board[a]);
      return true;
    }
  }
  return false;
};

const announceWinner = (line, player) => {
  state.isActive = false;
  state.scores[player] += 1;
  scoreEls[player].textContent = state.scores[player];
  setStatus(`플레이어 ${player} 승리! 새 게임을 진행하세요.`);

  cells.forEach((cell, index) => {
    if (line.includes(index)) {
      cell.classList.add("winning");
    }
  });
};

const resetBoard = () => {
  state.board.fill(null);
  state.currentPlayer = "X";
  state.isActive = true;
  setActivePlayerCard("X");
  setStatus("플레이어 X 차례입니다.");
  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winning");
    cell.removeAttribute("aria-label");
    cell.dataset.index = index;
  });
};

boardElement.addEventListener("click", handleCellClick);
resetButton.addEventListener("click", () => {
  resetBoard();
});

resetBoard();
