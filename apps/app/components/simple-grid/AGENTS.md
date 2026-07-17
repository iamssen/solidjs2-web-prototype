# Simple grid 작업 지침

작업 전 [docs/Design.md](./docs/Design.md)와
[docs/Implementation.md](./docs/Implementation.md)를 읽는다.

- `simple-grid`는 작은 접근 가능한 `<table>`이다. data-grid 기능을 추가하지 않는다.
- 정렬, 선택, 필터, 페이지네이션, column reorder는 실제 요구가 생길 때까지 구현하지 않는다.
- 가상화가 필요해지면 `simple-grid`를 복잡하게 만들지 말고 별도 `virtual-grid`를 검토한다.
- public API 또는 레이아웃 동작을 바꾸면 두 문서와 `preview.tsx`를 함께 갱신한다.
- Solid.js 2.0 API만 사용한다. 렌더링/반응성 규칙은 프로젝트의 `docs/Solid.md`를 따른다.

변경 후 다음을 실행한다.

```sh
npx prettier --check apps/app/components/simple-grid
npx eslint apps/app/components/simple-grid
npm run build:app
```

전체 type-check가 실패하면 변경한 component 오류와 기존 오류를 구분해 보고한다.
