import type { Element } from 'solid-js';
import { createSignal, For } from 'solid-js';

type Item = {
  id: string;
  label: string;
};

const loadedItems: readonly Item[] = [
  { id: 'first', label: '첫 번째' },
  { id: 'second', label: '두 번째' },
];

export function ForList(): Element {
  const [items, setItems] = createSignal<readonly Item[]>();
  const [slots, setSlots] = createSignal<readonly string[]>([
    '첫 번째 슬롯',
    '두 번째 슬롯',
  ]);
  let nextMountId = 0;

  const markSlotMount = (element: HTMLLIElement) => {
    element.dataset.mountId = String(nextMountId++);
  };

  return (
    <section>
      <h2>For keyed modes</h2>
      <p>
        기본 For는 item 값과 index accessor를, keyed=false는 item accessor와
        숫자 index를 전달합니다.
      </p>

      <button
        type="button"
        data-testid="for-load-items-button"
        onClick={() => setItems(loadedItems)}
      >
        기본 For 항목 불러오기
      </button>
      <ul data-testid="for-default-list">
        <For each={items()}>
          {(item, index) => (
            <li data-testid={`for-default-item-${item.id}`}>
              {item.label}:{index()}
            </li>
          )}
        </For>
      </ul>

      <button
        type="button"
        data-testid="for-replace-first-slot-button"
        onClick={() =>
          setSlots((current) =>
            current.map((slot, index) =>
              index === 0 ? '교체된 첫 번째 슬롯' : slot,
            ),
          )
        }
      >
        첫 번째 위치의 값 교체
      </button>
      <ul data-testid="for-keyed-false-list">
        <For each={slots()} keyed={false}>
          {(item, index) => (
            <li
              data-testid={`for-keyed-false-slot-${index}`}
              ref={markSlotMount}
            >
              {index}:{item()}
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
