import Form from './components/form';
import List from './components/list';
import Detail from './components/detail';

function App() {
  return (
    <main>
      <section className="flex">
        <Form />
        <List />
      </section>
      <Detail />
    </main>
  );
}

export default App;
