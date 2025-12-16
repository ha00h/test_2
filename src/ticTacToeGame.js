const {
  PLAYER_X,
  PLAYER_O,
  BOARD_DIMENSION,
  createEmptyBoard,
  applyMove,
  getNextPlayer,
  calculateWinner,
  isBoardFull
} = require('./gameLogic');
const { createStore } = require('./stateStore');

const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

function createInitialState() {
  return {
    board: createEmptyBoard(),
    currentPlayer: PLAYER_X,
    winner: null,
    winningLine: [],
    draw: false,
    moves: 0,
    status: GAME_STATUS.READY,
    history: []
  };
}

function createTicTacToeGame() {
  const store = createStore(createInitialState());

  function play(position) {
    const state = store.getState();

    if (state.status === GAME_STATUS.FINISHED) {
      throw new Error('게임이 이미 종료되었습니다. 재시작하세요.');
    }

    const updatedBoard = applyMove(state.board, position, state.currentPlayer);
    const winnerInfo = calculateWinner(updatedBoard);
    const draw = !winnerInfo && isBoardFull(updatedBoard);
    const status = winnerInfo || draw ? GAME_STATUS.FINISHED : GAME_STATUS.PLAYING;
    const nextPlayer = winnerInfo || draw ? state.currentPlayer : getNextPlayer(state.currentPlayer);

    store.setState({
      board: updatedBoard,
      currentPlayer: nextPlayer,
      winner: winnerInfo ? winnerInfo.player : null,
      winningLine: winnerInfo ? winnerInfo.line : [],
      draw,
      moves: state.moves + 1,
      status,
      history: [
        ...state.history,
        { move: state.moves + 1, player: state.currentPlayer, position }
      ]
    });

    return store.getState();
  }

  function restart(firstPlayer = PLAYER_X) {
    const resetState = {
      ...createInitialState(),
      currentPlayer: firstPlayer,
      status: GAME_STATUS.READY
    };

    store.setState(resetState);
    return store.getState();
  }

  function getState() {
    return store.getState();
  }

  function subscribe(listener) {
    return store.subscribe(listener);
  }

  function getAvailableMoves() {
    return store
      .getState()
      .board.map((cell, index) => (cell ? null : index))
      .filter((idx) => idx !== null);
  }

  return {
    constants: {
      PLAYER_X,
      PLAYER_O,
      BOARD_DIMENSION,
      GAME_STATUS
    },
    play,
    restart,
    getState,
    subscribe,
    getAvailableMoves
  };
}

module.exports = {
  createTicTacToeGame,
  GAME_STATUS
};
