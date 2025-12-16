"""Omok game loop with alternating player turns and win/draw handling."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Callable, Optional, Tuple

from .board import OmokBoard


@dataclass(frozen=True)
class Player:
    name: str
    stone: str


class MoveOutcome(Enum):
    CONTINUE = auto()
    WIN = auto()
    DRAW = auto()


class OmokGame:
    def __init__(self, board_size: int = 15) -> None:
        self.board = OmokBoard(board_size)
        self.players = [Player("흑", "B"), Player("백", "W")]
        self._current_index = 0
        self.winner: Optional[Player] = None

    @property
    def current_player(self) -> Player:
        return self.players[self._current_index]

    def play_turn(self, row: int, col: int) -> MoveOutcome:
        player = self.current_player
        self.board.place(row, col, player.stone)
        if self.board.has_five_in_a_row(row, col, player.stone):
            self.winner = player
            return MoveOutcome.WIN
        if self.board.is_full():
            return MoveOutcome.DRAW
        self._current_index = (self._current_index + 1) % len(self.players)
        return MoveOutcome.CONTINUE

    def run_cli(self, input_func: Callable[[str], str] = input) -> None:
        print("오목 게임을 시작합니다. 'row col' 형태로 좌표를 입력하세요.")
        outcome = MoveOutcome.CONTINUE
        while outcome is MoveOutcome.CONTINUE:
            self._print_board()
            try:
                row, col = self._prompt_move(input_func)
                outcome = self.play_turn(row, col)
            except ValueError as exc:
                print(f"잘못된 입력: {exc}")
                continue

        self._print_board()
        if outcome is MoveOutcome.WIN and self.winner:
            print(f"{self.winner.name}({self.winner.stone}) 승리!")
        else:
            print("무승부로 게임을 종료합니다.")

    def _prompt_move(self, input_func: Callable[[str], str]) -> Tuple[int, int]:
        player = self.current_player
        prompt = f"{player.name}({player.stone}) 차례입니다. 좌표 입력: "
        raw = input_func(prompt)
        parts = raw.strip().split()
        if len(parts) != 2:
            raise ValueError("행과 열을 공백으로 구분해 입력하세요.")
        row, col = (int(value) for value in parts)
        return row, col

    def _print_board(self) -> None:
        print(self.board.formatted())


if __name__ == "__main__":
    OmokGame().run_cli()
