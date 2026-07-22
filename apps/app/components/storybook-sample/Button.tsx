import type { JSX } from '@solidjs/web';
import type { Element } from 'solid-js';

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {}

export function Button(props: ButtonProps): Element {
  return <button {...props} />;
}
