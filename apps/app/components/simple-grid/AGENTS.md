# Simple grid 작업 지침

작업 전 [docs/Design.md](./docs/Design.md)와
[docs/Implementation.md](./docs/Implementation.md)를 읽는다.

- `simple-grid`는 작은 접근 가능한 `<table>`이다. data-grid 기능을 추가하지 않는다.
- 정렬, 선택, 필터, 페이지네이션, column reorder는 실제 요구가 생길 때까지 구현하지 않는다.
- 가상화가 필요해지면 `simple-grid`를 복잡하게 만들지 말고 별도 `virtual-grid`를 검토한다.
- public API 또는 레이아웃 동작을 바꾸면 두 문서와 `preview/` 안의 모든 파일을 함께 갱신한다.
- 이 Component는 대량의 가로, 세로 스크롤링을 전제로 한다. `preview/` 내의 예제들을 작성하는데 이 점을 고려해서 Row는 50개 이상, Column은 6개 정도로 구성한다.
- Solid.js 2.0 API만 사용한다. 렌더링/반응성 규칙은 프로젝트의 `docs/Solid.md`를 따른다.
- 오픈소스와 같이 공개를 목표로 하는 것이 아니기 때문에 Component 내의 주석은 한글로 작성하고, AI가 작성한 코드의 이해를 위해 가능한 상세하게 적는다.

변경 후 다음을 실행한다.

```sh
npx prettier --check apps/app/components/simple-grid
npx eslint apps/app/components/simple-grid
npm run build:app
```

전체 type-check가 실패하면 변경한 component 오류와 기존 오류를 구분해 보고한다.
