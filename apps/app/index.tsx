import { render } from '@solidjs/web';
import { RuntimeChecks } from './runtime-checks/index.tsx';

const root = document.querySelector('#root');

function App() {
  return (
    <main>
      <h1>Hello World!</h1>
      <RuntimeChecks />
    </main>
  );
}

render(() => <App />, root!);
