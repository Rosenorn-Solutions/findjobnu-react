import React from "react";
import { CheckIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface EditableCardFrameProps {
  title: React.ReactNode;
  editTooltip: string;
  editing: boolean;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
  actions?: React.ReactNode;
}

const EditableCardFrame: React.FC<EditableCardFrameProps> = ({
  title,
  editTooltip,
  editing,
  onToggleEdit,
  onCancel,
  onSave,
  children,
  bodyClassName,
  actions,
}) => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-base-300/70 bg-gradient-to-br from-base-100/95 via-base-100/88 to-primary/5 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_58%)]" />
      <div className="pointer-events-none absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="card-title flex items-center gap-2 text-xl font-semibold tracking-tight text-base-content">{title}</div>
          <div className="flex flex-wrap items-center gap-2">
          {actions}
          <button
            type="button"
            className={[
              "btn btn-sm min-h-11 rounded-2xl border px-4 shadow-sm transition-all duration-200",
              editing
                ? "border-warning/30 bg-warning/10 text-warning hover:border-warning/40 hover:bg-warning/15"
                : "border-base-300/70 bg-base-100/82 text-base-content/72 hover:border-primary/25 hover:bg-base-100 hover:text-base-content",
            ].join(" ")}
            onClick={onToggleEdit}
            aria-label={editTooltip}
            title={editTooltip}
          >
            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
            {editing ? "Luk redigering" : "Rediger"}
          </button>
        </div>
        </div>

        <div className={bodyClassName ?? "grid gap-4"}>{children}</div>

        {editing && (
          <div className="flex flex-col gap-3 border-t border-base-300/70 pt-4 sm:flex-row sm:items-center">
            <button type="button" className="btn btn-success min-h-11 rounded-2xl px-5 shadow-lg shadow-success/20" onClick={onSave}>
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              Gem
            </button>
            <button type="button" className="btn btn-ghost min-h-11 rounded-2xl border border-base-300/70 bg-base-100/75 px-5" onClick={onCancel}>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              Annuller
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableCardFrame;
