import Form from './components/form';
import List from './components/list';
import Detail from './components/detail';

function App() {
  return (
    <main className="p-2">
      <h1 className="text-2xl font-bold">URL Status</h1>
      <section className="flex gap-4">
        <Form />
        <List />
      </section>
      <Detail />
    </main>
  );
}

export default App;
