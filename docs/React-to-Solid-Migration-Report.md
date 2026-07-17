# React → Solid 2.0 전환 TODO

> 조사 범위: `apps/`의 TypeScript/TSX 소스 263개(배포 산출물 `apps/finance/dist` 제외), 기준 문서: `docs/Solid2-beta-Migration-Guide.md`.
>
> 이 문서는 현재 코드에서 **실제로 많이 쓰는 React 의존성/패턴**을 중심으로 한 전환 준비 목록이다. Solid 2.0은 베타이므로, 라이브러리 호환성은 구현 시작 시점에 다시 확인한다. 가이드에서 명확히 제시한 Solid 2.0 API만 대체안으로 적었다.

## 현황 요약

- React import가 있는 파일: **142개**
- `@tanstack/react-query`: **56개 파일** — `useQuery`, `useSuspenseQuery`, `useQueries`, `QueryClientProvider`를 광범위하게 사용
- `react-router`: **24개 파일** — 최상위 및 중첩 `<Routes>/<Route>`, `Link`, `NavLink`, `Navigate`, location/params/navigation hook 사용
- `react-data-grid`: **22개 파일** — 4개의 실제 grid 컴포넌트와 다수의 column renderer/type이 의존
- React hook/JSX 패턴: `useMemo` 252회, `useEffect` 26회, `useCallback` 26회, `useRef` 19회, `useState` 17회, context 생성/소비 12회씩 (import·타입 참조 포함 단순 출현 수)

전환 난이도의 중심은 JSX 문법 자체보다 **React 전용 라이브러리와 React의 children/element 모델에 묶인 공용 UI**이다. 특히 라우터, Data Grid, TanStack Query 연동, custom Cartesian chart를 독립 작업 단위로 다뤄야 한다.

## 우선순위 TODO

### P0 — 런타임·빌드 기반 교체

- [ ] `apps/finance/index.tsx`의 `createRoot(...).render`, `StrictMode`, React provider 트리를 Solid 웹 renderer의 mount 방식으로 교체한다.
- [ ] `apps/finance/vite.config.mts`의 `@vitejs/plugin-react`, `babel-plugin-react-compiler`를 제거하고 Solid 2.0에 맞는 Vite/JSX 컴파일 설정으로 전환한다.
- [ ] `tsconfig.json`을 가이드대로 `jsx: "preserve"`, `jsxImportSource: "@solidjs/web"`로 변경한다. React JSX 타입을 쓰던 타입 import도 `@solidjs/web` 또는 renderer-neutral `solid-js` 타입으로 분류한다.
- [ ] `@types/react`, `@types/react-dom`, React hooks/refresh ESLint 설정, React Storybook framework를 교체하거나 제거한다. Storybook과 Vitest의 TSX 렌더링/브라우저 테스트 설정도 함께 검증한다.
- [ ] Solid 2.0의 변경된 import 위치를 일괄 점검한다. 웹 renderer는 `@solidjs/web`, store API는 `solid-js`를 사용한다.

### P0 — React 전용 의존성의 대체/재설계 결정

- [ ] **라우팅:** `apps/finance/App.tsx`와 페이지의 중첩 route 구조를 대상으로, 현재 `react-router` API를 계속 호출하지 않는 라우팅 구조를 선정하고 전환한다. `Route` 37회, `Link` 67회, `NavLink` 28회 출현이므로 최상위만 바꾸는 작업으로 끝나지 않는다.
- [ ] **데이터 그리드:** `react-data-grid`를 최우선으로 대체 가능 여부를 검증한다. 직접 렌더링하는 공용 컴포넌트는 `HoldingsGrid`, `MoneybookHistoryGrid`, `TradesGrid`, `WeeklyKcalGrid`이며 `DataGridHandle`, `DataGridProps`, `Column`, React element 기반 cell renderer가 공유 column 파일까지 전파되어 있다. Solid 2.0 전환에 앞서 대체 grid의 virtualization, selection, imperative scrolling, column renderer API를 확인한다.
- [ ] **서버 상태:** 56개 파일의 TanStack React Query 호출을 한 번에 바꾸지 말고, query option 생성기(`apps/@ui/query/api.ts`, `upbit.ts`)와 provider를 먼저 분리한다. `useSuspenseQuery` 5개와 `<Suspense>` 경계 5개는 별도 검증 대상이다. 이 문서의 Solid 2.0 가이드만으로는 TanStack adapter의 호환성을 확정할 수 없으므로, 구체적인 라이브러리 대체안은 적지 않는다.
- [ ] **반응형 라이브러리:** `react-responsive`를 쓰는 `ScreenProvider`와 React 아이콘 컴포넌트 7개 사용 파일, `react-markdown` 1개 사용 파일도 React 의존을 제거할 대안을 선정한다.
- [ ] **개발 도구:** `@storybook/react-vite` 및 React 전용 ESLint/Babel 의존성이 패키지에 남지 않도록 Storybook build, lint, test를 전환 완료 기준에 포함한다.

