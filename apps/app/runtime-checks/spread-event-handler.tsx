import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';

export function SpreadEventHandler(): Element {
  const [count, setCount] = createSignal(0);
  const handlers = {
    onClick: () => setCount((previous) => previous + 1),
  };

  return (
    <section>
      <h2>spread event handler</h2>
      <p>
        버튼을 클릭할 때마다 spread된 `onClick` handler가 실행되어 카운터가 1씩
        증가해야 합니다.
      </p>
      <button
        type="button"
        data-testid="spread-event-handler-button"
        {...handlers}
      >
        spread handler: {count()}
      </button>
    </section>
  );
}
