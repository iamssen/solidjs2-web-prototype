import type { JSX } from '@solidjs/web';
import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';

// 고정된 div를 root로 쓰는 component에는 div 전용 HTML attribute와 event type을 상속한다.
interface DivProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function Div(props: DivProps): Element {
  return <div {...props} />;
}

export function LearnPropsHtmlElement(): Element {
  const [foo] = createSignal<string>('bar');

  // 명확한 Event handler type
  const click: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    event: MouseEvent,
  ) => {
    console.log('click', event, foo());
  };

  // Event type만 맞아도 허용됨
  const dbclick = (event: MouseEvent) => {
    console.log('dbclick', event, foo());
  };

  return (
    <section>
      <Div data-foo="bar" onClick={click} onDblClick={dbclick}>
        Hello
      </Div>
    </section>
  );
}
