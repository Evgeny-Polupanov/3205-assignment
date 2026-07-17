import { useCreateJobMutation } from '../../api';
import { type SyntheticEvent, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks.ts';
import { setCurrentJobId } from '../../store/reducers/jobs.ts';

export default function Form() {
  const valueRef = useRef<HTMLTextAreaElement | null>(null);
  const [createJob, { error }] = useCreateJobMutation();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const urls = valueRef.current.value.split('\n').map((url) => url.trim()).filter(Boolean);
    const result = await createJob({ urls });
    if (result?.data?.jobId) {
      dispatch(setCurrentJobId(result.data.jobId));
    }
    valueRef.current.value = '';
  };

  return (
    <form className="mb-4" onSubmit={onSubmit}>
      <textarea
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 resize-none text-black"
        placeholder="Enter URLs here, one per line"
        ref={valueRef}
      />
      {/*@ts-ignore*/}
      {error && <p className="text-red-500 text-left">{error?.data?.message ?? 'Unknown error'}</p>}
      <button type="submit" className="block mt-4 bg-sky-500 hover:bg-sky-700 py-2 px-4 rounded-lg ml-auto text-white cursor-pointer">
        Add a job
      </button>
    </form>
  );
}
