import type { Element } from 'solid-js';
import { createEffect, createMemo, createSignal } from 'solid-js';

export function Effects(): Element {
  const [count, setCount] = createSignal(0);
  const [effectResult, setEffectResult] = createSignal('pending');
  const [deferredResult, setDeferredResult] = createSignal('not run');
  const doubled = createMemo(() => count() * 2, { lazy: false });

  createEffect(
    () => count(),
    (value, previous) => {
      setEffectResult(`${previous ?? 'undefined'}->${value}`);
    },
  );

  createEffect(
    count,
    (value) => {
      setDeferredResult(String(value));
    },
    { defer: true },
  );

  return (
    <section>
      <h2>separated effects and memos</h2>
      <button
        type="button"
        data-testid="effects-increment-button"
        onClick={() => setCount((value) => value + 1)}
      >
        increment
      </button>
      <output data-testid="effects-apply-result">{effectResult()}</output>
      <output data-testid="effects-defer-result">{deferredResult()}</output>
      <output data-testid="effects-memo-result">{doubled()}</output>
    </section>
  );
}
