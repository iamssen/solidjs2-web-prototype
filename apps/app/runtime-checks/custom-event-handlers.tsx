import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';

declare module '@solidjs/web' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface EventHandlersElement<T> {
      onCustom?: T extends HTMLButtonElement
        ? EventHandlerUnion<T, CustomEvent>
        : never;
    }
  }
}

const dispatchCustom = (element: HTMLButtonElement) =>
  element.dispatchEvent(new CustomEvent('custom'));

export function CustomEventHandlers(): Element {
  const [directCount, setDirectCount] = createSignal(0);
  const [arrayCount, setArrayCount] = createSignal(0);

  const incrementDirect = () => setDirectCount((count) => count + 1);
  const incrementArray = (amount: number) =>
    setArrayCount((count) => count + amount);

  return (
    <section>
      <h2>custom event handler</h2>
      <p>
        각 버튼을 클릭하면 `custom` event가 dispatch되고, 일반 handler는 1씩,
        배열 handler는 2씩 증가해야 합니다.
      </p>
      <button
        type="button"
        data-testid="custom-event-direct-button"
        onCustom={incrementDirect}
        onClick={(event) => dispatchCustom(event.currentTarget)}
      >
        일반 handler: {directCount()}
      </button>
      <button
        type="button"
        data-testid="custom-event-array-button"
        onCustom={[incrementArray, 2]}
        onClick={(event) => dispatchCustom(event.currentTarget)}
      >
        배열 handler: {arrayCount()}
      </button>
    </section>
  );
}
