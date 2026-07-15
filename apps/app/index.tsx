import { render } from '@solidjs/web';

const root = document.querySelector('#root');

function App() {
  return <div>Hello World!</div>;
}

render(() => <App />, root!);
