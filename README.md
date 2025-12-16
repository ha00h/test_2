# Tic-Tac-Toe 게임 로직 & 상태 관리

플레이어 턴 전환, 승리/무승부 판정, 재시작 기능을 모두 포함한 틱택토 게임 상태 관리 모듈입니다. UI 프레임워크와 무관하게 사용할 수 있도록 순수 JavaScript로 작성되었습니다.

## 주요 파일
- `src/gameLogic.js`: 승리 조합 계산, 다음 플레이어 결정, 보드 검증 등 핵심 규칙.
- `src/stateStore.js`: 단순 퍼블리시-구독 형태의 상태 저장소.
- `src/ticTacToeGame.js`: 게임 규칙과 저장소를 묶어 `play`, `restart`, `subscribe` API 제공.
- `src/demo.js`: 터미널에서 전체 흐름을 확인할 수 있는 간단한 데모.

## 실행 방법
```bash
node src/demo.js
```
콘솔에서 각 턴의 상태 변화, 승자, 무승부 여부를 즉시 확인할 수 있습니다.

## 상태 구조
- `board`: 3x3(길이 9) 배열, 각 칸은 `X`, `O`, `null`.
- `currentPlayer`: 현재 수를 둘 차례인 플레이어.
- `winner` / `winningLine`: 승리한 플레이어와 3칸 조합.
- `draw`: 무승부 여부.
- `status`: `ready`, `playing`, `finished` 중 하나.
- `history`: `{ move, player, position }` 형태의 턴 기록.

`subscribe` API를 통해 UI에 상태를 즉시 반영하거나, 서버 사이드 게임 매니저로 확장할 수 있습니다.
