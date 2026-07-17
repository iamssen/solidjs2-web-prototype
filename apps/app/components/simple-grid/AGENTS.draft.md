# Simple grid 작업 지침 (초안)

## 목적과 범위

이 디렉토리는 Solid.js 2.0 기반의 작고 접근 가능한 `<table>` 컴포넌트를 둔다.

- 화면 폭이 충분하면 일반 table과 sticky header를 표시한다.
- 열의 최소 너비 합보다 viewport가 좁으면 table을 가로 스크롤하고, header와 첫 열을
  sticky로 고정한다.
- 세로 스크롤은 단일 viewport가 담당하며, 부모 페이지로 scroll chaining/bounce를 넘기지
  않는다.
- 이 컴포넌트는 데이터 grid가 아니다. 데이터 소유권, 정렬, 선택, 필터, 페이지네이션은
  호출자가 소유한다.

Sticky table 구현의 시각적 원칙은
<https://codepen.io/chriscoyier/pen/yLVNErX>를 참고한다.

## 기술 기준

- `docs/Solid2-beta-Migration-Guide.md`와 `docs/Solid.md`의 Solid.js 2.0 API를 따른다.
- `@solidjs/web`의 JSX/DOM 타입, `solid-js`의 signal과 control-flow를 사용한다.
- props나 signal을 컴포넌트 최상위에서 복사해 반응성을 잃지 않는다. 값은 JSX, memo,
  effect 같은 반응형 범위에서 읽는다.
- DOM 크기 관찰은 `ResizeObserver`와 `onSettled` cleanup을 사용한다. observer callback은
  layout 신호만 갱신하고 rows/columns를 변경하지 않는다.

## 파일 구성

- `SimpleTable.tsx`: generic table 구현과 공개 타입
- `SimpleTable.module.css`: table, sticky, scroll, alignment 기본 스타일
- `index.ts`: public export
- `main.tsx`: component preview. 좁은 화면, 세로 스크롤, custom cell을 확인할 수 있는
  데이터를 유지한다.
- `docs/Review.1.md`: 확장성 검토와 의도적으로 제외한 범위

## 현재 공개 API

`SimpleTable<Row>`는 `rows`, `columns`, `ariaLabel`을 받는다.

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

### 열 규칙

- `id`는 열을 식별한다. 이후 정렬, 테스트, VirtualGrid와의 공통 API에 사용하므로 안정적으로
  유지한다.
- `key`가 있고 `cell`이 없으면 해당 값의 문자열을 기본 셀 내용으로 렌더링한다.
- action/badge처럼 data field가 없는 열은 `key` 없이 `cell`만 제공할 수 있다.
- `cell`은 `{ row, rowIndex, column }` context를 받고 `Element`를 반환한다.
- `render="number(key)"`처럼 문자열 DSL을 만들지 않는다. 타입 검사와 리네임 안전성을
  잃기 때문이다.
- `align`, `headerClass`, `cellClass`로 단순한 표현을 해결한다. 더 많은 HTML attribute가
  여러 실제 사용처에서 반복될 때만 별도 props API를 추가한다.

### 행과 빈 상태 규칙

- 변경되는 목록에는 `getRowKey`를 제공한다. 생략하면 row object identity를 key로 사용한다.
- `rowClass`는 행별 강조를 위한 표현 전용 hook이다. 행 클릭/선택 상태를 내부에 추가하지
  않는다.
- rows가 비면 `empty`를 `colSpan={columns.length}`인 행에 출력한다. `empty`가 없으면 기본
  안내 문구를 출력한다.

### 레이아웃과 스타일 규칙

- `maxHeight`는 viewport의 최대 높이이며 기본값은 `24rem`이다.
- `stickyFirstColumn`의 기본값은 `true`다. 가로 overflow 상태에서만 실제 sticky를 적용한다.
- `class`는 viewport, `tableClass`는 `<table>`에 붙는다. 기본 CSS를 무력화할 필요가 없는
  범위에서는 이 hook과 data attribute(`data-layout`)를 우선 사용한다.
- `minWidth` 합과 viewport 폭의 비교가 layout의 유일한 기준이다. content width를 근거로
  mode를 별도로 바꾸지 않는다.

## 접근성과 HTML 의미론

- `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` 구조를 유지한다.
- 첫 열을 자동으로 row header(`<th scope="row">`)로 바꾸지 않는다. 데이터 의미가 확실한
  사용처에서만 별도 API를 검토한다.
- `ariaLabel`은 table의 접근 가능한 이름으로 유지한다. caption 지원이 실제로 필요해질 때,
  이름 계산이 중복되지 않게 API를 설계한다.
- custom cell이 button/link를 반환해도 sticky 배경과 z-index 아래로 가려지지 않아야 한다.

## 의도적으로 제외한 기능

아래 기능은 필요가 확인되기 전까지 추가하지 않는다.

- 내부 정렬, 필터, 페이지네이션
- row selection과 전용 row action 상태
- 열 드래그 resize, 다중 열 고정, column reorder
- 변수 높이 행 가상화

정렬이나 선택이 필요해져도 rows를 컴포넌트 내부에서 변경하지 말고, 현재 값과 변경 callback을
받는 controlled API로 추가한다.

## VirtualGrid와의 관계

행 가상화는 `simple-grid`에 옵션으로 섞지 않는다. 수천 행에서 실제 병목이 확인되면
`virtual-grid`를 별도 컴포넌트로 만든다.

- `rows`, `columns`, `id`, `key`, `cell`, `getRowKey`, `maxHeight`, sticky 관련 API는 가능한
  한 공유한다.
- VirtualGrid 첫 버전은 `rowHeight`를 필수로 하는 고정 높이 행만 지원한다.
- `overscan`, `scrollToRow` 같은 가상화 전용 API는 VirtualGrid에만 둔다.
- spacer row, focus 보존, 전체 행 수 접근성은 VirtualGrid가 별도로 해결한다.

## 변경·검증 체크리스트

1. wide/overflowing viewport에서 header 및 첫 열 sticky 동작을 모두 확인한다.
2. rows 0건, 다수 행 세로 스크롤, custom `cell`, align, custom class, `stickyFirstColumn={false}`를
   확인한다.
3. rows가 변경될 때 `getRowKey`를 제공한 목록의 DOM identity가 안정적인지 확인한다.
4. 변경 후 다음을 실행한다.

```sh
npx prettier --check apps/app/components/simple-grid
npx eslint apps/app/components/simple-grid
npm run build:app
```

전체 type-check가 실패하면 simple-grid 변경과 무관한 기존 오류인지 구분해서 보고한다.
