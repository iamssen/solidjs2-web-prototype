import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';

declare module '@solidjs/web' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface HTMLAttributes<T> {
      onCustomAttribute?: T extends HTMLDivElement ? string : never;
      onCustomNumber?: T extends HTMLDivElement ? number : never;
      onCustomBoolean?: T extends HTMLDivElement ? boolean : never;
    }
  }
}

const expectedAttributes = {
  dataControl: 'enabled',
  onCustomAttribute: 'attribute-value',
  onCustomNumber: '1',
  onCustomBoolean: {
    present: true,
    value: '',
  },
};
const expectedJson = JSON.stringify(expectedAttributes, null, 2);

export function OnAttributes(): Element {
  const [actualJson, setActualJson] = createSignal<string>();
  const [matchesExpected, setMatchesExpected] = createSignal<boolean>();

  const inspectAttributes = (element: HTMLDivElement) => {
    const actualAttributes = {
      // eslint-disable-next-line unicorn/prefer-dom-node-dataset
      dataControl: element.getAttribute('data-control'),
      onCustomAttribute: element.getAttribute('oncustomattribute'),
      onCustomNumber: element.getAttribute('oncustomnumber'),
      onCustomBoolean: {
        present: element.hasAttribute('oncustomboolean'),
        value: element.getAttribute('oncustomboolean'),
      },
    };
    const json = JSON.stringify(actualAttributes, null, 2);

    setActualJson(json);
    setMatchesExpected(json === expectedJson);
  };

  return (
    <section>
      <h2>on* 문자열 attribute</h2>
      <p>
        검사 버튼을 누르면 실제 DOM attribute를 JSON으로 표시하고 기대값과
        비교합니다.
      </p>
      <h3>기대 JSON</h3>
      <pre>{expectedJson}</pre>
      <div
        data-testid="on-attributes-target"
        data-control="enabled"
        onCustomAttribute="attribute-value"
        onCustomNumber={1}
        onCustomBoolean={true}
      />
      <button
        type="button"
        data-testid="on-attributes-inspect-button"
        onClick={(event) =>
          inspectAttributes(
            event.currentTarget.previousElementSibling as HTMLDivElement,
          )
        }
      >
        attribute 검사
      </button>
      {actualJson() && (
        <>
          <h3>실제 JSON</h3>
          <pre>{actualJson()}</pre>
          <output data-testid="on-attributes-result">
            {matchesExpected() ? '기대값과 일치' : '기대값과 불일치'}
          </output>
        </>
      )}
    </section>
  );
}
