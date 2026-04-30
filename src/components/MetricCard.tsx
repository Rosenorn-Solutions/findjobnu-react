import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export type MetricCardProps = {
  label: string;
  tooltip: string;
  value?: React.ReactNode;
  ok: boolean;
  showIndicator?: boolean;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, tooltip, value, ok, showIndicator = true }) => {
  return (
    <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/85 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 text-sm text-base-content/72">
        <span className="font-medium leading-6">{label}</span>
        <button
          type="button"
          className="tooltip tooltip-top"
          data-tip={tooltip}
          aria-label={`Hjælp til ${label}`}
        >
          <QuestionMarkCircleIcon className="h-4 w-4 text-base-content/60 hover:text-base-content" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight text-base-content">
        {value != null && <span>{value}</span>}
        </div>
        {showIndicator && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? 'bg-success/12 text-success' : 'bg-warning/15 text-warning'}`}
            aria-label={ok ? 'OK' : 'Advarsel'}
            title={ok ? 'OK' : 'Tjek anbefaling'}
          >
            {ok ? 'OK' : 'Tjek'}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
