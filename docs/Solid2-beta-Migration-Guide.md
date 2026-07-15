# Solid 2.0 (베타) 빠른 마이그레이션 가이드

> 원문: [Solid 2.0 (beta) — quick migration guide](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/MIGRATION.md)  
> 이 문서는 Solid 1.x에서 Solid 2.0 베타 API로 이전하기 위한 원문의 한국어 번역입니다. Solid 2.0은 베타 버전이므로 API와 동작이 바뀔 수 있습니다.

Solid 1.x에서 Solid 2.0 API로 이전할 때 참고할 실용적인 안내서입니다. 자주 마주치는 변경 사항과 이전/이후 예시를 다룹니다.

## 빠른 점검 목록(여기서 시작하세요)

- **Import**: 일부 1.x 하위 경로 import가 `@solidjs/*` 패키지로 옮겨졌고, store 헬퍼는 `solid-js`로 이동했습니다.
- **JSX 타입**: 웹 프로젝트는 `jsxImportSource`를 `@solidjs/web`으로 설정해야 합니다. `solid-js`는 더 이상 JSX 런타임 타입을 소유하지 않습니다.
- **배치 및 읽기**: setter를 호출해도 읽기 결과가 즉시 바뀌지 않습니다. 값은 마이크로태스크 배치가 flush된 뒤(또는 `flush()` 호출 뒤) 표시됩니다.
- **Effect**: `createEffect`는 계산(compute)과 적용(apply) 단계로 분리됩니다. 정리는 보통 cleanup 함수를 반환하는 방식으로 처리합니다.
- **수명 주기**: `onMount`는 `onSettled`로 대체되며, cleanup도 반환할 수 있습니다.
- **비동기 UI**: 최초 준비 상태에는 `<Loading>`을 사용합니다. 변경 진행 중 표시에는 `isPending(() => expr)`을 사용합니다. 입력 기반 재요청 및 `affects()` 선언은 표시되지만, `refresh()`만 단독으로 호출하면 조용히 재계산됩니다.
- **목록**: `Index`가 제거되었습니다. `<For keyed={false}>`를 사용하세요. 기본 `For`는 원시 항목을 전달하고, `keyed={false}`는 항목 accessor와 안정적인 숫자 인덱스를 전달합니다.
- **Store**: draft 우선 setter를 권장합니다. 이전 경로 인수 스타일은 선택 사항인 `storePath(...)`로 사용할 수 있습니다.
- **일반 값**: 반응성이 없는 일반 값이 필요할 때는 `unwrap(store)` 대신 `snapshot(store)`을 사용합니다.
- **DOM**: `/*@once*/`와 `use:` directive는 공개 JSX 모델에서 제거되었습니다. 일반 반응형 JSX를 사용하고, 의도적으로 한 번만 JavaScript에서 읽을 때는 `untrack`, directive에는 `ref` directive factory(배열 ref 포함)를 사용합니다. 이전에 허용되던 `class:` / `style:` 네임스페이스 문법은 더 이상 특별하게 처리되지 않으므로 `class` / `style` 객체 값을 사용하세요.
- **헬퍼**: `mergeProps`는 `merge`로, `splitProps`는 `omit`으로 변경되었습니다.

## 핵심 동작 변경 사항

### Import: API의 새 위치

Solid 2.0 베타에서는 DOM/웹 런타임이 별도 패키지이며, 1.x의 일부 하위 경로 import가 사라졌습니다.

```ts
// 1.x (DOM 런타임)
import { render, hydrate } from 'solid-js/web';

// 2.0 베타
import { render, hydrate } from '@solidjs/web';

// 1.x (store)
import { createStore } from 'solid-js/store';

// 2.0 베타 (store API는 solid-js에서 내보냄)
import { createStore, reconcile, snapshot, storePath } from 'solid-js';

// 1.x (hyperscript / 대체 JSX factory)
import h from 'solid-js/h';

// 2.0 베타
import h from '@solidjs/h';

// 1.x (태그 템플릿 HTML)
import html from 'solid-js/html';

// 2.0 베타
import html from '@solidjs/html';

// 1.x (사용자 지정 렌더러)
import { createRenderer } from 'solid-js/universal';

// 2.0 베타
import { createRenderer } from '@solidjs/universal';
```

### TypeScript JSX: `solid-js` → 렌더러 패키지

2.0에서 `solid-js`는 JSX 네임스페이스나 `jsx-runtime` 타입 엔트리를 내보내지 않습니다. core 패키지는 렌더러 중립적인 컴포넌트 타입을, 렌더러 패키지는 JSX 타입을 담당합니다.

웹 앱에서는 `tsconfig.json`을 다음과 같이 갱신하세요.

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@solidjs/web"
  }
}
```

기존에 `"jsxImportSource": "solid-js"`를 사용했거나 `solid-js/jsx-runtime`을 import했다면 `@solidjs/web`으로 전환합니다.

```ts
// 1.x / 이전 베타
import type { JSX, ComponentProps } from 'solid-js';

// 2.0 베타
import type { JSX, ComponentProps } from '@solidjs/web';
```

렌더러 중립적인 컴포넌트 API에는 `JSX.Element` 대신 `solid-js`의 `Element`를 사용하세요.

```ts
import type { Component, Element } from 'solid-js';

