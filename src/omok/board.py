"""Omok board representation and win/draw helpers."""

from __future__ import annotations

from typing import List

EMPTY_CELL = "."
DIRECTIONS = (
    (0, 1),   # Horizontal
    (1, 0),   # Vertical
    (1, 1),   # Diagonal down-right
    (1, -1),  # Diagonal down-left
)


class OmokBoard:
    """Stateful Omok board that enforces placement rules."""

    def __init__(self, size: int = 15) -> None:
        if size < 5:
            raise ValueError("Board size must allow five consecutive stones.")
        self.size = size
        self._grid: List[List[str]] = [[EMPTY_CELL for _ in range(size)] for _ in range(size)]

    def reset(self) -> None:
        for row in range(self.size):
            for col in range(self.size):
                self._grid[row][col] = EMPTY_CELL

    def is_within_bounds(self, row: int, col: int) -> bool:
        return 0 <= row < self.size and 0 <= col < self.size

    def is_cell_empty(self, row: int, col: int) -> bool:
        self._assert_bounds(row, col)
        return self._grid[row][col] == EMPTY_CELL

    def place(self, row: int, col: int, stone: str) -> None:
        self._assert_bounds(row, col)
        if not stone or len(stone) != 1:
            raise ValueError("Stone marker must be a single character.")
        if self._grid[row][col] != EMPTY_CELL:
            raise ValueError("Cell is already occupied.")
        self._grid[row][col] = stone

    def is_full(self) -> bool:
        return all(cell != EMPTY_CELL for row in self._grid for cell in row)

    def has_five_in_a_row(self, row: int, col: int, stone: str) -> bool:
        self._assert_bounds(row, col)
        for delta_row, delta_col in DIRECTIONS:
            # Count contiguous stones in both directions from the last move
            total = 1
            total += self._count_direction(row, col, delta_row, delta_col, stone)
            total += self._count_direction(row, col, -delta_row, -delta_col, stone)
            if total >= 5:
                return True
        return False

    def formatted(self) -> str:
        header = "   " + " ".join(f"{idx:2d}" for idx in range(self.size))
        rows = [header]
        for idx, row in enumerate(self._grid):
            rows.append(f"{idx:2d} " + " ".join(row))
        return "\n".join(rows)

    def _assert_bounds(self, row: int, col: int) -> None:
        if not self.is_within_bounds(row, col):
            raise ValueError("Move is outside the board.")

    def _count_direction(
        self, start_row: int, start_col: int, delta_row: int, delta_col: int, stone: str
    ) -> int:
        count = 0
        row = start_row + delta_row
        col = start_col + delta_col
        while self.is_within_bounds(row, col) and self._grid[row][col] == stone:
            count += 1
            row += delta_row
            col += delta_col
        return count
