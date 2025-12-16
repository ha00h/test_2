# Tic-Tac-Toe UI 컴포넌트

React + Vite + TypeScript로 구성된 간단한 틱택토 UI 예제입니다. 보드, 셀, 상태 패널, 다시 시작 버튼을 각각 독립된 컴포넌트로 분리해 재사용성과 유지보수성을 높였습니다.

## 주요 구성 요소
- `src/components/TicTacToeBoard.tsx`: 3x3 보드를 렌더링하고 셀 클릭 이벤트를 부모로 전달합니다.
- `src/components/GameStatus.tsx`: 현재 차례, 승/무 상태, 진행 수 등을 안내합니다.
- `src/components/GameToolbar.tsx`: 다시 시작 버튼과 안내 문구를 제공합니다.
- `src/utils/gameLogic.ts`: 승리 판정, 빈 보드 생성 등 순수 게임 로직을 포함합니다.

## 실행 방법
```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (기본 5173 포트)
npm run build      # 타입 검사 후 프로덕션 번들 생성
npm run preview    # 빌드 결과 미리보기
```

## 스타일 특징
- CSS Grid와 반응형 단위를 사용해 모바일에서도 동일한 경험을 제공합니다.
- 승리 라인은 강조 색상으로 표시되고, 상태 패널은 톤온톤 배경을 적용했습니다.
- 버튼과 카드에 부드러운 그림자와 전환 효과를 넣어 인터랙션 피드백을 강화했습니다.

## 프로젝트 구조
```
├── index.html
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── GameStatus.tsx
│   │   ├── GameToolbar.tsx
│   │   └── TicTacToeBoard.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── types
│   │   └── game.ts
│   └── utils
│       └── gameLogic.ts
└── vite.config.ts
```
