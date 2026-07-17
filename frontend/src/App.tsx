import Form from './components/form';
import List from './components/list';
import Detail from './components/detail';
import { useAppSelector } from './store/hooks.ts';

function App() {
  const jobsSelector = useAppSelector((store) => store.jobs);

  return (
    <main className="p-2">
      <h1 className="text-2xl font-bold">URL Status</h1>
      <Form />
      <List />
      {jobsSelector.currentJobId && <Detail id={jobsSelector.currentJobId} />}
    </main>
  );
}

export default App;
