import React from "react";

// Skeleton placeholders for the Profile view while data loads
const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div className="overflow-hidden rounded-[1.85rem] border border-base-300/70 bg-base-100/82 p-5 shadow-lg sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="space-y-4">
            <div className="skeleton h-7 w-32 rounded-full" />
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-2/3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="skeleton h-28 w-full rounded-[1.35rem]" />
              <div className="skeleton h-28 w-full rounded-[1.35rem]" />
              <div className="skeleton h-28 w-full rounded-[1.35rem]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-9 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-2 w-full" />
            <div className="skeleton h-14 w-full rounded-[1.1rem]" />
            <div className="skeleton h-14 w-full rounded-[1.1rem]" />
            <div className="skeleton h-14 w-full rounded-[1.1rem]" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-11 w-28 rounded-2xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-28 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-28 mb-2" />
            <div className="skeleton h-24 w-full rounded-[1.35rem]" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-11 w-28 rounded-2xl" />
        </div>
        <div className="grid gap-4">
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-28 w-full rounded-[1.35rem]" />
          </div>
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-16 w-full rounded-[1.35rem]" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg sm:p-6">
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="skeleton h-12 w-40 rounded-2xl" />
          <div className="skeleton h-12 w-40 rounded-2xl" />
          <div className="skeleton h-12 w-40 rounded-2xl" />
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="skeleton h-28 w-full rounded-[1.35rem]" />
          <div className="skeleton h-28 w-full rounded-[1.35rem]" />
          <div className="skeleton h-28 w-full rounded-[1.35rem]" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
