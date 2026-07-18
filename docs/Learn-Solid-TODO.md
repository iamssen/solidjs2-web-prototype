# 학습이 필요한 Solid.js 기능들

## Solid.js 기본 기능 학습

- [x] `ComponentProps<HtmlDivElement>`와 같이 Html type 결합 방법
- [ ] `createMemo`로 파생 상태를 표현하는 방법과 React dependency array와의 차이
- [ ] `createEffect(compute, apply)`, `onSettled`, cleanup을 이용한 side effect 처리
- [ ] reactive scope에서의 read/write 제약과 props 객체를 유지하는 컴포넌트 작성 방식
- [ ] context 생성·소비와 Solid 2.0 provider 문법
- [ ] `<Loading>`, `<Errored>`, `isPending`을 이용한 비동기 UI 상태 설계
- [ ] `<For>`와 조건부 렌더링 등 Solid 제어 흐름과 list key/index 의미
- [ ] `<Dynamic>`/`dynamic()` 및 children·slot·`Element` 모델
- [ ] DOM attribute/boolean attribute, 이벤트, `ref` directive와 native event listener 처리

## React 라이브러리 대응

- [ ] `@tanstack/react-query` -> `@tanstack/solid-query`
- [x] `react-router` -> `@solidjs/router`
- [x] `react-data-grid` -> `simple-grid`
- [ ] `react-icons` -> `solid-icons`
- [ ] `react-responsive`
- [ ] `react-markdown`
