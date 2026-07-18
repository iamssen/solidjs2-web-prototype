# Simple grid 구현

## 파일

- `SimpleTable.tsx`: public 타입과 `<table>` 렌더링
- `SimpleTable.module.css`: scroll과 sticky 기본 스타일
- `preview/`: 다수 행, custom cell, dynamic header, native attribute를 보이는 style별 preview

## Public API

```ts
type SimpleTableColumn<Row> = {
  id: string;
  header: Element | ((context: SimpleTableHeaderContext<Row>) => Element);
  minWidth: number;
  cell:
    | Extract<keyof Row, string>
    | ((context: SimpleTableCellContext<Row>) => Element);
  headerClass?: string;
  cellClass?:
    string | ((context: SimpleTableCellContext<Row>) => string | undefined);
};

type SimpleTableProps<Row> = Omit<
  JSX.IntrinsicElements['table'],
  | 'children'
  | 'role'
  | 'class'
  | 'style'
  | 'ref'
  | 'onScroll'
  | 'aria-label'
  | 'aria-labelledby'
> &
  AccessibleName & {
    rows: readonly Row[];
    columns: readonly SimpleTableColumn<Row>[];
    maxHeight?: string;
    class?: JSX.IntrinsicElements['table']['class'];
    style?: JSX.CSSProperties | string;
    ref?: JSX.Ref<HTMLTableElement>;
    viewportClass?: JSX.IntrinsicElements['div']['class'];
    onViewportScroll?: JSX.EventHandlerUnion<HTMLDivElement, Event>;
    rowClass?:
      string | ((context: SimpleTableRowContext<Row>) => string | undefined);
    empty?: Element;
    stickyFirstColumn?: boolean;
    getRowKey?: (row: Row, rowIndex: number) => string | number;
  };
```

`cell: 'name'`처럼 행 속성 이름을 사용하면 기본 문자열을 표시한다. 값 형식화, action,
계산 열은 cell renderer를 사용한다. `header` renderer에는 `readonly rows`, 현재 column,
columnIndex가 전달된다. 변경되는 rows에는 `getRowKey`를 제공한다.

## 레이아웃과 반응성

- `ResizeObserver`로 viewport 너비를 관찰한다.
- `minWidth` 합과 viewport 너비를 비교해 `fitted`/`overflowing` layout을 결정한다.
- `minWidth`는 픽셀 단위의 최소 열 너비이며, 별도의 `maxWidth` API는 제공하지 않는다.
- overflowing일 때만 CSS가 첫 열을 sticky로 만든다. 기본값은
  `stickyFirstColumn={true}`다.
- `onSettled`에서 observer를 설치하고 cleanup으로 해제한다.
- `createEffect`는 `rows` 배열 참조가 바뀌는 것을 관찰해 viewport를 좌상단으로 scroll한다.
- `For keyed={(row) => key}`의 child는 accessor를 받는다. row를 읽을 때는 `row()`을 사용한다.
- viewport에는 `overscroll-behavior: none`을 유지한다.

## HTML과 스타일

- `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` 구조를 유지한다.
- 기본 style은 compact한 padding과 hover만 제공하며, border·grid line·header separator는
  포함하지 않는다. preview의 compact·spreadsheet 같은 variant가 class로 선과 강조를 더한다.
- table의 접근 가능한 이름은 `'aria-label'` 또는 `'aria-labelledby'`로 제공한다.
- rows가 없으면 `empty`를 columns 수만큼 colspan한 단일 셀에 표시한다.
- `class`는 table, `viewportClass`는 scroll viewport,
  `rowClass`/`headerClass`/`cellClass`는 해당 element에 붙는다.
- 열 정렬은 `headerClass`와 `cellClass`에 같은 CSS class를 지정해 처리한다.
- `id`, `data-*` 등 충돌하지 않는 native table attribute는 table에 전달된다.
  `children`, `role`, native `onScroll`은 전달하지 않으며 viewport scroll event는
  `onViewportScroll`로 받는다.
- `data-layout`은 `fitted` 또는 `overflowing`이다.

## 변경 시 확인할 것

- wide/overflowing viewport 모두에서 header와 첫 열 sticky를 확인한다.
- empty, 다수 행 스크롤, data 교체 뒤 scroll reset, custom cell, dynamic header, CSS 정렬,
  custom class, native table attribute, `stickyFirstColumn={false}`를 확인한다.
- API나 동작이 달라지면 `Design.md`, 이 문서, preview를 함께 갱신한다.
