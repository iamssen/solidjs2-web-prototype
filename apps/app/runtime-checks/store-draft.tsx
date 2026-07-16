import type { Element } from 'solid-js';
import { createStore } from 'solid-js';

export function StoreDraft(): Element {
  const [state, setState] = createStore({ count: 0, item: 'first' });

  return (
    <section>
      <h2>store draft setter</h2>
      <button
        type="button"
        data-testid="store-draft-increment-button"
        onClick={() =>
          setState((draft) => {
            draft.count++;
            draft.item = 'updated';
          })
        }
      >
        update draft
      </button>
      <output data-testid="store-draft-result">
        {state.count}:{state.item}
      </output>
    </section>
  );
}
