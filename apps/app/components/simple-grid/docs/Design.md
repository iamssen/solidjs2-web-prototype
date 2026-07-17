# Simple grid 디자인

## 목적

`SimpleTable`은 데이터가 많지 않은 화면을 위한 작고 접근 가능한 `<table>`이다.

- 넓은 화면에서는 일반 table과 sticky header를 표시한다.
- 열 최소 너비의 합보다 viewport가 좁으면 가로 스크롤을 사용한다.
- 이때 header와 첫 열을 고정해 행의 의미를 잃지 않게 한다.
- 세로 스크롤은 table 전체가 아닌 단일 viewport가 담당한다.

Sticky table의 시각적 원칙은
<https://codepen.io/chriscoyier/pen/yLVNErX>를 참고한다.

## API 방향

호출자가 rows와 columns를 소유하고, component는 표현과 레이아웃만 담당한다.

- 기본 셀은 data key를 출력하고, 특별한 표시는 `cell(context)`로 처리한다.
- class와 alignment로 디자인 시스템을 적용할 수 있게 한다.
- 빈 상태와 첫 열 고정 여부는 component가 제공한다.
- sorting, selection, row action은 내부 상태로 만들지 않는다.

## 범위 밖 기능

가상화, 열 drag-resize/reorder, 다중 열 고정, 내부 정렬·필터·페이지네이션은 포함하지 않는다.
수천 행에서 실제 병목이 확인되면 shared column/row API를 사용하는 별도 `VirtualGrid`를 만든다.
첫 VirtualGrid는 고정 `rowHeight`만 지원하는 것을 원칙으로 한다.