type Wrapper = Component<{ children?: Element }>;
```

hyperscript JSX에는 `jsxImportSource`를 `@solidjs/h`로 설정합니다. 사용자 지정 렌더러는 자체 `jsx-runtime`, `jsx-dev-runtime` 타입 엔트리를 제공해야 합니다. 자세한 설계는 [RFC 09 — TypeScript and JSX ownership](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/rfcs/09-typescript-and-jsx-ownership.md)을 참고하세요.

### 배치 및 읽기: flush 뒤에 값이 갱신됨

Solid 2.0에서는 업데이트가 기본적으로 마이크로태스크 단위로 배치됩니다. 중요한 차이점은 setter가 읽기 결과를 즉시 갱신하지 않는다는 것입니다. 새 값은 다음 마이크로태스크에서 배치가 flush될 때 보이거나 `flush()` 호출 뒤 즉시 보입니다.

```ts
const [count, setCount] = createSignal(0);

setCount(1);
count(); // 아직 0

flush();
count(); // 이제 1
```

`flush()`는 신중히 사용하세요. 시스템을 즉시 최신 상태로 만들기 때문입니다. 테스트나 명령형 코드에서 동기적으로 안정된 상태가 꼭 필요한 드문 경우에 가장 유용합니다.

### Effect, 수명 주기, 정리

Solid 2.0의 effect는 두 단계로 나뉩니다.

- 반응성 추적 단계에서 실행되어 값을 반환하는 **계산 함수**
- 그 값을 받아 부수 효과를 수행하고 cleanup을 반환할 수 있는 **적용 함수**

```ts
// 1.x (단일 함수 effect)
createEffect(() => {
  el().title = name();
});

// 2.0 (분리된 effect: 계산 -> 적용)
createEffect(
  () => name(),
  (value) => {
    el().title = value;
  },
);
```

1.x의 `initialValue` 매개변수는 제거되었습니다. 2.0에서는 계산 함수가 `prev`를 받으며, 첫 실행 시 그 값은 `undefined`입니다. 기본값이 필요하다면 기본 매개변수를 사용하세요.

```ts
// 1.x (두 번째 인수가 initialValue)
createEffect((prev) => {
  console.log('changed from', prev, 'to', count());
  return count();
}, 0);

// 2.0 (prev의 기본 매개변수, 두 번째 인수는 적용 함수)
createEffect(
  (prev = 0) => count(),
  (value, prev) => {
    console.log('changed from', prev, 'to', value);
  },
);
```

같은 변경이 `createMemo`에도 적용됩니다. 두 번째 인수는 이제 초기값이 아니라 `options`입니다.

```ts
// 1.x
const doubled = createMemo((prev) => count() * 2, 0);

// 2.0 (initialValue 인수 없음, 첫 실행에서 prev는 undefined)
const doubled = createMemo(() => count() * 2);
```

이제 cleanup은 보통 적용 단계에 둡니다.

```ts
// 1.x
createEffect(() => {
  const id = setInterval(() => console.log(name()), 1000);
  onCleanup(() => clearInterval(id));
});

// 2.0
createEffect(
  () => name(),
  (value) => {
    const id = setInterval(() => console.log(value), 1000);
    return () => clearInterval(id);
  },
);
```

`onMount`를 사용했다면 가장 가까운 대체 API는 `onSettled`이며, 이 API도 cleanup을 반환할 수 있습니다.

```ts
// 1.x
onMount(() => {
  measureLayout();
});

// 2.0
onSettled(() => {
  measureLayout();
  const onResize = () => measureLayout();
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
});
```

### 자주 보게 될 개발 경고와 해결 방법

다음은 버그를 더 일찍 발견하기 위한 개발 전용 진단입니다. 일부는 콘솔 경고이고, 일부는 예외를 던집니다. 전체 목록은 [RFC 08](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/rfcs/08-debug-and-safety.md)을 참고하세요.

#### 컴포넌트의 “최상위 반응형 읽기”

2.0에서는 props 구조 분해를 포함해 컴포넌트 본문의 최상위에서 반응형 값을 읽으면 경고가 발생합니다. 보통 읽기를 `createMemo`/`createEffect` 같은 반응형 범위로 옮기거나, `untrack`으로 의도를 명시하면 됩니다.

```tsx
// ❌ 2.0에서 경고 (최상위 반응형 읽기)
function Bad(props) {
  const n = props.count;
  return <div>{n}</div>;
}

// ✅ JSX/표현식 안에서 읽기
function Ok(props) {
  return <div>{props.count}</div>;
}

// ❌ 2.0에서 경고 (흔한 사례: 인수에서 구조 분해)
function BadArgs({ title }) {
  return <h1>{title}</h1>;
}

// ✅ props 객체를 유지하거나 memo/effect 안에서 구조 분해
function OkArgs(props) {
  return <h1>{props.title}</h1>;
}
```

#### “반응형 범위 내부 쓰기”(소유 범위)

개발 환경에서 반응형 범위 내부의 signal/store 쓰기는 예외를 던집니다. 일반적으로 다음 중 하나를 사용해야 합니다.

- `createMemo`로 값을 파생합니다(역방향 쓰기 없음).
- 이벤트 핸들러 또는 action에서 씁니다.
- 추적 중에 쓰는 대신 effect의 적용 함수에서 cleanup을 반환합니다.

```ts
// ❌ 예외 발생: memo 내부에서 쓰기
createMemo(() => setDoubled(count() * 2));