### P1 — React 모델에 강하게 결합된 공용 컴포넌트 재설계

- [ ] `apps/@ui/cartesian-chart/CartesianChart.tsx`를 별도 설계 작업으로 분리한다. 이 컴포넌트는 `React.Children.forEach`, `isValidElement`, React element 배열, `key`로 자식을 SVG/HTML layer로 재분류한다. 이는 React element/children 모델 의존이므로 기계적 JSX 치환 대상이 아니다. chart layer를 명시적인 props/slot/데이터 배열로 표현하도록 API부터 재설계한다.
- [ ] `apps/@libs/dialog/useDialog.ts`의 `ComponentType`, `ReactNode`, `createElement` 기반 "컴포넌트를 인자로 받아 promise dialog를 반환"하는 계약을 재설계한다. 동적 컴포넌트 표시가 필요하면 가이드의 `<Dynamic>`/`dynamic(source)`는 명확한 Solid 2.0 선택지지만, 현재 promise 상태·portal·접근성 계약까지 자동 변환되지는 않는다.
- [ ] `DetailedHTMLProps`, `HTMLAttributes`, `SVGProps`, `ReactNode`, `ReactElement`, `Ref` 등을 노출하는 공용 컴포넌트 prop을 Solid JSX 타입으로 전환한다. `ReactNode` 중심의 children 타입은 renderer-neutral `Element`와 웹 JSX 타입을 구분해야 한다.
- [ ] `react-data-grid` column renderer 및 chart marker처럼 JSX element를 데이터 구조에 저장/검사하는 코드를 모두 식별한다. Solid의 제어 흐름과 children은 React element 객체를 전제로 하지 않으므로, 이 경계부터 바꾼다.

### P1 — 상태, effect, context 전환

- [ ] `useState`를 사용하는 17개 출현 지점을 local signal/store 설계로 옮긴다. 단순 local 값에는 `createSignal`이 명확한 대응이다. 다만 Solid 2.0에서는 setter 직후 읽기가 즉시 새 값을 보장하지 않고 마이크로태스크 flush 후 갱신되므로, 동기 read에 의존하는 명령형 코드와 테스트를 찾아 수정/검증한다.
- [ ] `useMemo` 의존 배열 패턴을 한 개씩 검토한다. 순수 파생 계산이면 `createMemo(() => ...)`가 명확한 대응이며, 가이드상 initial value 인수는 없다. React의 렌더 최적화만을 위한 memoization, React children을 만드는 memo, effect가 섞인 memo는 자동 치환하지 않는다.
- [ ] `useEffect` 26개를 목적별로 분리한다. 반응 값 계산과 DOM/외부 시스템 반영은 가이드의 두 단계 `createEffect(compute, apply)`로 옮기며, cleanup은 apply 함수의 반환값으로 둔다. mount 시 1회 layout/리스너 초기화는 `onSettled`와 cleanup 반환을 검토한다.
- [ ] `useCallback` 26개는 일괄 대체하지 않는다. React에서는 참조 안정성이 dependency array/재렌더 최적화와 연결되지만 Solid에서는 그 전제가 다르다. callback이 child API, listener 해제, observer 옵션, 외부 라이브러리 identity에 실제로 필요한지부터 확인한다.
- [ ] `useRef` 19개를 DOM ref와 mutable instance ref로 분류한다. DOM directive/element 연결에는 가이드의 `ref` directive factory 패턴을 적용할 수 있다. `DataGridHandle`, `ResizeObserver`, 이전 값 캐시처럼 명령형 인스턴스를 보관하는 ref는 선택한 라이브러리/API에 맞게 개별 전환한다.
- [ ] context 6개(`Screen`, `PreloadData`, `FXTable`, CartesianChart, format 등)를 전환한다. Solid 2.0에서는 `Context.Provider` 대신 context 자체를 provider로 렌더링한다 (`<Context value={...}>`). 기본값 없는 context는 `useContext`가 없을 때 예외를 던지므로, 현재 `createContext<T>(null!)`처럼 런타임 기본값을 둔 context는 provider 누락 시 동작을 먼저 결정한 뒤 바꾼다.

### P1 — 비동기 UI와 제어 흐름

