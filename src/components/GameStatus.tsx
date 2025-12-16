import { Player } from '../types/game';

export type GameStatusProps = {
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  movesCount: number;
};

export const GameStatus = ({ currentPlayer, winner, isDraw, movesCount }: GameStatusProps) => {
  const statusMessage = winner
    ? `${winner} 플레이어가 승리했습니다!`
    : isDraw
    ? '무승부입니다. 다시 도전해보세요!'
    : `${currentPlayer} 차례입니다.`;

  const subMessage = winner
    ? '축하합니다! 다시 시작 버튼으로 새 게임을 진행하세요.'
    : isDraw
    ? '모든 칸이 채워졌어요.'
    : `현재까지 ${movesCount}개의 수가 진행되었습니다.`;

  return (
    <section className="status-panel" aria-live="polite">
      <p className="status-panel__title">게임 상태</p>
      <p className="status-panel__message">{statusMessage}</p>
      <p className="status-panel__sub">{subMessage}</p>
    </section>
  );
};
