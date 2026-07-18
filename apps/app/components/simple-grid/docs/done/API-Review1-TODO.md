# SimpleTable API review TODO

`API-Review1.md`에서 합의한 API 변경을 구현하고 검증한 작업 목록이다.

## 확정할 API 형태

- [x] `SimpleTableAlignment` export와 `SimpleTableColumn.align`을 제거한다.
  - 열 정렬은 `headerClass`와 `cellClass`에 같은 CSS class를 지정해 처리한다.
  - `data-align` attribute와 기본 stylesheet의 alignment selector도 함께 제거한다.
- [x] 동적 header를 지원한다.
  - `header`는 `Element` 또는 header renderer를 받는다.
  - renderer에는 `rows: readonly Row[]`, 현재 `column`, `columnIndex`를 context 객체로 전달한다.
  - renderer가 행 데이터를 변경하지 못하도록 `rows`는 readonly로 유지한다.
- [x] `key`와 `cell`을 하나의 필수 `cell` 속성으로 통합한다.
  - `cell`은 `Extract<keyof Row, string>` 또는 cell renderer다.
  - 속성 이름은 `<td>`의 표시 내용을 결정한다는 의미가 분명한 `cell`을 유지한다.
- [x] `maxWidth`를 제거하고 `minWidth`만 유지한다.
  - `minWidth`는 픽셀 단위 최소 열 너비와 horizontal overflow의 계산 기준이다.
  - 현재 table layout에서 엄격하게 보장할 수 없는 최대 열 너비 API는 제공하지 않는다.
- [x] native table attribute 전달 범위를 정한다.
  - 기준 타입은 `JSX.HTMLAttributes<HTMLTableElement>`가 아닌
    `JSX.IntrinsicElements['table']`이다.
  - `children`, `role`처럼 table 구조·의미를 바꿀 수 있는 속성과 내부 계산과 충돌하는
    속성의 허용 여부를 명시한다.
  - 접근 가능한 이름은 `'aria-label'` 또는 `'aria-labelledby'` 중 하나가 반드시
    전달되도록 타입으로 표현한다.

## 구현 작업

- [x] `SimpleTable.tsx`의 public type과 한글 TSDoc을 새 API에 맞게 갱신한다.
- [x] 기본 값 표시와 renderer 호출을 하나의 `cell` union에서 분기하도록 바꾼다.
- [x] header renderer를 호출하는 helper를 만들고, 모든 header에 현재 rows와 열 정보를
      전달한다.
- [x] `minWidth` 합계, `<col>` style, overflowing table width 계산에서 `maxWidth` 의존을
      제거한다.
- [x] table native attributes와 component 전용 props를 반응성을 잃지 않는 방식으로
      분리한다.
- [x] table의 `class`/`style`/`ref`를 기본 table class·계산된 width style과 안전하게
      병합한다.
- [x] 기존 viewport `class`는 `viewportClass`로 이름을 바꾸고, scroll event 등 viewport에
      적용할 속성의 별도 API가 필요한지 결정한다.
- [x] `ariaLabel`, `tableClass`의 제거·대체에 따른 모든 호출부를 갱신한다.

## 문서와 preview

- [x] `docs/Design.md`와 `docs/Implementation.md`의 API·CSS 책임·접근성 설명을 새 API와
      일치시킨다.
- [x] `preview/`의 네 예제를 새 `cell` 형태로 옮긴다.
- [x] 정렬이 필요한 모든 preview 열을 CSS class 기반 정렬로 바꾼다.
- [x] 한 preview에는 동적 header를 사용해 합계 또는 행 수를 표시한다.
- [x] 한 preview에는 `id`, `data-*`, `'aria-labelledby'` 같은 native table attribute 전달을
      확인하는 사례를 추가한다.
- [x] 모든 preview가 50개 이상 행과 약 6개 열을 유지하는지 확인한다.

## 검증

- [x] TypeScript에서 잘못된 `cell` key, renderer context, 접근 가능한 이름 누락이
      거부되는지 확인한다.
- [ ] wide viewport와 horizontal overflow viewport에서 header·첫 열 sticky 동작을
      확인한다.
- [ ] vertical scroll, 빈 상태, dynamic header, CSS 정렬, custom class, native table
      attribute, `stickyFirstColumn={false}`를 확인한다.
- [x] `npx prettier --check apps/app/components/simple-grid`를 실행한다.
- [x] `npx eslint apps/app/components/simple-grid`를 실행한다.
- [x] `npm run build:app`을 실행한다.

전체 type-check는 변경한 `simple-grid`에서 오류 없이 통과했으나, 저장소 기존 파일인
`apps/app/scratch/Test.tsx`와 `apps/app/scratch/Test2.tsx`의 unused variable 오류 때문에
전체 명령은 성공하지 못했다.

화면 기반 검증은 이 실행 환경에 연결 가능한 browser가 없어 보류했다. 다음 browser 가능
환경에서 wide/overflow viewport와 scroll·sticky 동작을 확인한 뒤 남은 두 항목을 완료한다.
