import type { Element } from 'solid-js';
import { createSignal, flush } from 'solid-js';

export function Batching(): Element {
  const [count, setCount] = createSignal(0);
  const [immediate, setImmediate] = createSignal('not run');
  const [microtask, setMicrotask] = createSignal('not run');
  const [afterFlush, setAfterFlush] = createSignal('not run');

  const updateWithoutFlush = () => {
    setCount(1);
    setImmediate(String(count()));
    queueMicrotask(() => setMicrotask(String(count())));
  };

  const updateWithFlush = () => {
    setCount(2);
    flush();
    setAfterFlush(String(count()));
  };

  return (
    <section>
      <h2>microtask batching</h2>
      <button
        type="button"
        data-testid="batch-update-button"
        onClick={updateWithoutFlush}
      >
        update
      </button>
      <button
        type="button"
        data-testid="batch-flush-button"
        onClick={updateWithFlush}
      >
        update and flush
      </button>
      <output data-testid="batch-immediate-result">{immediate()}</output>
      <output data-testid="batch-microtask-result">{microtask()}</output>
      <output data-testid="batch-flush-result">{afterFlush()}</output>
    </section>
  );
}
