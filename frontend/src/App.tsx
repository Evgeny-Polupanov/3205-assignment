import './App.css';
import { useGetJobsQuery } from './api';

function App() {
  const {
    data: jobs = [],
  } = useGetJobsQuery(undefined, {
    pollingInterval: 4_000,
    skipPollingIfUnfocused: true,
  });

  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id}>{job.status}</li>
      ))}
    </ul>
  );
}

export default App;
