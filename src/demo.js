const { createTicTacToeGame } = require('./ticTacToeGame');

function render(state) {
  const rows = [];
  for (let r = 0; r < 3; r += 1) {
    const base = r * 3;
    rows.push(state.board.slice(base, base + 3).map((cell) => cell ?? '-').join(' '));
  }

  return rows.join('\n');
}

function runDemo() {
  const game = createTicTacToeGame();

  game.subscribe((state) => {
    console.log('\n=== 상태 업데이트 ===');
    console.log(render(state));
    console.log(`턴: ${state.currentPlayer}`);
    console.log(`승자: ${state.winner ?? '없음'}`);
    console.log(`무승부: ${state.draw}`);
    console.log(`상태: ${state.status}`);
  });

  [0, 3, 1, 4, 2].forEach((pos) => game.play(pos));

  console.log('\n재시작!');
  game.restart();
}

if (require.main === module) {
  runDemo();
}

module.exports = {
  runDemo
};