// ✅ 쓰기 대신 파생
const doubled = createMemo(() => count() * 2);
```

소유 범위 안에서 써야 하는 내부 signal(앱 상태가 아님)이 꼭 있다면 `ownedWrite: true`로 좁은 범위에서 opt-in합니다.

### `/*@once*/` JSX 마커

`/*@once*/` JSX 컴파일러 마커는 더 이상 Solid의 공개 JSX 모델에 포함되지 않습니다. 이를 JSX용 `untrack`으로 취급하거나 마커 기반 대체물을 찾지 마세요.

대부분은 일반 반응형 JSX로 바꾸면 됩니다. 값이 갱신되어야 한다면 JSX나 다른 반응형 범위에서 그대로 읽으세요.

```tsx
// 1.x
<Component value={/*@once*/ props.value} />

// 2.0: 반응형 값은 반응형으로 유지
<Component value={props.value} />
```

DOM의 초기/기본 상태에는 반응형 값을 고정하는 대신 플랫폼의 기본 prop을 사용합니다.

```tsx
// 1.x
<input value={/*@once*/ props.initialValue} />

// 2.0
<input defaultValue={props.initialValue} />
```

기존의 “이 값을 한 번만 읽기” 동작이 정말 필요하다면 JSX 밖 JavaScript에서 `untrack`을 사용합니다.

```ts
const value = untrack(() => props.value);
```

이 코드는 좁은 범위에서만 사용하세요. 반응형 값의 업데이트를 막기 위한 일반적인 방법이 아닙니다.

## 비동기 데이터와 전환

### `Suspense` / `ErrorBoundary` → `Loading` / `Errored`

```tsx
// 1.x
<Suspense fallback={<Spinner />}>
  <Profile />
</Suspense>

// 2.0
<Loading fallback={<Spinner />}>
  <Profile />
</Loading>
```

### `createResource` → 비동기 계산 + `Loading`

기본 패턴은 `createResource`를 비동기 `createMemo`(컬렉션에는 `createStore(fn)`)로 대체하고 소비자를 `Loading`으로 감싸는 것입니다.

```tsx
// 1.x
const [user] = createResource(id, fetchUser);

// 2.0
const user = createMemo(() => fetchUser(id()));

<Loading fallback={<Spinner />}>
  <Profile user={user()} />
</Loading>;
```

Resource tuple 기능은 독립 API로 매핑됩니다.

| 1.x resource 기능  | 2.0 대체 API                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resource.loading` | 최초에는 `Loading`, 입력 변경 중에는 `isPending(() => resource())`; 단독 `refresh()`는 조용합니다. 재요청 상태를 표시하려면 `affects(resource); refresh(resource)` 또는 함께 작성한 optimistic 플래그를 사용하세요. |
| `resource.error`   | `Errored` 경계 또는 effect의 `error` 옵션                                                                                                                                                                           |
| `refetch()`        | `refresh(resource)`                                                                                                                                                                                                 |
| `mutate()`         | `createOptimisticStore` + `action`                                                                                                                                                                                  |

각 패턴의 자세한 이전/이후 예시는 [RFC 05 — createResource migration](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/rfcs/05-create-resource-migration.md)을 참고하세요.

### 최초 로딩과 진행 중 변경: `Loading` vs `isPending`

- `Loading`: 최초로 “아직 준비되지 않음”을 나타내는 UI 경계입니다.
- `isPending(fn)`: `fn` 안의 정확한 표현식에서 공개되지 않은 변경이 진행 중인지 나타냅니다. 입력이 바뀌었거나 진행 중 작업이 `affects`로 선언했다면 `true`입니다. 같은 입력에 대해 단순 `refresh()`/poll만 하면 조용합니다. 표현식이 아직 준비되지 않을 수 있다면 최초 fallback UI를 담당할 `Loading` 경계 내부에 두세요. 준비되지 않을 수 없는 상위 상태만 읽는다면 경계 밖에 둘 수 있습니다.

```tsx
const listPending = () => isPending(() => users() || posts());

<Loading fallback={<Spinner />}>
  <Show when={listPending()}>
    {/* 새 쿼리 로딩 중의 작은 “업데이트 중…” 표시 */}
  </Show>
  <List users={users()} posts={posts()} />
</Loading>;
```

### 진행 중 값 미리 보기: `latest(fn)`

```ts
const latestId = () => latest(id);
```

### “다시 가져오기/새로 고침” 패턴 → `refresh()`

```ts
// 서버 쓰기 뒤, 파생 읽기를 명시적으로 재계산합니다.
refresh(storeOrProjection);
```

### 변경 작업: `action(...)` + optimistic 헬퍼

1.x에서는 변경 작업이 흔히 “비동기 함수 호출, 플래그 전환, 수동 재요청” 형태였습니다. 2.0에서는 다음 형태를 권장합니다.

- 변경 작업을 `action(...)`으로 감쌉니다.
- optimistic UI에는 `createOptimistic` / `createOptimisticStore`를 사용합니다.
- 마지막에 `refresh(...)`로 파생 읽기를 진실 공급원과 조정합니다.