- [ ] 현재 `BodySummaryPage`의 `<Suspense>`와 `useSuspenseQuery` section을 최초 로딩/재검증 UX 기준으로 다시 설계한다. 가이드에서 명확한 경계 치환은 `<Suspense fallback>` → `<Loading fallback>`이다. Error UI가 필요하면 `<Errored>`도 함께 설계한다.
- [ ] TanStack Query를 계속 쓰든 다른 데이터 계층을 쓰든, Solid 2.0의 최초 준비 상태(`Loading`)와 변경 진행 상태(`isPending(() => expr)`)를 구분해 skeleton, background refresh, polling UI를 검증한다.
- [ ] 배열 `.map()`으로 JSX를 만드는 곳, `Fragment` 사용, 조건부 렌더링을 모두 점검한다. 목록 제어 흐름으로 옮길 경우 가이드의 `For` key 모드를 명시한다. 기존 `Index`와 동일한 안정 index/accessor 의미가 필요할 때만 `<For keyed={false}>`를 사용한다.

### P2 — DOM, 이벤트, CSS 및 검증

- [ ] spread props와 HTML/SVG attribute를 점검한다. Solid 2.0에서는 내장 속성이 attribute에 더 가깝게 처리되고 boolean attribute는 존재/부재로 처리된다. input, video, SVG, custom element에서 실제 DOM 결과를 확인한다.
- [ ] 이벤트를 점검한다. 가이드상 Solid 관리 이벤트에는 `onClick` 같은 camelCase를 사용하고 `on:`/`oncapture:`는 제거된다. capture/passive 같은 native listener option이 필요한 `ResizeObserver`/ESC/scroll 관련 코드는 ref callback으로 `addEventListener`하는 패턴을 적용한다.
- [ ] `classList` 또는 `use:` directive가 새로 생기지 않도록 한다. Solid 2.0에서는 `class={["base", { active: condition }]}`와 `ref={directive(options)}` (복수면 배열 ref)를 사용한다.
- [ ] `FilterTextForm`, 날짜 선택, ESC dialog, intersection/resize/local-storage hook처럼 form·focus·DOM observer·cleanup이 있는 shared hook부터 브라우저 회귀 테스트를 추가한다.
- [ ] 각 단계마다 `type-check`, lint, Vitest, finance production build를 통과시키고, 실제 desktop/mobile route, grid keyboard/selection/scroll, chart resize, query loading/error/refresh를 수동 점검한다.

## 자주 쓰는 React 패턴과 확실한 Solid 2.0 대응

아래 표는 현재 코드에서 확인됐고, 제공된 Solid 2.0 가이드가 대체 API를 명시한 경우만 담았다. "검토"는 단순 이름 치환이 아니라 설계 확인이 필요한 항목이다.

| 현재 React 사용 | 관찰 위치/규모 | Solid 2.0에서의 명확한 대응 | 전환 시 주의 |
| --- | --- | --- | --- |
| `useState` | 17회 출현. filter, dialog, observer, local-storage hook | `createSignal(initial)` | setter 뒤 즉시 read하지 말 것. 꼭 동기화가 필요할 때만 `flush()`를 검토한다. |
| `useMemo(fn, deps)` | 252회 출현. chart/grid의 data·column·style 파생에 집중 | 순수 파생 계산은 `createMemo(() => ...)` | dependency array를 옮기지 않는다. 2.0의 `createMemo` 두 번째 인수는 initial value가 아니라 options다. |
| `useEffect(fn, deps)` 및 cleanup | 26회 출현. route scroll, form 동기화, observer, scroll/grid imperative API | `createEffect(compute, apply)`; mount 작업은 `onSettled` | compute에는 읽기, apply에는 외부 변경을 둔다. cleanup은 apply의 반환 함수로 둔다. 반응 범위 안에서 signal/store 쓰기는 금지된다. |
| `<Suspense fallback>` | `BodySummaryPage`의 5개 경계 | `<Loading fallback>` | 최초 준비 상태 경계이다. 재검증 중 표시에는 `isPending`을 별도 사용한다. |
| `createContext` + `<Context.Provider>` + `useContext` | 6개 context, 12회 생성/소비 출현 | `<Context value={...}>`; `useContext(Context)` | 기본값 없는 context는 provider 부재 시 예외다. `null!` 기본값을 쓰는 기존 context의 의미를 먼저 정한다. |
| React의 동적 component element 생성 | `useDialog`의 `createElement(DialogComponent, props)` | `<Dynamic component={...}>` 또는 안정된 참조가 필요할 때 `dynamic(source)` | 동적 표시만 대응한다. dialog lifecycle/portal/promise API는 별도 구현한다. |
| 목록의 안정 index/accessor가 필요한 경우 | chart/grid 및 여러 list render | `<For each={items()} keyed={false}>` | 현재 코드가 React 배열 JSX인지부터 구분한다. `keyed={false}`일 때만 item이 accessor이고 index는 안정 숫자다. |
| React JSX 타입 (`ReactNode`, HTML/SVG props) | React import 142개 파일에 널리 존재 | 웹 JSX 타입은 `@solidjs/web`; renderer-neutral child는 `solid-js`의 `Element` | 2.0에서 `solid-js`는 웹 JSX namespace를 소유하지 않는다. props를 함수 인자에서 구조 분해하면 top-level reactive read 경고가 날 수 있으므로 props 객체를 유지한다. |

