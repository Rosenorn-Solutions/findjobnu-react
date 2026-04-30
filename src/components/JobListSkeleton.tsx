import React from "react";

interface Props {
  count?: number;
}

const JobListSkeleton: React.FC<Props> = ({ count = 5 }) => {
  const items = Array.from({ length: Math.max(1, count) });
  return (
    <div className="grid gap-4">
      {items.map((_, i) => (
        <div key={`job-skel-${count}-${i}`} className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-4 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.42)] sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-7 w-28 rounded-full" />
            <div className="skeleton h-7 w-32 rounded-full" />
            <div className="skeleton h-7 w-40 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="skeleton h-8 w-3/4 max-w-xl" />
            <div className="flex flex-wrap gap-2">
              <div className="skeleton h-9 w-40 rounded-full" />
              <div className="skeleton h-9 w-32 rounded-full" />
            </div>
          </div>

          <div className="mt-4 mx-auto w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-base-300/50">
            <div className="skeleton h-36 w-full sm:h-40" />
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-base-300/60 bg-base-100/70 p-4">
            <div className="skeleton mb-3 h-3 w-24" />
            <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-10/12" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-base-300/70 pt-3">
            <div className="skeleton h-11 w-36 rounded-full" />
            <div className="skeleton h-11 w-28 rounded-full" />
            <div className="skeleton h-11 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobListSkeleton;
