# Solid.js 2.0 개발 요약

이 프로젝트는 개발 중인 Solid.js 2.0 베타를 사용한다. 웹 검색 결과나 Solid 1.x 문서는 현재 API와 다를 수 있으므로, 기술 판단 시 이 문서와 [Solid 2.0 베타 마이그레이션 가이드](./Solid2-beta-Migration-Guide.md)를 우선한다.

## 프로젝트 기준

- 렌더러와 JSX 타입은 `@solidjs/web`을 사용한다.
- store API는 `solid-js`에서 import한다. `solid-js/store`는 사용하지 않는다.
- TypeScript의 `jsxImportSource`는 `@solidjs/web`이다.
- 웹 렌더링은 `@solidjs/web`의 `render`와 `hydrate`를 사용한다.

```ts
import { createSignal, createStore } from 'solid-js';
import { render } from '@solidjs/web';
```

## 반응성 모델

- signal/store setter 호출은 기본적으로 마이크로태스크 단위로 배치된다. setter 뒤의 읽기 값은 즉시 갱신되지 않을 수 있다.
- 동기적으로 반영된 값이 꼭 필요한 테스트나 명령형 연동에서는 `flush()`를 사용한다.
- 컴포넌트 본문의 최상위에서 props나 signal을 읽지 않는다. JSX, `createMemo`, `createEffect` 같은 반응형 범위 안에서 읽는다.
- `createMemo`로 다른 signal/store에 쓰지 않는다. 파생 값은 memo로 유지하고, 상태 변경은 이벤트 핸들러나 `action`에서 수행한다.
- 반응형 값을 의도적으로 한 번만 읽어야 할 때만 JSX 밖에서 `untrack`을 좁게 사용한다. `/*@once*/`는 사용하지 않는다.

```tsx
function Profile(props: { name: string }) {
  // props.name을 컴포넌트 최상위 변수에 복사하지 않는다.
  return <h1>{props.name}</h1>;
}
```

## Effect와 수명 주기

`createEffect`는 계산과 적용을 분리한다. 첫 번째 함수는 의존성을 읽고 값을 계산하며, 두 번째 함수는 DOM 변경 등 부수 효과를 처리한다. cleanup은 적용 함수에서 반환한다.

```ts
createEffect(
  () => name(),
  (value) => {
    document.title = value;
    return () => {
      document.title = '';
    };
  },
);
```

- `onMount` 대신 `onSettled`를 사용한다.
- 1.x의 `on` 헬퍼는 보통 필요 없다. effect의 계산 함수에 의존성을 명시한다.
- 오류 UI에는 `ErrorBoundary` 대신 `Errored`를 사용한다. effect의 프로그래밍 방식 오류 처리는 `{ effect, error }` 형태를 사용한다.

## 비동기 데이터와 변경 작업

- `createResource` 대신 비동기 `createMemo` 또는 `createStore(fn)`을 사용하고, 최초 대기 UI는 `<Loading>`으로 감싼다.
- 최초 준비 상태에는 `<Loading>`, 진행 중인 변경 표시는 `isPending(() => expression)`을 사용한다.
- 단순 재계산은 `refresh(target)`으로 수행한다. `refresh()`만 호출하면 pending UI가 표시되지 않는다.
- 서버 변경 작업은 `action(...)`으로 감싼다. 낙관적 UI는 `createOptimistic` 또는 `createOptimisticStore`를 사용하고, 완료 뒤 `refresh(...)`로 원본 데이터와 조정한다.

```tsx
const user = createMemo(() => fetchUser(id()));

<Loading fallback={<Spinner />}>
  <Profile user={user()} />
</Loading>;
```

## Store와 props

- store 업데이트는 변경 가능한 draft를 받는 setter를 사용한다. `produce`를 감쌀 필요가 없다.
- 이전 경로 인수 문법이 필요할 때만 `storePath(...)`를 사용한다.
- 반응성이 없는 일반 객체가 필요하면 `unwrap` 대신 `snapshot(store)`을 사용한다.
- `mergeProps`는 `merge`, `splitProps`는 `omit`으로 변경되었다.
- `merge`에서 `undefined`는 무시되지 않고 실제로 덮어쓰는 값이다.
- `createMutable` / `modifyMutable` 대신 `createStore`와 draft setter를 사용한다.

