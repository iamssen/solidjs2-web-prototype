import type { Element } from 'solid-js';
import { createSignal, onSettled, Show } from 'solid-js';

type SettledChildProps = {
  onCleanup: () => void;
  onSettled: () => void;
};

function SettledChild(props: SettledChildProps): Element {
  onSettled(() => {
    props.onSettled();
    return props.onCleanup;
  });

  return <span>mounted</span>;
}

export function OnSettled(): Element {
  const [visible, setVisible] = createSignal(true);
  const [events, setEvents] = createSignal<string[]>([]);
  const record = (event: string) => setEvents((current) => [...current, event]);

  return (
    <section>
      <h2>onSettled lifecycle</h2>
      <button
        type="button"
        data-testid="on-settled-unmount-button"
        onClick={() => setVisible(false)}
      >
        unmount
      </button>
      <Show when={visible()}>
        <SettledChild
          onSettled={() => record('settled')}
          onCleanup={() => record('cleanup')}
        />
      </Show>
      <output data-testid="on-settled-events">{events().join(',')}</output>
    </section>
  );
}
