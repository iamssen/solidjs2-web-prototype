import { A, Route, Router } from '@solidjs/router';
import type { ComponentProps } from '@solidjs/web';
import { render } from '@solidjs/web';
import { ComponentsPreview } from './components/main.tsx';
import { Learn } from './learn/main.tsx';
import { RuntimeChecks } from './runtime-checks/main.tsx';
import { PageNotFound } from './status/404.tsx';
import style from './style.module.css';

function App(props: ComponentProps<typeof Router>) {
  return (
    <main>
      <nav class={style.nav}>
        <A href="/">Main</A>
        <A href="/component-preview">Component Preview</A>
        <A href="/runtime-checks">Runtime Checks</A>
      </nav>
      {props.children}
    </main>
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/runtime-checks" component={RuntimeChecks} />
      <Route path="/component-preview" component={ComponentsPreview} />
      <Route component={Learn} />
      <Route path="*404" component={PageNotFound} />
    </Router>
  ),
  document.querySelector('#root')!,
);
