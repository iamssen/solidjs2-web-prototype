# Simple grid 확장성 검토

## 결론

이 컴포넌트는 대규모 데이터 그리드가 아니라, 좁은 화면에서도 의미를 잃지 않는
작은 `<table>`이어야 한다. 따라서 **데이터와 열 정의는 호출자가 소유하고**, 컴포넌트는
레이아웃·접근성·표현용 hook만 제공하는 방향이 가장 단순하다.

우선순위는 다음과 같다.

1. 열·행·셀의 표현을 세밀하게 제어할 수 있게 한다.
2. 스타일과 스크롤 영역을 호출자가 자연스럽게 조정할 수 있게 한다.
3. 정렬처럼 상태를 바꾸는 기능은 controlled API로만 추가한다.

가상화, 열 드래그 크기 조절, 다중 열 고정, 내부 필터링/페이지네이션은 이 범위를 벗어난다.
이 기능들은 단순한 table의 예측 가능성과 접근성을 해치며 별도 data-grid가 더 적합하다.

## 구현 반영 상태

다음 항목은 `SimpleTable`에 반영되었다.

- `id`, 선택적 `key`, `cell(context)`, 선택적 `getRowKey`
- `align`, header/cell/row class, viewport/table class
- 빈 상태, `stickyFirstColumn`

정렬, 선택, row action, 가상화는 의도적으로 보류한다. 현재 API와 향후 VirtualGrid의
경계는 상위 `AGENTS.draft.md`에 정리한다.

## 현재 구현의 좋은 경계

- `rows`와 `columns`를 props로 받아 데이터 소유권이 호출자에게 있다.
- `minWidth` 합계와 viewport 폭을 비교해 좁은 화면에서만 첫 열을 고정한다.
- 단일 스크롤 컨테이너, sticky header, `overscroll-behavior`만 사용한다.
- `cell(context)`로 숫자·상태 표시 같은 특수 셀을 이미 표현할 수 있다.

이 경계는 유지한다. 특히 내부에서 rows를 정렬하거나 필터링하지 않아야 signal/store와
서버 데이터의 소유권이 섞이지 않는다.

## 먼저 보강할 API

### 1. 안정적인 열/행 식별자

`key`는 데이터 속성 접근에는 적합하지만 열 자체의 식별자로는 부족하다. 렌더링, 정렬,
테스트, 사용자 정의 클래스에 사용할 `id`와 행의 안정적인 key를 추가한다.

```ts
type SimpleTableColumn<Row> = {
  id: string;
  key?: Extract<keyof Row, string>;
  header: Element;
  minWidth: number;
  maxWidth?: number;
  cell?: (context: {
    row: Row;
    rowIndex: number;
    column: SimpleTableColumn<Row>;
  }) => Element;
};

type SimpleTableProps<Row> = {
  rows: readonly Row[];
  columns: readonly SimpleTableColumn<Row>[];
  getRowKey: (row: Row, rowIndex: number) => string | number;
  // 기존 props…
};
```

`cell`이 없으면 `key`를 이용해 기본 텍스트를 표시한다. `key`도 없는 열은 `cell`을
필수로 하므로 action, badge, 선택 checkbox처럼 데이터 속성에 대응하지 않는 열도 만들 수
있다. 기존 `render`는 이 `cell`로 이름을 통일하는 편이 의미가 명확하다.

AGENTS.md의 `render="number(key1)"` 같은 문자열 DSL은 추가하지 않는다. 타입 검사,
리네임, null 처리, 형식화 규칙을 모두 잃기 때문이다. `cell` 함수와 작고 명시적인
formatter 함수가 더 안전하고 충분히 표현력이 높다.

### 2. 표와 셀의 외형 hook

특정 디자인 시스템을 내장하지 않고, 필요한 DOM 위치에 class/style/attribute를 전달한다.

```ts
type SimpleTableColumn<Row> = {
  // …
  align?: 'start' | 'center' | 'end';
  headerCellProps?: JSX.ThHTMLAttributes<HTMLTableCellElement>;
  cellProps?:
    | JSX.TdHTMLAttributes<HTMLTableCellElement>
    | ((context) => JSX.TdHTMLAttributes<HTMLTableCellElement>);
};

type SimpleTableProps<Row> = {
  // …
  class?: string;
  tableClass?: string;
  rowProps?: (
    row: Row,
    rowIndex: number,
  ) => JSX.TrHTMLAttributes<HTMLTableRowElement>;
};
```

