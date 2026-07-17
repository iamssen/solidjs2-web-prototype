# Simple grid 구현

## 파일

- `SimpleTable.tsx`: public 타입과 `<table>` 렌더링
- `SimpleTable.module.css`: scroll, sticky, alignment 기본 스타일
- `preview.tsx`: 다수 행과 custom cell을 보이는 preview

## Public API

```ts
type SimpleTableColumn<Row> = {
  id: string;
  key?: Extract<keyof Row, string>;
  header: Element;
  minWidth: number;
  maxWidth?: number;
  cell?: (context: SimpleTableCellContext<Row>) => Element;
  align?: 'start' | 'center' | 'end';
  headerClass?: string;
  cellClass?:
    string | ((context: SimpleTableCellContext<Row>) => string | undefined);
};

type SimpleTableProps<Row> = {
  rows: readonly Row[];
  columns: readonly SimpleTableColumn<Row>[];
  ariaLabel: string;
  maxHeight?: string;
  class?: string;
  tableClass?: string;
  rowClass?:
    string | ((context: SimpleTableRowContext<Row>) => string | undefined);
  empty?: Element;
  stickyFirstColumn?: boolean;
  getRowKey?: (row: Row, rowIndex: number) => string | number;
};
```

`key` 없이 `cell`만 제공하면 data field가 없는 열도 만들 수 있다. 변경되는 rows에는
`getRowKey`를 제공한다.

## 레이아웃과 반응성

- `ResizeObserver`로 viewport 너비를 관찰한다.
- `minWidth` 합과 viewport 너비를 비교해 `fitted`/`overflowing` layout을 결정한다.
- overflowing일 때만 CSS가 첫 열을 sticky로 만든다. 기본값은
  `stickyFirstColumn={true}`다.
- `onSettled`에서 observer를 설치하고 cleanup으로 해제한다.
- `For keyed={(row) => key}`의 child는 accessor를 받는다. row를 읽을 때는 `row()`을 사용한다.
- viewport에는 `overscroll-behavior: none`을 유지한다.

## HTML과 스타일

- `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` 구조를 유지한다.
- table의 접근 가능한 이름은 `ariaLabel`로 제공한다.
- rows가 없으면 `empty`를 columns 수만큼 colspan한 단일 셀에 표시한다.
- `class`는 viewport, `tableClass`는 table, `rowClass`/`headerClass`/`cellClass`는 해당
  element에 붙는다.
- `data-layout`은 `fitted` 또는 `overflowing`이다.

## 변경 시 확인할 것

- wide/overflowing viewport 모두에서 header와 첫 열 sticky를 확인한다.
- empty, 다수 행 스크롤, custom cell, align, custom class,
  `stickyFirstColumn={false}`를 확인한다.
- API나 동작이 달라지면 `Design.md`, 이 문서, preview를 함께 갱신한다.
