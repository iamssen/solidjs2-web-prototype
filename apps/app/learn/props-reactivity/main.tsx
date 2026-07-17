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
 * @see {@link file://./plain-prop-getter-chain.md | Plain prop getter chain}
 * @see {@link file://./plain-prop-rendering.md | `PlainMultipassChild2`는 `num` 변경을 어떻게 다시 렌더링하는가}
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
 * @see {@link file://./signal-getter-memo-cache.md | Signal, getter prop, and memo cache}
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
