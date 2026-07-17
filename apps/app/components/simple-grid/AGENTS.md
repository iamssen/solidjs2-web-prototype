# Component 설명

Solid.js 2.0 component.

`docs/Solid2-beta-Migration-Guide.md` Solid.js 2.0 API에 기반하여 작성되어야 함

`<table>` header와 first column sticky 예제는 <https://codepen.io/chriscoyier/pen/yLVNErX>를 참고하도록 한다.

이 Component의 가장 큰 목적은 화면이 작아서 전체 column을 표현하기 어려운 경우엔 첫번째 column을 sticky로 고정하여 스크롤하고,
화면이 넉넉해서 전체 column을 표현 가능한 경우엔 스크롤없는 일반 `<table>` 형태로 표시하는 것이다.

# Component 디자인

```tsx
<SimpleGrid>
  <Column minWidth={100} maxWidth={150} render="number(key1)" />
  <Column minWidth={100} maxWidth={150} render="string(key2)" />
  <Column minWidth={100} maxWidth={150} render={ColumnRenderer} />
</SimpleGrid>
```

- `<table>`을 기반으로 한다
- minWidth 들을 모두 합산해서 전체 column들의 totalMinWidth를 구한다
- `<table>` element의 실측 사이즈를 구하고, totalMinWidth과 비교한다
  - 실측 사이즈가 totalMinWidth보다 크면, header만 sticky로 고정하고 tbody는 스크롤 되도록 한다.
  - 실측 사이즈가 totalMinWidth보다 작으면, 전체 column들은 minWidth로 고정하고, header와 첫번째 column을 sticky로 고정하고, 모두 스크롤 되도록 한다.