```ts
const [todos] = createStore(() => api.getTodos(), { list: [] });
const [optimisticTodos, setOptimisticTodos] = createOptimisticStore({
  list: [],
});

const addTodo = action(function* (todo) {
  // optimistic UI
  setOptimisticTodos((s) => s.list.push(todo));

  // 서버 쓰기
  yield api.addTodo(todo);

  // 진실 공급원에서 파생한 읽기를 재계산
  refresh(todos);
});
```

## Store

### Draft 우선 setter(`storePath`는 선택적 헬퍼)

```ts
// 2.0 권장: produce 스타일 draft 업데이트
setStore((s) => {
  s.user.address.city = 'Paris';
});

// 선택적 호환성: storePath로 이전의 경로 인수 사용 방식 유지
setStore(storePath('user', 'address', 'city', 'Paris'));
```

### `unwrap(store)` → `snapshot(store)`

```ts
const plain = snapshot(store);
JSON.stringify(plain);
```

### `mergeProps` / `splitProps` → `merge` / `omit`

```ts
// 1.x
const merged = mergeProps(defaults, overrides);

// 2.0
const merged = merge(defaults, overrides);
```

동작상 주의점: `undefined`는 “이 키 건너뛰기”가 아니라 덮어쓰는 실제 값으로 처리됩니다.

```ts
const merged = merge({ a: 1, b: 2 }, { b: undefined });
// merged.b는 undefined

// 1.x
const [local, rest] = splitProps(props, ['class', 'style']);

// 2.0
const rest = omit(props, 'class', 'style');
```

### 새 함수 형태: `createSignal(fn)`과 `createStore(fn)`

`createSignal(fn)`은 쓰기 가능한 파생 signal(“쓰기 가능한 memo”로 생각할 수 있음)을 만듭니다.

```ts
const [count, setCount] = createSignal(0);
const [doubled] = createSignal(() => count() * 2);
```

`createStore(fn, seed)`은 익숙한 `createStore` API로 파생 store를 만듭니다.

```ts
const [items] = createStore(() => api.listItems(), []);
const [cache] = createStore(
  (draft) => {
    draft.total = items().length;
  },
  { total: 0 },
);
```

## 제어 흐름

### 목록 렌더링: `Index` 제거, 모든 키 지정 모드를 처리하는 `For`

`Index`를 사용했다면 `keyed={false}`인 `For`로 바꿉니다.

키 지정 모드에 따라 콜백의 형태가 달라집니다.

- 기본 `For` / `keyed={true}`는 원시 항목과 인덱스 accessor `(item, i)`를 받습니다.
- `keyed={false}`는 항목 accessor와 안정적인 숫자 인덱스 `(item, i)`를 받습니다. `Index`의 직접 대체물입니다.
- `keyed={(item) => key}`는 항목과 인덱스 accessor를 받습니다.

```tsx
// 1.x
<Index each={items()}>
  {(item, i) => <Row item={item()} index={i} />}
</Index>

// 2.0
<For each={items()} keyed={false}>
  {(item, i) => <Row item={item()} index={i} />}
</For>
```

함수 자식에는 리터럴 `keyed` 모드를 권장합니다. `keyed={condition()}`처럼 동적인 boolean을 사용하면 콜백 형태가 모호해집니다.

### 함수 자식은 accessor를 받을 수 있음

일부 제어 흐름 API는 값이 항상 안전하게 읽히도록 함수 자식에 accessor를 전달합니다. 특히 `Index`를 `For keyed={false}`로 이전할 때 중요합니다.

```tsx
<Show when={user()} fallback={<Login />}>
  {u => <Profile user={u()} />}
</Show>

<Switch>
  <Match when={route() === "profile"}>{() => <Profile />}</Match>
</Switch>
```

### 동적 컴포넌트: `createDynamic` → `dynamic` factory

`createDynamic(source, props): JSX.Element`는 lazy 스타일 factory인 `dynamic(source): Component<P>`로 대체됩니다. factory는 반응형(선택적으로 비동기) source가 정하는 안정적인 컴포넌트를 반환합니다. 자식, ref, 반응형 props는 일반 JSX 경로를 통해 전달되므로 반환값을 컴포넌트가 쓰이는 모든 곳에서 사용할 수 있습니다.

```tsx
// 1.x 스타일
import { Dynamic } from 'solid-js/web';
<Dynamic component={isEditing() ? Editor : Viewer} value={value()} />;

// 2.0: 호출부의 <Dynamic>은 그대로이며 내부적으로 dynamic()에 위임합니다.
import { Dynamic } from '@solidjs/web';
<Dynamic component={isEditing() ? Editor : Viewer} value={value()} />;

// 2.0: 안정된 컴포넌트 참조가 필요하면 권장되는 새 factory 형태
import { dynamic } from '@solidjs/web';
const Active = dynamic(() => (isEditing() ? Editor : Viewer));
return <Active value={value()} />;
```

비동기 source는 일반 `NotReadyError` 흐름을 통해 `Loading`/Suspense와 조합됩니다. 사용자 코드에 wrapper primitive나 `await`가 필요하지 않습니다.

`<Dynamic component={...}>`는 여전히 사용자 대상 API로 그대로 존재하며, 현재는 `dynamic`을 얇게 감싼 wrapper입니다. 이전 `createDynamic(source, props)`를 직접 호출했다면 `<Dynamic>`을 사용하거나 `createComponent(dynamic(source), props)`로 직접 조합하세요.

### 로딩 경계 조정: `SuspenseList` → `Reveal`