```ts
const [state, setState] = createStore({ todos: [] as string[] });

setState((draft) => {
  draft.todos.push('Write docs');
});
```

## JSX와 제어 흐름

- `Suspense`는 `Loading`, `SuspenseList`는 `Reveal`, `ErrorBoundary`는 `Errored`로 바뀌었다.
- `Index`는 제거되었다. 기존 `Index` 동작에는 `<For keyed={false}>`를 사용한다. 이때 항목은 accessor이므로 `item()`으로 읽는다.
- 기본 `For`는 원시 항목을 전달한다. 동적인 boolean `keyed={condition()}`은 함수 자식의 인수 형태를 모호하게 만들므로 피한다.
- 일부 제어 흐름 컴포넌트의 함수 자식은 accessor를 받는다. 전달된 값은 필요할 때 호출해 읽는다.
- 동적 컴포넌트에는 `dynamic(source)` factory를 사용하거나 `<Dynamic>`을 사용한다.

```tsx
<For each={items()} keyed={false}>
  {(item, index) => <Row item={item()} index={index} />}
</For>
```

## DOM, 이벤트, directive

- HTML attribute는 기본적으로 attribute로 처리된다. boolean attribute는 `true`이면 추가되고 `false`이면 제거된다.
- `attr:`, `bool:`, `on:`, `oncapture:` 네임스페이스는 사용하지 않는다.
- Solid가 관리하는 이벤트에는 `onClick`처럼 camelCase 이벤트 prop을 사용한다.
- 네이티브 이벤트 옵션이 필요하면 `ref` 콜백에서 `addEventListener`를 호출한다.
- `use:` directive 대신 `ref` directive factory를 사용한다. 여러 directive는 ref 배열로 전달할 수 있다.
- `classList` 대신 `class`의 배열/객체 형태를 사용한다.

```tsx
<button ref={tooltip({ content: "Save" })} onClick={save}>
  Save
</button>

<div class={["card", { active: isActive() }]} />
```

## Context

- `Context.Provider` 대신 context 자체를 provider 컴포넌트로 사용한다.
- 기본값 없이 만든 context의 `useContext`는 `T`를 반환하며, provider가 없으면 `ContextNotFoundError`를 던진다.
- 반응형 상태를 담는 context에는 기본값 없는 `createContext<T>()`를 사용한다. theme, locale처럼 단순 fallback이 필요한 값에만 기본값을 제공한다.

```tsx
const Theme = createContext('light');

<Theme value="dark">{props.children}</Theme>;
```

## 주요 이름 변경과 제거

| 1.x                         | Solid 2.0                                                       |
| --------------------------- | --------------------------------------------------------------- |
| `solid-js/web`              | `@solidjs/web`                                                  |
| `solid-js/store`            | `solid-js`                                                      |
| `solid-js/h`                | `@solidjs/h`                                                    |
| `solid-js/html`             | `@solidjs/html`                                                 |
| `solid-js/universal`        | `@solidjs/universal`                                            |
| `Suspense`                  | `Loading`                                                       |
| `SuspenseList`              | `Reveal`                                                        |
| `ErrorBoundary`             | `Errored`                                                       |
| `onMount`                   | `onSettled`                                                     |
| `unwrap`                    | `snapshot`                                                      |
| `mergeProps` / `splitProps` | `merge` / `omit`                                                |
| `classList`                 | `class` 객체/배열 형태                                          |
| `use:` directive            | `ref` directive factory                                         |
| `batch`                     | 기본 배치, 필요 시 `flush()`                                    |
| `createComputed`            | `createMemo`, 분리된 `createEffect`, 또는 함수형 `createSignal` |
| `createResource`            | 비동기 계산 + `Loading`                                         |
| `createMutable`             | `createStore` + draft setter                                    |

새 API와 상세 예제, 제거된 API의 전체 목록은 [Solid 2.0 베타 마이그레이션 가이드](./Solid2-beta-Migration-Guide.md)를 참고한다.
