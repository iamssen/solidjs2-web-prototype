# Simple grid 디자인

## 목적

`SimpleTable`은 데이터가 많지 않은 화면을 위한 작고 접근 가능한 `<table>`이다.

- 넓은 화면에서는 일반 table과 sticky header를 표시한다.
- 열 최소 너비의 합보다 viewport가 좁으면 가로 스크롤을 사용한다.
- 이때 header와 첫 열을 고정해 행의 의미를 잃지 않게 한다.
- 세로 스크롤은 table 전체가 아닌 단일 viewport가 담당한다.
- rows가 새 배열로 교체되면 viewport scroll 위치를 좌상단으로 되돌려 새 데이터를 첫 행과
  첫 열부터 읽게 한다.
- 기본 style은 작은 padding과 은은한 hover만 사용하며, border·grid line·header separator를
  표시하지 않는다. 선이 필요한 화면은 class로 별도 style을 적용한다.

Sticky table의 시각적 원칙은
<https://codepen.io/chriscoyier/pen/yLVNErX>를 참고한다.

## API 방향

호출자가 rows와 columns를 소유하고, component는 표현과 레이아웃만 담당한다.

- 열의 `cell`에 행 속성 이름을 지정하면 기본 문자열을 표시하고, 특별한 표시는
  `cell(context)`로 처리한다.
- `header` renderer는 행 수나 합계처럼 현재 rows에서 계산한 header를 표시할 수 있다.
- header·cell·row class와 native table attribute로 디자인 시스템을 적용할 수 있게 한다.
- 빈 상태와 첫 열 고정 여부는 component가 제공한다.
- sorting, selection, row action은 내부 상태로 만들지 않는다.

## Native table 속성

`SimpleTable`은 충돌하지 않는 `JSX.IntrinsicElements['table']` 속성을 실제 `<table>`에
전달한다. 따라서 `id`, `data-*`, `aria-describedby`, click handler 같은 표준 table 속성을
추가할 수 있다.

- 접근 가능한 이름은 `'aria-label'` 또는 `'aria-labelledby'` 중 하나로 반드시 제공한다.
- `class`, `style`, `ref`도 table에 적용한다. component가 계산하는 `width`와 `min-width`는
  overflow 레이아웃을 위해 항상 우선한다.
- viewport는 table 바깥의 scroll container이므로 `viewportClass`와
  `onViewportScroll`로 별도 제어한다.
- `children`, `role`, native `onScroll`은 내부 table 구조·native table 의미·event 대상을
  혼동시킬 수 있어 제공하지 않는다.

## 범위 밖 기능

가상화, 열 drag-resize/reorder, 다중 열 고정, 내부 정렬·필터·페이지네이션은 포함하지 않는다.
수천 행에서 실제 병목이 확인되면 shared column/row API를 사용하는 별도 `VirtualGrid`를 만든다.
첫 VirtualGrid는 고정 `rowHeight`만 지원하는 것을 원칙으로 한다.
