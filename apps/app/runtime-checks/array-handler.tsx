import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';

export function ArrayHandler(): Element {
  const [count, setCount] = createSignal(1);
  const increment = (i: number) => setCount((prev) => prev + i);

  return (
    <section>
      <h2>array event handler</h2>
      <p>클릭할 때마다 배열의 두 번째 값(2)만큼 카운터가 증가해야 합니다.</p>
      <button
        type="button"
        data-testid="array-handler-button"
        onClick={[increment, 2]}
      >
        {count()}
      </button>
    </section>
  );
}