`SuspenseList`는 형제 `Loading` 경계를 조정하는 `Reveal`로 대체됩니다.

정렬은 단일 `order` prop으로 제어합니다. 값은 `"sequential"`(기본값, `revealOrder="forwards"`와 동일), `"together"`(`revealOrder="together"`와 동일), `"natural"`(2.0의 새 기능: 그룹 내 순서 없음)입니다. 별도의 `collapsed` boolean은 이전 `tail="collapsed"`를 대체합니다. `order="sequential"`일 때만 적용되며 그 외에는 무시됩니다.

```tsx
// 1.x
<SuspenseList revealOrder="forwards">
  <Suspense fallback={<Skeleton />}><ProfileHeader /></Suspense>
  <Suspense fallback={<Skeleton />}><Posts /></Suspense>
</SuspenseList>

// 2.0: 기본 순차 정렬
<Reveal>
  <Loading fallback={<Skeleton />}><ProfileHeader /></Loading>
  <Loading fallback={<Skeleton />}><Posts /></Loading>
</Reveal>

// 2.0: 전체 그룹을 한 번에 표시
<Reveal order="together">
  <Loading fallback={<Skeleton />}><ProfileHeader /></Loading>
  <Loading fallback={<Skeleton />}><Posts /></Loading>
</Reveal>

// 2.0: 자신의 슬롯 안에서 독립적으로 표시되는 중첩 natural 그룹
<Reveal>
  <Loading fallback={<Skeleton />}><Header /></Loading>
  <Reveal order="natural">
    {/* 바깥 경계가 이 슬롯에 도달할 때까지 fallback에 머뭅니다.
        해제된 뒤에는 각 카드가 자신의 데이터 준비에 맞춰 표시됩니다. */}
    <Loading fallback={<CardSkel />}><Card id={1} /></Loading>
    <Loading fallback={<CardSkel />}><Card id={2} /></Loading>
  </Reveal>
</Reveal>
```

> 참고: 이전 2.0 베타의 `Reveal`에는 boolean `together` prop이 있었습니다. 이 prop은 `order="together"`로 대체되었습니다. `collapsed`는 여전히 존재하지만 순차 모드 전용이며 `order="together"` 또는 `order="natural"`에서는 아무 효과가 없습니다.

