import type { Element } from 'solid-js';
import { LearnPropsHtmlElement } from './props-htmlelement/main.tsx';
import { LearnPropsReactivity } from './props-reactivity/main.tsx';

export function Learn(): Element {
  return (
    <div>
      <LearnPropsReactivity />
      <LearnPropsHtmlElement />
    </div>
  );
}