## React component library / 생태계 의존성 목록

| 의존성 | 사용 규모와 역할 | 전환 판단 |
| --- | --- | --- |
| `react-data-grid` | 22개 파일. holdings/history/trades/weekly-kcal grid, column/formatter, selection, handle/ref | **최고 위험.** React 전용 component/type/renderer 계약을 대체해야 한다. 후보 선정 전에 필요한 grid 기능을 명세화한다. |
| `react-router` | 24개 파일. app shell, nested route, navigation/link, URL params/location/navigation | **최고 위험.** route 정의와 링크를 동시에 바꿔야 하며 공용 column renderer의 link까지 범위에 포함한다. |
| `@tanstack/react-query` | 56개 파일. query option factory, provider, polling, select, query/suspense/multi-query | **높음.** React hook/provider 의존이다. data caching·polling·error·suspense 동작을 유지하는 Solid 경계를 검증한다. |
| `react-icons` | 7개 파일. navigation, filter, market state 등 | **중간.** icon component API가 React JSX에 묶여 있으므로 icon source/adapter를 선정한다. |
| `react-responsive` | `ScreenProvider` 1곳 | **중간.** 화면 상태 context의 source를 재구현/대체한다. mobile/tablet/desktop breakpoint 동작을 회귀 기준으로 둔다. |
| `react-markdown` + `remark-gfm` | position detail 1곳 | **낮음.** Markdown/GFM rendering과 custom component 여부를 확인해 독립 교체한다. |
| `@storybook/react-vite` | 개발 의존성 | **중간.** shared component story가 React renderer에 묶여 있으므로 React 제거 완료 조건에 포함한다. |

`@tiptap/*`, ProseMirror, D3 패키지는 `package.json`에는 있으나 이번 `apps/` 소스 조사에서는 직접 import를 확인하지 못했다. 실제 사용 범위가 추가되면 별도 inventory에 넣는다.

## 전환 순서 제안

1. Solid 2.0 spike 브랜치에서 Vite/TypeScript/ESLint/테스트와 최소 mount를 먼저 통과시킨다.
2. React 독립적인 format/data utility를 유지하고, signal/effect/context를 쓰는 shared hook부터 전환한다.
3. router와 query provider를 앱 shell에서 전환한다. 이 단계에서 `Loading`/`Errored` UX를 확정한다.
4. grid와 CartesianChart를 각각 별도 spike로 대체/재설계한다. 이 둘이 해결되기 전에는 전체 JSX 일괄 변환을 시작하지 않는다.
5. 페이지를 기능군별로 옮기고 각 기능군에서 type/lint/test/build 및 브라우저 회귀를 통과시킨다.
6. 마지막에 React runtime, type, plugin, ESLint, Storybook, React 전용 라이브러리가 dependency graph에서 제거됐는지 확인한다.

## Solid 2.0 베타 공통 주의사항

- props를 함수 인자에서 구조 분해하거나 component 최상위에서 reactive prop을 읽는 패턴은 개발 경고 대상이다. `function Component(props) { return <X value={props.value} /> }`처럼 props 객체를 유지한다.
- signal/store 쓰기를 `createMemo` 같은 reactive compute 범위에서 하지 않는다. 파생 값은 memo로 표현하고, 쓰기는 event/action 또는 effect의 apply 단계에 둔다.
- 2.0의 업데이트는 microtask 단위로 배치된다. React effect/ref를 흉내 내며 setter 직후 DOM/state를 읽는 코드는 특히 테스트한다.
- Solid 2.0 베타 가이드의 API/동작은 변경될 수 있다. 패키지 버전을 고정하고, 업그레이드 때마다 `docs/Solid2-beta-Migration-Guide.md` 및 upstream 변경 사항을 재검토한다.