중첩 의미론, 바깥/안쪽 정렬 매트릭스, SSR 주의 사항은 [Control flow → Reveal](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/03-control-flow.md#reveal-timing-reveal)을 참고하세요.

## DOM

### 속성과 이벤트: HTML에 더 가깝게, 네임스페이스는 더 적게

Solid 2.0은 “작성한 것이 곧 플랫폼이 보는 것”에 더 가까워지는 것을 목표로 합니다.

- 내장 속성은 마법처럼 property로 매핑되지 않고 **attribute**로 처리되며, 일반적으로 소문자입니다.
- boolean attribute는 존재/부재로 표현됩니다. (`muted={true}`는 추가, `muted={false}`는 제거)
- `attr:`, `bool:`, `on:` 네임스페이스가 제거되었습니다. 보통 필요하지 않습니다.

```tsx
<video muted={true} />
<video muted={false} />
// 플랫폼이 실제로 문자열을 요구한다면:
<some-element enabled="true" />
```

`on:`과 `oncapture:`가 제거되었습니다. Solid가 관리하는 이벤트에는 계속 `onClick` 같은 camelCase 이벤트 핸들러를 사용하세요. 네이티브 리스너 옵션에는 ref 콜백을 사용합니다.

```tsx
const on = (type, handler, options) => (el) =>
  el.addEventListener(type, handler, options);

<button ref={on('click', handleClick, { capture: true })} />;
```

위임 이벤트는 이제 render root가 소유합니다. `render()`와 `hydrate()`가 root 컨테이너에 위임 리스너를 설치하고 root가 dispose될 때 정리합니다. 컴파일러가 생성하는 `delegateEvents([...])`는 필요한 이벤트 이름만 선언합니다. 이는 이전의 document 전역 정리 모델을 대체합니다.

대부분의 앱에서는 자동으로 처리됩니다. 차이가 보이는 경우는 중첩 root, portal, 웹 컴포넌트 호스트입니다.

- 중첩 Solid root는 더 이상 서로의 root 경계를 넘는 위임 핸들러를 합성하지 않습니다.
- `ShadowRoot`에 렌더링하면 위임 핸들러의 범위가 해당 shadow root로 제한되어 웹 컴포넌트에 더 친화적입니다.
- `Portal`은 root 외부 mount 지점을 소유 render root의 리스너 컨테이너로 등록하므로 portal 이벤트가 논리적인 Solid 트리를 따라 버블링합니다. 이미 root 안에 있는 portal mount는 추가 리스너를 설치하지 않습니다.
- `clearDelegatedEvents()`를 호출하고 있었다면 제거하세요. 대신 render root를 dispose합니다.

### Directive: `use:` → `ref` directive factory(2단계 패턴)

```tsx
// 1.x
<button use:tooltip={{ content: "Save" }} />

// 2.0
<button ref={tooltip({ content: "Save" })} />
<button ref={[autofocus, tooltip({ content: "Save" })]} />
```

두 단계 directive factory(소유된 설정 → 소유되지 않은 적용)를 권장합니다.

```ts
function titleDirective(source) {
  // 설정 단계(소유됨): 여기에서 primitive/subscription을 생성합니다.
  // 최상위에서 명령형 DOM 변경을 하지 마세요.
  let el;
  createEffect(source, (value) => {
    if (el) el.title = value;
  });

  // 적용 단계(소유되지 않음): 여기에서 DOM을 씁니다.
  // 이 콜백에서 새 primitive를 만들면 안 됩니다.
  return (nextEl) => {
    el = nextEl;
  };
}
```

### `classList` → `class`(객체/배열 형태)

```tsx
// 1.x
<div class="card" classList={{ active: isActive(), disabled: isDisabled() }} />

// 2.0
<div class={["card", { active: isActive(), disabled: isDisabled() }]} />
```

## Context

### Context provider: `Context.Provider` → “context 자체가 provider”

```tsx
// 1.x
const Theme = createContext('light');
<Theme.Provider value="dark">{props.children}</Theme.Provider>;

// 2.0
const Theme = createContext('light');
<Theme value="dark">{props.children}</Theme>;
```

### 기본값 없는 context의 `useContext`는 `T | undefined`가 아닌 `T`를 반환

기본값이 없는 `createContext<T>()`는 이제 `Context<T>`로 타입이 지정됩니다. `useContext`는 `T`를 직접 반환하며, Provider가 mount되지 않았다면 런타임에 `ContextNotFoundError`를 던집니다. 타입을 좁히기 위해서만 있던 `useX`-with-throw wrapper hook은 제거하세요.

```ts
// 1.x: T | undefined를 T로 좁히기 위한 wrapper
const TodosContext = createContext<TodosCtx>();
const useTodos = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('missing TodosContext.Provider');
  return ctx;
};

// 2.0: 직접 호출. 타입은 TodosCtx이며 Provider가 없으면 예외 발생.
const TodosContext = createContext<TodosCtx>();
const [todos, { addTodo }] = useContext(TodosContext);
```

기본값 형태인 `createContext<T>(defaultValue)`는 변하지 않았습니다. Provider 밖에서 `useContext`는 `defaultValue`로 대체됩니다. theme, locale, 고정 설정처럼 원시값 fallback에 사용하고, 반응형 상태를 담는 context에는 기본값 없는 형태를 사용하세요.

기본값 없는 context에서 `useContext(ctx)`가 `undefined`를 반환하는 동작에 실제로 의존했다면 `createContext`에 명시적 기본값을 전달하거나 호출을 try/catch로 감싸세요. 기존 wrapper hook 대부분은 이미 `undefined`에서 예외를 던졌으므로, 이 경우는 마이그레이션보다 wrapper 제거에 가깝습니다.

## 2.0의 새 기능

다음 API는 1.x API의 이름 변경이 아니라 새로 추가된 기능입니다.

- **`Reveal`**: `order` prop(`"sequential"` | `"together"` | `"natural"`)과 순차 전용 `collapsed` 플래그로 형제 `Loading` 경계의 표시 시점을 조정합니다. `SuspenseList`를 대체합니다. 새 `order="natural"`에서는 중첩 그룹이 부모 정렬에서 하나의 복합 슬롯으로 참여하고, 부모가 그 슬롯을 해제하면 내부 자식은 각각 자신의 데이터에 맞춰 독립적으로 표시됩니다.
- **`Repeat`**: diffing 없이 개수/범위 기반으로 목록을 렌더링합니다(스켈레톤, 윈도잉).
- **`action(fn)`**: generator/async generator 변경 작업을 전환 조정과 함께 감쌉니다.
- **`createOptimistic` / `createOptimisticStore`**: 전환이 끝나면 쓰기가 되돌아가는 signal/store primitive입니다.
- **`createProjection(fn, seed)`**: 반응형 조정을 지원하는 파생 store입니다.
- **`isPending(fn)`**: 표현식 수준에서 공개되지 않은 변경 진행 여부를 확인합니다.
- **`latest(fn)`**: 전환 중 진행 중인 값을 미리 봅니다.
- **`refresh(target)`**: 파생 읽기를 명시적으로 재계산/무효화합니다. pending 상태로 만들지 않는 조용한 재요청입니다.
- **`affects(target, ...keys)`**: 진행 중 작업이 대상 데이터를 바꾼다고 선언합니다. 명명한 슬롯은 트랜잭션이 완료될 때까지 pending으로 읽힙니다.
- **`resolve(fn)`**: 반응형 표현식이 안정화되면 resolve되는 Promise를 반환합니다.
- **`Loading`의 `on` prop**: 재검증 중 `Loading` 경계가 fallback을 다시 보일 시점을 제어합니다.
- **`deep(store)`**: store의 깊은 관찰을 수행하여 중첩 변경을 모두 추적합니다.
- **`reconcile(value, key)`**: 새 데이터로 store를 갱신하는 diffing 함수입니다.
- **함수형 `createSignal(fn)` / `createStore(fn)`**: 파생된(쓰기 가능한) primitive입니다.
- **Effect `EffectBundle`**: `createEffect`가 구조화된 오류 처리를 위해 `{ effect, error }`를 받을 수 있습니다.
- **`createMemo`의 `lazy` 옵션**: 첫 읽기까지 최초 계산을 미루며, subscriber 수가 0이 되면 memo가 자동 dispose되도록 합니다. lazy가 아닌 소유된 memo는 owner의 수명 동안 유지됩니다.
- **`unobserved` 콜백**: signal/memo가 모든 subscriber를 잃었을 때 호출됩니다(리소스 정리).
- **`dynamic(source)` factory**: 반응형(선택적으로 비동기) source가 정하는 안정적인 컴포넌트를 반환하는 lazy 스타일 factory입니다. `<Dynamic>` JSX wrapper의 기반입니다.

## 제거된 API 상세 안내

다음 제거 사항은 한 줄 설명보다 더 많은 맥락이 필요합니다. 단순 이름 변경은 아래의 빠른 매핑을 참고하세요.

### `batch` → 기본 마이크로태스크 배치 + `flush()`

1.x에서 `batch`는 중간 렌더링을 피하기 위해 여러 쓰기를 감싸는 명시적 API였습니다. 2.0에서는 모든 쓰기가 기본적으로 마이크로태스크 단위로 배치됩니다. 감쌀 필요가 없습니다. 테스트나 명령형 연동처럼 동기 적용을 강제해야 한다면 `flush()`를 사용하세요.

```ts
// 1.x
batch(() => {
  setA(1);
  setB(2);
});

// 2.0: 그냥 쓰면 자동 배치됨
setA(1);
setB(2);

// 동기적으로 지금 적용해야 한다면:
setA(1);
setB(2);
flush();
```

### `createComputed` → `createMemo`, `createEffect`, 또는 파생 `createSignal`

`createComputed`는 서로 다른 세 가지 패턴에 쓰였습니다. 대체 방법은 용도에 따라 다릅니다.

읽기 전용 파생에는 `createMemo`를 사용합니다.

```ts
// 1.x
createComputed(() => setDoubled(count() * 2));

// 2.0
const doubled = createMemo(() => count() * 2);
```

변경 시 부수 효과에는 분리된 `createEffect`를 사용합니다.

```ts
// 1.x
createComputed(() => {
  const val = input();
  localStorage.setItem('input', val);
});

// 2.0
createEffect(
  () => input(),
  (val) => localStorage.setItem('input', val),
);
```

쓰기 가능한 파생 값(계산 결과에 setter도 있는 경우)에는 함수형 `createSignal`을 사용합니다.

```ts
// 1.x
const [value, setValue] = createSignal(props.initial);
createComputed(() => setValue(props.initial));

// 2.0
const [value, setValue] = createSignal(() => props.initial);
```

### `on` 헬퍼 → 분리된 effect

`on`은 effect 본문과 분리하여 명시적 의존성을 선언하기 위한 API였습니다. 분리된 effect에서는 계산 단계 자체가 명시적 의존성 선언이므로 더 이상 필요하지 않습니다.

```ts
// 1.x
createEffect(
  on(count, (value, prev) => {
    console.log('changed from', prev, 'to', value);
  }),
);

// 2.0: 계산 단계가 의존성을 선언하고, 적용 단계가 부수 효과를 수행
createEffect(
  () => count(),
  (value, prev) => {
    console.log('changed from', prev, 'to', value);
  },
);

// 1.x: 여러 의존성
createEffect(
  on([a, b], ([a, b]) => {
    console.log(a, b);
  }),
);

// 2.0
createEffect(
  () => [a(), b()],
  ([a, b]) => console.log(a, b),
);
```

`on`에는 최초 실행을 건너뛰는 `defer` 옵션도 있었습니다. 2.0에서는 `createEffect`가 이를 직접 지원합니다.

```ts
// 1.x
createEffect(
  on(
    count,
    (value) => {
      console.log('changed to', value);
    },
    { defer: true },
  ),
);

// 2.0
createEffect(
  count,
  (value) => {
    console.log('changed to', value);
  },
  { defer: true },
);
```

### `onError` / `catchError` → `Errored` + effect `error` 옵션

1.x의 `onError`/`catchError`는 범위에 등록하는 명령형 오류 핸들러였습니다. 2.0에서는 오류가 반응형 그래프를 따라 전파되고 구조적으로 포착됩니다.

컴포넌트 수준의 오류 UI에는 `Errored`를 사용하세요.

```tsx
// 1.x
<ErrorBoundary fallback={err => <p>{err.message}</p>}>
  <Child />
</ErrorBoundary>

// 2.0
<Errored fallback={err => <p>{err().message}</p>}>
  <Child />
</Errored>
```

effect에서 프로그래밍 방식으로 오류를 처리하려면 `error` 옵션을 사용합니다.

```ts
// 1.x
catchError(
  () => {
    createEffect(() => riskyAsyncWork());
  },
  (err) => console.error('caught:', err),
);

// 2.0
createEffect(() => riskyAsyncWork(), {
  effect: (value) => {
    /* 성공 경로 */
  },
  error: (err) => console.error('caught:', err),
});
```

### `produce` → 기본 setter 동작

`produce`가 완전히 제거된 것은 아닙니다. 이제 이것이 기본 동작입니다. 2.0의 store setter는 변경 가능한 draft를 받습니다. setter를 감싸기 위해 `produce`를 import했다면 제거하면 됩니다.

```ts
// 1.x
import { produce } from 'solid-js/store';
setStore(
  produce((s) => {
    s.user.name = 'Alice';
    s.list.push('item');
  }),
);

// 2.0: draft 우선이 기본값
setStore((s) => {
  s.user.name = 'Alice';
  s.list.push('item');
});
```

이전의 경로 스타일 문법이 필요하면 `storePath`를 사용하세요.

```ts
setStore(storePath('user', 'name', 'Alice'));
```

### `createMutable` / `modifyMutable` → draft setter를 사용하는 `createStore`

`createMutable`은 직접 쓸 수 있는 proxy를 제공했습니다. 2.0에서는 draft setter를 사용하는 `createStore`가 쓰기를 명시적으로 유지하면서 같은 사용성을 제공합니다.

```ts
// 1.x
const state = createMutable({ count: 0, items: [] });
state.count++;
state.items.push('a');

// 2.0
const [state, setState] = createStore({ count: 0, items: [] });
setState((s) => {
  s.count++;
  s.items.push('a');
});
```

핵심 차이는 쓰기가 `setState`를 거친다는 점입니다. 이로써 반응형 시스템의 배치와 전환 조정에서 쓰기를 확인할 수 있습니다. proxy를 직접 변경하면 전환이나 optimistic rollback에 참여할 수 없습니다.

### `from` / `observable` → async iterator / effect

`from`은 외부 반응형 source를 signal로 바꾸고, `observable`은 signal을 observable로 바꿨습니다. 두 방향에는 서로 다른 대체 방법이 있습니다.

외부 → Solid(`from`): async iterable은 계산에서 직접 사용할 수 있습니다.

```ts
// 1.x
import { from } from 'solid-js';
const signal = from(observable$);

// 2.0: async iterable은 계산에서 일급으로 사용됨
const value = createMemo(async function* () {
  for await (const val of observable$) {
    yield val;
  }
});
```

Solid → 외부(`observable`): 즉시 대체하는 API는 없습니다. `observable()`은 외부 라이브러리가 구독할 수 있는 표준 Observable을 만들었습니다. 2.0에서는 `createEffect`로 signal 변경을 외부 subscriber에 전달합니다.

```ts
// 1.x
import { observable } from 'solid-js';
const obs$ = observable(signal);
obs$.subscribe((value) => externalLib.update(value));

// 2.0: effect로 변경을 외부에 전달
createEffect(signal, (value) => {
  externalLib.update(value);
});
```

외부 소비자에게 표준 Observable/AsyncIterable 인터페이스가 필요하다면 `createEffect` 위에 얇은 adapter를 만들어야 합니다. 이는 알려진 공백이며, 1.x의 `observable()` 편의 API와 정확히 대응하는 2.0 API는 아직 없습니다. 향후 `@solid-primitives`로 이동할 것으로 예상됩니다.

## 빠른 이름 변경 / 제거 매핑

### Import 경로

- `solid-js/web` → `@solidjs/web`
- `solid-js/store` → `solid-js`(store API는 이제 `solid-js`에서 직접 내보냄)
- `solid-js/h` → `@solidjs/h`
- `solid-js/html` → `@solidjs/html`
- `solid-js/universal` → `@solidjs/universal`
- 웹 JSX의 `jsxImportSource: "solid-js"` → `"@solidjs/web"`(hyperscript JSX는 `"@solidjs/h"`)

### 이름 변경

- `Suspense` → `Loading`
- `SuspenseList` → `Reveal`
- `ErrorBoundary` → `Errored`
- `mergeProps` → `merge`
- `splitProps` → `omit`
- `createSelector` → `createProjection` / `createStore(fn)`
- `createDynamic(source, props)` → `dynamic(source)` factory(`<Dynamic>` JSX wrapper는 그대로)
- `unwrap` → `snapshot`
- `onMount` → `onSettled`
- `equalFn` → `isEqual`
- `getListener` → `getObserver`
- `classList` → `class`(객체/배열 형태)

### 제거됨

- `createResource` → 비동기 계산 + `Loading`
- `startTransition` / `useTransition` → 내장 전환 + `isPending`/`Loading` + optimistic API
- `batch` → 동기 적용이 필요할 때 `flush()`
- `createComputed` → 분리된 `createEffect`, 함수형 `createSignal`/`createStore`, 또는 `createMemo`
- `on` 헬퍼 → 분리된 effect에서는 더 이상 불필요
- `onError` / `catchError` → `Errored` 또는 effect의 `error` 옵션
- `produce` → 기본 store setter 동작(draft 우선)
- `createMutable` / `modifyMutable` → draft setter와 함께 `createStore` 사용
- `from` / `observable` → async iterator
- `createDeferred` → 제거됨. Solid 외부에서 처리
- `indexArray` → `keyed: false`로 `mapArray` 사용
- `resetErrorBoundaries` → 더 이상 불필요(오류 경계가 자동으로 회복)
- `enableScheduling` → 제거됨
- `writeSignal` → 제거됨(내보내지 말았어야 했던 내부 API)
- `use:` directive → `ref` directive factory
- `attr:` / `bool:` 네임스페이스 → 표준 attribute 동작
- `on:` / `oncapture:` → Solid 이벤트에는 `onClick`, 네이티브 리스너 옵션에는 ref 콜백
- `Context.Provider` → context를 provider로 직접 사용(`<Context value={...}>`)
- `solid-js/jsx-runtime` / `solid-js/jsx-dev-runtime` → `@solidjs/web/jsx-runtime` 같은 렌더러 런타임 엔트리
