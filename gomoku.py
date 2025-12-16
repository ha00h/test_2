from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple


EMPTY = "."


@dataclass
class MoveResult:
    success: bool
    message: str


class GomokuBoard:
    """간단한 오목 보드 관리 클래스."""

    def __init__(self, size: int = 19) -> None:
        if size < 5:
            raise ValueError("보드 크기는 최소 5 이상이어야 합니다.")
        self.size = size
        self._grid: list[list[str]] = [[EMPTY] * size for _ in range(size)]

    def is_within_bounds(self, x: int, y: int) -> bool:
        return 0 <= x < self.size and 0 <= y < self.size

    def is_empty(self, x: int, y: int) -> bool:
        return self._grid[y][x] == EMPTY

    def place_stone(self, x: int, y: int, player: str) -> MoveResult:
        player = player.upper()
        if player not in {"B", "W"}:
            return MoveResult(False, "플레이어 표기는 B 또는 W 여야 합니다.")

        if not self.is_within_bounds(x, y):
            return MoveResult(False, f"좌표 ({x}, {y}) 는 보드 범위를 벗어났습니다.")

        if not self.is_empty(x, y):
            return MoveResult(False, f"좌표 ({x}, {y}) 에는 이미 돌이 놓여 있습니다.")

        self._grid[y][x] = player
        return MoveResult(True, f"{player} 돌을 ({x}, {y}) 에 놓았습니다.")

    def __str__(self) -> str:
        # 좌표 보조 라벨과 함께 보드를 문자열로 표현
        header = "   " + " ".join(f"{i:2d}" for i in range(self.size))
        rows = []
        for row_idx, row in enumerate(self._grid):
            rows.append(f"{row_idx:2d} " + " ".join(row))
        return "\n".join([header] + rows)


def parse_coordinate(raw: str) -> Optional[Tuple[int, int]]:
    """사용자 입력을 좌표로 변환. 공백으로 구분된 두 정수를 기대한다."""
    try:
        x_str, y_str = raw.strip().split()
        return int(x_str), int(y_str)
    except ValueError:
        return None


def prompt_and_place(board: GomokuBoard, player: str, raw_input: str) -> MoveResult:
    """사용자 입력 문자열을 받아 돌을 놓고 결과를 반환."""
    coords = parse_coordinate(raw_input)
    if coords is None:
        return MoveResult(False, "좌표는 'x y' 형태의 두 정수여야 합니다.")

    x, y = coords
    return board.place_stone(x, y, player)


def main() -> None:
    board = GomokuBoard()
    current_player = "B"
    print("오목 돌 놓기 데모입니다. 좌표를 'x y' 형태로 입력하세요. 종료는 q.")
    while True:
        print(board)
        raw = input(f"{current_player} 차례 > ").strip()
        if raw.lower() in {"q", "quit", "exit"}:
            print("게임을 종료합니다.")
            break

        result = prompt_and_place(board, current_player, raw)
        print(result.message)
        if result.success:
            current_player = "W" if current_player == "B" else "B"


if __name__ == "__main__":
    main()
