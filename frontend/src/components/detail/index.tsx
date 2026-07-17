import { useCancelJobMutation, useGetJobQuery, useGetJobsQuery } from '../../api';
import { useEffect, useState } from 'react';
import { statusMap } from '../list';
import classNames from 'classnames';

const urlStatusMap = {
  pending: 'Pending',
  in_progress: 'In Progress',
  success: 'Success',
  error: 'Error',
  cancelled: 'Cancelled',
};

const TERMINAL_JOB_STATUSES = new Set(['completed', 'failed', 'cancelled']);
const TERMINAL_URL_STATUSES = new Set(['success', 'error', 'cancelled']);
const POLLING_INTERVAL = 1000;

export default function Detail({ id }: { id: string }) {
  const [pollingInterval, setPollingInterval] = useState(POLLING_INTERVAL);

  const {
    data: job,
  } = useGetJobQuery(id, {
    skipPollingIfUnfocused: true,
    pollingInterval,
  });

  const query = useGetJobsQuery();

  const [cancelJob] = useCancelJobMutation();

  useEffect(() => {
    if (!job || !TERMINAL_JOB_STATUSES.has(job.status)) {
      setPollingInterval(POLLING_INTERVAL);
    } else {
      setPollingInterval(0);
      query.refetch();
    }
  }, [job, id]);

  const hasPending = job?.urls.some((url) => url.status === 'pending');
  const isProcessing = job?.urls.some((url) => url.status === 'in_progress');
  const processedCount = job?.urls.filter((url) => TERMINAL_URL_STATUSES.has(url.status)).length;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            Processed: {processedCount}/{job?.urlsCount}
          </h2>
          {job && (
            <>
              <h2 className="text-xl font-bold">
                Status: {statusMap[job.status]}
              </h2>
              {isProcessing && (
                <h2 className="text-xl font-bold">
                  Processing...
                </h2>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          className={classNames("text-white font-bold py-2 px-4 rounded-lg", {
            'bg-gray-500 hover:bg-gray-500 cursor-not-allowed': !hasPending,
            'bg-red-500 hover:bg-red-700 cursor-pointer': hasPending,
          })}
          onClick={() => cancelJob(id)}
          disabled={!hasPending}
        >
          Cancel
        </button>
      </div>
      <table className="w-full text-sm text-left text-gray-400 rounded-lg mb-4">
        <thead className="text-xs uppercase bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            URL
          </th>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
          <th scope="col" className="px-6 py-3">
            HTTP Status
          </th>
          <th scope="col" className="px-6 py-3">
            Error Message
          </th>
        </tr>
        </thead>
        <tbody>
        {job?.urls.map((url) => (
          <tr
            key={url.url}
            className={"bg-gray-800 border-b border-gray-700"}
          >
            <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
              {url.url}
            </td>
            <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
              {urlStatusMap[url.status]}
            </td>
            <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
              {url.httpStatus ?? 'N/A'}
            </td>
            <td scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
              {url.errorMessage ?? 'N/A'}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </section>
  );
}
