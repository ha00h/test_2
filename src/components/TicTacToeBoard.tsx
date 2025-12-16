import { CellValue } from '../types/game';

export type TicTacToeBoardProps = {
  cells: CellValue[];
  winningLine?: number[] | null;
  disabled?: boolean;
  onCellClick: (index: number) => void;
};

export const TicTacToeBoard = ({
  cells,
  winningLine,
  disabled = false,
  onCellClick
}: TicTacToeBoardProps) => {
  return (
    <div className="board" role="grid" aria-label="틱택토 보드">
      {cells.map((value, index) => {
        const isWinningCell = winningLine?.includes(index);
        return (
          <button
            key={index}
            type="button"
            className={[
              'cell',
              value ? 'cell--filled' : 'cell--empty',
              isWinningCell ? 'cell--highlight' : null
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`셀 ${index + 1}${value ? `, ${value}` : ''}`}
            aria-pressed={Boolean(value)}
            disabled={disabled || Boolean(value)}
            onClick={() => onCellClick(index)}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
};
