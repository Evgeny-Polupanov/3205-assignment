import { useGetJobsQuery } from '../../api';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { setCurrentJobId, setJobs } from '../../store/reducers/jobs.ts';
import classNames from 'classnames';
import { useEffect } from 'react';

export const statusMap = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export default function List() {
  const {
    data: fetchedJobs,
    isSuccess,
  } = useGetJobsQuery();

  const dispatch = useAppDispatch();
  const jobsSelector = useAppSelector((store) => store.jobs);
  const jobs = jobsSelector?.jobs;

  useEffect(() => {
    if (isSuccess) {
      dispatch(setJobs(fetchedJobs));
    }
  }, [isSuccess, fetchedJobs])

  return (
    <table className="w-full text-sm text-left text-gray-400 rounded-lg mb-4">
      <thead className="text-xs uppercase bg-gray-700 text-gray-400">
      <tr>
        <th scope="col" className="px-6 py-3">
          Job ID
        </th>
        <th scope="col" className="px-6 py-3">
          Created at
        </th>
        <th scope="col" className="px-6 py-3">
          Status
        </th>
        <th scope="col" className="px-6 py-3">
          Success/Failure
        </th>
      </tr>
      </thead>
      <tbody>
      {jobs.length === 0 && (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            No jobs found
          </td>
        </tr>
      )}
      {jobs.map((job) => (
        <tr
          key={job.id}
          className={classNames("border-b border-gray-700 cursor-pointer", {
            'bg-gray-500': jobsSelector.currentJobId === job.id,
            'bg-gray-800': jobsSelector.currentJobId !== job.id,
          })}
          onClick={() => dispatch(setCurrentJobId(job.id))}
        >
          <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
            {job.id}
          </td>
          <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
            {(new Date(job.createdAt)).toLocaleString()}
          </td>
          <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
            {statusMap[job.status]}
          </td>
          <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
            {job.urlsStats[0]}/{job.urlsStats[1]}
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}
