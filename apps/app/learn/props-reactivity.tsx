import type { Accessor, Element } from 'solid-js';
import { createEffect, createMemo, createSignal } from 'solid-js';

function PlainChild(props: { num: number }): Element {
  return <p>PlainChild - num: {props.num}</p>;
}

function AccessorChild(props: { num: Accessor<number> }): Element {
  return <p>AccessorChild - num: {props.num()}</p>;
}

function AccessorChild2(props: { num: Accessor<number> }): Element {
  // eslint-disable-next-line @ssen/solid/reactivity
  const num = props.num();
  return <p>AccessorChild break reactivity - num: {num}</p>;
}

function MemoChild(props: { num: Accessor<number> }): Element {
  const num = createMemo<string>(() => `is ${props.num()}`);
  return <p>MemoChild - num: {num()}</p>;
}

function EffectChild(props: { num: Accessor<number> }): Element {
  const [num, setNum] = createSignal<number>(0);

  createEffect(
    () => props.num(),
    (n) => {
      setNum(n);
    },
  );
  return <p>EffectChild - num: {num()}</p>;
}

function MultipassChild2(props: { num: Accessor<number> }): Element {
  const num = createMemo<string>(() => `is ${props.num()}`);
  return (
    <span data-depth="2">
      {props.num()}, {num()}
    </span>
  );
}

function MultipassChild1(props: { num: Accessor<number> }): Element {
  return (
    <span data-depth="1">
      <MultipassChild2 num={props.num} />
    </span>
  );
}

function MultipassChild(props: { num: Accessor<number> }): Element {
  return (
    <p>
      MultipassChild - num: <MultipassChild1 num={props.num} />
    </p>
  );
}

/**
 * Q. 처음에는 `num()`으로 전달했는데, 왜 이후에 `props.num`만 읽어도
 * 반응성이 유지될까?
 *
 * A. JSX는 prop 값을 지금 바로 계산해 넘기지 않는다. 컴파일 뒤에는 대략 다음과
 * 같은 getter가 만들어진다.
 *
 *   createComponent(PlainMultipassChild, {
 *     get num() {
 *       return num(); // `props.num`을 읽는 바로 그때 signal을 읽는다.
 *     },
 *   });
 *
 * 중간 컴포넌트의 `num={props.num}`도 비슷하게 getter가 된다.
 *
 *   get num() {
 *     return props.num; // 상위 prop getter를 다시 읽는다.
 *   }
 *
 * 그러므로 마지막 JSX가 `props.num`을 읽으면 아래 순서로 원래 signal까지 도달한다.
 *
 *   마지막 props.num
 *   -> Child1의 props.num
 *   -> PlainMultipassChild의 props.num
 *   -> 부모의 num()
 *
 * `props.num`의 TypeScript 타입은 `number`지만, 실제 객체의 property는 getter일 수
 * 있다. 반대로 아래처럼 컴포넌트 함수의 최상단에서 읽어 변수에 복사하면 그 변수는
 * 일반 숫자 스냅샷이므로 더 이상 갱신되지 않는다.
 *
 *   function BrokenChild(props: { num: number }) {
 *     const num = props.num;
 *     return <p>{num}</p>;
 *   }
 *
 * 권장: 화면에 값을 표시하거나 그대로 다음 컴포넌트에 전달하는 정도라면 이 예제의
 * `PlainMultipassChild`처럼 값 prop을 받는 편이 간결하다. 호출하는 쪽에 "필요할 때
 * 값을 읽는 함수"라는 API를 명시해야 하거나, 일반 TypeScript 함수에 전달해야 한다면
 * `MultipassChild`처럼 `Accessor<number>`를 받는 편이 의도를 더 잘 드러낸다.
 */
function PlainMultipassChild2(props: { num: number }): Element {
  console.log(props);
  const num = createMemo<string>(() => `is ${props.num}`);
  return (
    <span data-depth="2">
      {props.num}, {num()}
    </span>
  );
}

function PlainMultipassChild1(props: { num: number }): Element {
  return (
    <span data-depth="1">
      <PlainMultipassChild2 num={props.num} />
    </span>
  );
}

function PlainMultipassChild(props: { num: number }): Element {
  return (
    <p>
      PlainMultipassChild - num: <PlainMultipassChild1 num={props.num} />
    </p>
  );
}

/**
 * signal, getter prop, createMemo는 모두 값을 읽을 수 있게 하지만 캐시 방식이 다르다.
 *
 * 1. signal은 "현재 값"을 저장한다.
 *
 *   const [num, setNum] = createSignal(0);
 *   num(); // signal이 가지고 있는 현재 숫자: 0
 *   num(); // 다시 계산하는 것이 아니라 같은 현재 숫자를 읽는다.
 *
 * 2. getter prop은 값을 저장하지 않는다. 읽기 요청을 원래 signal까지 전달할 뿐이다.
 *
 *   // JSX의 <Child num={num()} />는 개념적으로 다음과 비슷하다.
 *   const props = {
 *     get num() {
 *       return num();
 *     },
 *   };
 *
 *   props.num; // getter -> num() -> signal의 현재 값
 *   props.num; // getter -> num() -> 같은 signal의 현재 값
 *
 * 3. createMemo는 "계산한 결과"를 저장한다. 의존하는 값이 바뀌기 전까지는 여러 번
 * 읽어도 계산 함수를 다시 실행하지 않는다.
 *
 *   const label = createMemo(() => `is ${num()}`);
 *   label(); // `is 0`을 계산하고 저장한다.
 *   label(); // 저장한 `is 0`을 돌려준다.
 *   setNum(1);
 *   // 갱신이 처리된 뒤 다음 label()은 `is 1`을 한 번 계산해 다시 저장한다.
 *
 * 그래서 값 읽기만 필요한 `{props.num}`에는 memo가 필요 없다. 아래처럼 계산 비용이
 * 있거나 여러 곳에서 같은 파생 값을 읽을 때 memo를 사용한다.
 *
 *   // 호출할 때마다 expensiveCalculation이 실행될 수 있다.
 *   const withoutCache = () => expensiveCalculation(props.num);
 *
 *   // props.num이 바뀔 때만 expensiveCalculation을 다시 실행한다.
 *   const withCache = createMemo(() => expensiveCalculation(props.num));
 */
export function LearnPropsReactivity(): Element {
  const [num, setNum] = createSignal<number>(0);

  return (
    <section>
      <h1>Component Props 전달을 어떻게 해야 반응성이 끊어지지 않는지 확인</h1>
      <button onClick={() => setNum(num() + 1)}>Increase</button>
      <p>num: {num()}</p>
      <PlainChild num={num()} />
      <AccessorChild num={num} />
      <AccessorChild2 num={num} />
      <MemoChild num={num} />
      <EffectChild num={num} />
      <MultipassChild num={num} />
      <PlainMultipassChild num={num()} />
    </section>
  );
}
