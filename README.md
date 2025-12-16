# 보드 데이터 구조 설계

> 가로×세로 격자 위에서 흑백 돌을 번갈아 두는 추상 보드 게임(바둑, 오목, 리버시 등)에 공통적으로 적용할 수 있는 자료구조와 상태 검증 로직을 정리했습니다. 구현 언어는 예시일 뿐이며, 핵심은 일관된 데이터 모델과 검증 절차입니다.

## 1. 핵심 요구사항
- 임의 크기의 정사각/직사각 보드를 표현할 수 있어야 한다.
- 돌 배치, 삭제(포획), 무르기 등 상태 변화를 빠르게 처리한다.
- 불변식을 자동으로 검증해 잘못된 상태(예: 중복 착수, 자살 수, 순서 위반)를 차단한다.
- 직전 상태, 캡처 수, 반복 규칙(ko) 등 이력 정보도 함께 관리한다.

## 2. 자료구조 설계

```ts
// board/types.ts
export enum Stone {
  Empty = 0,
  Black = 1,
  White = 2,
}

export interface Move {
  x: number;
  y: number;
  stone: Stone.Black | Stone.White;
  timestamp: number;
}

export interface BoardSnapshot {
  width: number;
  height: number;
  cells: Uint8Array;        // length = width * height
  turn: Stone.Black | Stone.White;
  captures: { black: number; white: number };
  history: string[];        // 해시된 상태(ko 검증용)
  lastMove?: Move;
}
```

- `cells`는 1차원 `Uint8Array`로 두어 메모리 접근을 최소화한다. `(x, y)` 좌표는 `idx = y * width + x`로 변환하며, 헬퍼 `toIndex(x, y)`/`fromIndex(idx)`를 둔다.
- `BoardSnapshot`는 완전 불변 객체로 취급하고, 모든 연산은 새로운 스냅샷을 반환한다(함수형 접근). 성능이 필요한 경우에는 내부적으로 `WritableBoard`를 사용해 임시 수정 후 freeze한다.
- `history`에는 `cells`와 `turn`을 직렬화한 Zobrist hash를 넣어 ko/반복 규칙을 O(1)에 가깝게 검사한다.

### 연산 보조 구조
- `neighbors(idx)`는 상하좌우 인덱스를 미리 계산해 두어 매번 범위 검사를 반복하지 않도록 한다.
- `Union-Find` 혹은 `Flood Fill`을 이용해 연결된 돌 군(Group)을 탐색하고, 각 군의 `stones`, `liberties`(활로) 집합을 동시에 만든다.
- `BitSet`을 사용하면 방문 여부/활로를 메모리 효율적으로 관리할 수 있다.

## 3. 돌 배치(placeStone) 알고리즘

1. **입력 검증**  
   - 좌표가 범위 밖이면 거부.  
   - 현재 차례(`turn`)와 다른 색의 돌 요청 시 거부.
2. **중복 착수 검사**  
   - 대상 칸이 `Stone.Empty`인지 확인.
3. **가상 배치**  
   - 보드를 복사하거나 `WritableBoard`에 임시로 돌을 둔다.
4. **상대 돌 포획**  
   - 새로 둔 돌과 인접한 상대 군을 Flood Fill로 탐색.  
   - 활로가 0이면 해당 군의 좌표를 모두 `Stone.Empty`로 바꾸고 캡처 수 업데이트.
5. **자살 수 금지**  
   - 상대 군을 하나도 캡처하지 못했고, 새 돌이 속한 군의 활로가 0이라면 거부.
6. **ko/반복 금지**  
   - 직전 상태와 동일한 해시가 `history`의 마지막과 같다면 거부.
7. **상태 확정**  
   - `turn`을 토글하고, `lastMove`와 `history`에 새 상태를 추가해 반환한다.

의사코드:

```ts
export function placeStone(board: BoardSnapshot, move: Move): BoardSnapshot {
  assertInside(move, board);
  assertTurn(move, board.turn);

  const next = cloneBoard(board);
  const idx = toIndex(move.x, move.y, board.width);
  assertEmpty(next.cells[idx]);

  next.cells[idx] = move.stone;
  const captured = captureOpponents(next, move);

  if (captured.length === 0 && countLiberties(next, idx) === 0) {
    throw new Error("suicide move");
  }

  forbidKo(next);
  updateMeta(next, move, captured);
  return freeze(next);
}
```

## 4. 상태 검증 로직

`validateBoard(board: BoardSnapshot)`는 다음 불변식을 확인한다.

1. **치수/배열 무결성**  
   - `cells.length === width * height`.  
   - 모든 값이 `0|1|2` 범위.
2. **돌 개수 차이**  
   - `abs(blackCount - whiteCount) <= 1`.  
   - `turn`이 누구인지에 따라 개수 차이가 일관되어야 한다.
3. **마지막 수 일관성**  
   - `lastMove`가 존재하면 해당 좌표의 돌 색과 일치해야 한다.
4. **군 활로 검사**  
   - 각 군의 활로가 0인데 동시에 캡처 처리되지 않은 상태가 없어야 한다.  
   - 구현상 `computeGroups(board)`로 모든 군을 순회하며 `liberties` 집합을 확인.
5. **이력/ko**  
   - `history` 길이는 최소 돌 수보다 크거나 같아야 하며, 연속 중복 상태가 없어야 한다.

검증은 상태 저장 시 자동으로 실행하여, 잘못된 스냅샷이 애플리케이션 계층까지 올라오지 않도록 한다.

## 5. 확장 포인트
- **변형 규칙 지원**: `RuleSet` 객체를 만들어 보드 크기, ko 규칙 종류, 자살 허용 여부 등을 주입한다.
- **좌표 시스템**: UI/네트워크 계층에서 통용되는 좌표계(예: A1, (row, col))를 `CoordinateAdapter`로 추상화한다.
- **영속화**: `BoardSnapshot`은 직렬화가 쉬우므로 JSON, Protobuf 등으로 그대로 저장/전송 가능하다.
- **테스트 전략**:  
  - 작은 3×3, 5×5 보드로 자살 수, 포획, ko 케이스를 표 기반으로 작성.  
  - property-based 테스트로 돌 수 차이/반복 규칙을 자동 검증.

위 구조를 그대로 코드로 옮기면, 언어에 상관없이 일관된 보드 상태 관리와 검증을 구현할 수 있다.
