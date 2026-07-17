import type { Element } from 'solid-js';
import { LearnPropsHtmlElement } from './props-htmlelement.tsx';
import { LearnPropsReactivity } from './props-reactivity.tsx';

export function Learn(): Element {
  return (
    <div>
      <LearnPropsReactivity />
      <LearnPropsHtmlElement />
    </div>
  );
}