이 정도면 열별 정렬, 강조, `data-*` 속성, 클릭/키보드 handler, 행 상태 색상을 처리할 수
있다. CSS 변수(`--simple-table-header-background` 등)를 문서화하면 기본 CSS를 덮어쓰지
않고 theme도 적용할 수 있다.

### 3. 빈 상태와 table 설명

데이터가 없을 때도 구조를 유지할 수 있도록 다음을 제공한다.

```ts
type SimpleTableProps<Row> = {
  caption?: Element;
  empty?: Element | ((columnCount: number) => Element);
  ariaLabel?: string;
};
```

`caption`이 있으면 접근 가능한 표 이름으로 우선 사용하고, 없을 때만 `ariaLabel`을
요구한다. `empty`는 `colSpan={columns.length}`인 단일 행 안에 렌더링한다. loading/error는
데이터 fetching의 책임이므로 컴포넌트의 상태로 만들지 말고 `empty` 또는 컴포넌트 바깥에서
표현한다.

### 4. 레이아웃 결과의 관찰 가능성

현재 `data-layout`은 디버깅에 유용하다. 이를 의도적인 API로 승격하면 호출자가 힌트 문구나
스타일을 바꿀 수 있다.

```ts
type TableLayout = 'fitted' | 'overflowing';

type SimpleTableProps<Row> = {
  // …
  maxHeight?: string;
  stickyFirstColumn?: boolean;
  onLayoutChange?: (layout: TableLayout) => void;
};
```

기본 `stickyFirstColumn`은 `true`로 둔다. `onLayoutChange`는 실제 값이 바뀔 때만 호출하고,
상태를 바꾸지 않는 통지 전용 callback으로 둔다. 첫 열 고정 여부나 threshold를 임의 CSS로
추측하게 만들지 않는다.

## 나중에 추가할 수 있는 controlled 기능

### 정렬

정렬은 column에 `sortable`을 표시하되 rows를 직접 변경하지 않는다. 현재 정렬 상태와
요청 callback을 호출자가 제공한다.

```ts
type Sort =
  { columnId: string; direction: 'ascending' | 'descending' } | undefined;

type SimpleTableProps<Row> = {
  // …
  sort?: Sort;
  onSortChange?: (next: Sort) => void;
};
```

헤더는 이 경우에만 `<button>`과 `aria-sort`를 출력한다. 서버 정렬, signal 기반 정렬,
정렬 불가 열을 모두 같은 API로 처리할 수 있다. 다중 정렬과 내부 정렬 알고리즘은 추가하지
않는다.

### 선택과 행 action

선택 상태도 `selectedRowKeys`와 `onSelectedRowKeysChange`를 받는 controlled API여야 한다.
다만 checkbox 열은 위의 key 없는 `cell` 열로도 만들 수 있으므로, 실제로 여러 화면에서
반복되기 전에는 전용 API를 추가하지 않는다. 행 클릭 역시 `rowProps`의 handler로 충분하다.

## 구현 시 지킬 규칙

- `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`의 의미론을 유지한다.
- 첫 열을 자동으로 row header로 바꾸지 않는다. 이름/식별자 열임이 명확할 때만 호출자가
  `cellProps` 또는 별도 `isRowHeader` 옵션으로 선택하게 한다.
- `ResizeObserver`는 viewport만 관찰하고, 관찰 결과로 rows/columns를 수정하지 않는다.
- `minWidth`는 0보다 큰 유한한 값인지 개발 환경에서 검증한다. `maxWidth`가 있으면
  `maxWidth >= minWidth`도 검증한다.
- custom renderer가 button, link 등 상호작용 요소를 넣어도 sticky 배경과 z-index가
  가려지지 않는지 확인한다.
- rows/columns가 변경되는 경우 `getRowKey` 기반으로 행 identity를 보존하도록 Solid의
  list 렌더링 방식을 검토한다.

## 권장 도입 순서

1. `id`, 선택적 `key`, `cell`, `getRowKey`, 빈 상태를 추가한다.
2. `class`, `tableClass`, CSS 변수, row/cell props를 추가한다.
3. 실제 사용처가 생기면 controlled 정렬을 추가하고 keyboard/ARIA 테스트를 작성한다.
4. 그 뒤에도 행 수가 커져 렌더링 비용이 문제가 될 때에만, 이 컴포넌트를 확장하지 말고
   별도 virtualization 전용 grid를 평가한다.
