import { A, Route, Router } from '@solidjs/router';
import type { ComponentProps } from '@solidjs/web';
import { render } from '@solidjs/web';
import { Main } from './main/index.tsx';
import { RuntimeChecks } from './runtime-checks/index.tsx';

function App(props: ComponentProps<typeof Router>) {
  return (
    <main>
      <nav>
        <A href="/">Main</A>
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
      <Route component={Main} />
    </Router>
  ),
  document.querySelector('#root')!,
);
