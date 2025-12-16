type GameToolbarProps = {
  onReset: () => void;
  canReset: boolean;
};

export const GameToolbar = ({ onReset, canReset }: GameToolbarProps) => {
  return (
    <div className="toolbar">
      <button
        type="button"
        className="toolbar__button"
        onClick={onReset}
        disabled={!canReset}
      >
        다시 시작
      </button>
      <p className="toolbar__hint">한 번이라도 수를 두면 언제든 초기화할 수 있어요.</p>
    </div>
  );
};
