import React, { useEffect, useRef, useState } from "react";
import { PencilSquareIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import type { Experience } from "../findjobnu-api/models/Experience";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { DANISH_DATE_PATTERN, formatDateForDisplay, isValidDanishDateString, toApiDateString, toDateFromInput } from "../helpers/date";

interface Props {
  experiences: Experience[];
  onAdd: (exp: Experience) => void;
  onUpdate: (exp: Experience) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptyExperience: Experience = {
  positionTitle: "",
  company: "",
  fromDate: "",
  toDate: "",
  location: "",
  description: "",
};

const formatExperienceRange = (fromDate?: string | null, toDate?: string | null) => {
  const from = formatDateForDisplay(fromDate ?? undefined);
  const to = formatDateForDisplay(toDate ?? undefined);

  if (!from) return "Dato ikke angivet";
  if (!toDate || !to) return `${from} - Nu`;
  return `${from} - ${to}`;
};

const WorkExperienceList: React.FC<Props> = ({ experiences, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Experience>(emptyExperience);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fromDateInputRef = useRef<HTMLInputElement | null>(null);
  const toDateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayFromRef = useRef<Pikaday | null>(null);
  const pikadayToRef = useRef<Pikaday | null>(null);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const labelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45";
  const inputClass = "input input-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";
  const textareaClass = "textarea textarea-bordered validator w-full rounded-[1.2rem] border-base-300 bg-base-100/90";

  const handleEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditingId(exp.id!);
    setForm({
      ...exp,
      fromDate: formatDateForDisplay(exp.fromDate ?? undefined),
      toDate: formatDateForDisplay(exp.toDate ?? undefined),
    });
    setIsCurrent(!exp.toDate || formatDateForDisplay(exp.toDate ?? undefined) === "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (containerRef.current) {
      const fields = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input.validator, textarea.validator, select.validator"
      );
      for (const field of Array.from(fields)) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return;
        }
      }
    }

    const isValidDateInput = (value?: string | null) => typeof value === "string" && isValidDanishDateString(value);
    const dateInputsValid = isCurrent
      ? isValidDateInput(form.fromDate)
      : isValidDateInput(form.fromDate) && isValidDateInput(form.toDate);

    if (!dateInputsValid) {
      [fromDateInputRef.current, toDateInputRef.current].forEach(input => {
        if (!input) return;
        input.setCustomValidity("Ugyldig dato. Brug formatet dd/mm/yyyy.");
        input.reportValidity();
        input.setCustomValidity("");
      });
      return;
    }

    const prepared: Experience = {
      ...form,
      fromDate: toApiDateString(form.fromDate) ?? form.fromDate,
      toDate: isCurrent ? null : toApiDateString(form.toDate) ?? form.toDate,
    };

    if (editingId) {
      onUpdate({ ...prepared, id: editingId });
    } else {
      onAdd(prepared);
    }
    setEditingId(null);
    setForm(emptyExperience);
    setIsCurrent(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyExperience);
    setIsCurrent(false);
  };

  useEffect(() => {
    if (readOnly) return;
    const setupPicker = (
      inputEl: HTMLInputElement | null,
      existing: Pikaday | null,
      onSelect: (dateStr: string) => void
    ): Pikaday | null => {
      if (!inputEl) return null;
      if (existing) return existing;
      const picker = new Pikaday({
        field: inputEl,
        format: "DD/MM/YYYY",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        onSelect: (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          onSelect(`${dd}/${m}/${y}`);
        },
      });
      return picker;
    };

    if (editingId !== null) {
      pikadayFromRef.current = setupPicker(fromDateInputRef.current, pikadayFromRef.current, (val) => setForm(f => ({ ...f, fromDate: val })));
      pikadayToRef.current = setupPicker(toDateInputRef.current, pikadayToRef.current, (val) => setForm(f => ({ ...f, toDate: val })));

      if (pikadayFromRef.current && form.fromDate) {
        const parsed = toDateFromInput(form.fromDate);
        if (parsed) pikadayFromRef.current.setDate(parsed, true);
      }
      if (!isCurrent && pikadayToRef.current && form.toDate) {
        const parsed = toDateFromInput(form.toDate);
        if (parsed) pikadayToRef.current.setDate(parsed, true);
      }
    }

    return () => {
      if (pikadayFromRef.current) { pikadayFromRef.current.destroy(); pikadayFromRef.current = null; }
      if (pikadayToRef.current) { pikadayToRef.current.destroy(); pikadayToRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="space-y-3">
        {experiences.map((exp, index) => (
          <article key={exp.id ?? `${exp.positionTitle}-${exp.company}-${index}`} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold text-base-content">{exp.positionTitle || "Stilling"}</p>
                  <p className="text-sm leading-6 text-base-content/65">
                    {[exp.company, exp.location].filter(Boolean).join(" · ") || "Tilføj virksomhed og lokation"}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-base-300/70 bg-base-200/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/55 shadow-sm">
                  {formatExperienceRange(exp.fromDate ?? null, exp.toDate ?? null)}
                </span>
                {exp.description ? (
                  <p className="text-sm leading-6 text-base-content/72">{exp.description}</p>
                ) : null}
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-base-300/70 bg-base-100/85 px-4" onClick={() => handleEdit(exp)}>
                    <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                    Rediger
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-error/20 bg-error/10 px-4 text-error hover:bg-error/15" onClick={() => onDelete(exp.id!)}>
                    <TrashIcon className="w-4 h-4" aria-hidden="true" />
                    Slet
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {!readOnly && editingId === null && (
        <button type="button" className="btn btn-primary min-h-11 rounded-2xl px-5 shadow-lg shadow-primary/20" onClick={() => { setEditingId(0); setForm(emptyExperience); setIsCurrent(false); }}>
          Tilføj erfaring
          <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-control gap-2">
            <label className="label p-0" htmlFor="positionTitle-new">
              <span className={labelClass}>Titel</span>
            </label>
            <input id="positionTitle-new" className={inputClass} name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
            <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="company-new">
              <span className={labelClass}>Virksomhed</span>
            </label>
            <input id="company-new" className={inputClass} name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
            <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="fromDate-new">
              <span className={labelClass}>Fra (dd/mm/yyyy)</span>
            </label>
            <input id="fromDate-new" className={inputClass} name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Fra dato" required pattern={DANISH_DATE_PATTERN.source} ref={fromDateInputRef} autoComplete="off" />
            <div className="validator-hint">Format: dd/mm/yyyy</div>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="toDate-new">
              <span className={labelClass}>Til (dd/mm/yyyy eller tomt for nuværende)</span>
            </label>
            <input id="toDate-new" className={inputClass} name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Til dato" pattern={DANISH_DATE_PATTERN.source} ref={toDateInputRef} autoComplete="off" disabled={isCurrent} />
            <div className="validator-hint">Format: dd/mm/yyyy. Lad feltet være tomt, hvis det er din nuværende stilling.</div>
          </div>
          <div className="form-control mb-1 md:col-span-2">
            <label className="label cursor-pointer justify-start gap-3 rounded-[1.1rem] border border-base-300/70 bg-base-100/82 px-4 py-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isCurrent}
                onChange={(e) => { setIsCurrent(e.target.checked); if (e.target.checked) setForm(f => ({ ...f, toDate: "" })); }}
              />
              <span className="label-text">Nuværende stilling</span>
            </label>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="location-new">
              <span className={labelClass}>Lokation</span>
            </label>
            <input id="location-new" className={inputClass} name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" required pattern="^[A-Za-zÆØÅæøå' .-]{2,}$" />
            <div className="validator-hint">Mindst 2 tegn (bogstaver, mellemrum, punktum, bindestreg og apostrof)</div>
          </div>
          <div className="form-control gap-2 md:col-span-2">
            <label className="label p-0" htmlFor="description-new">
              <span className={labelClass}>Beskrivelse</span>
            </label>
            <textarea id="description-new" className={textareaClass} name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" maxLength={1000} rows={4} />
            <div className="validator-hint">Maks 1000 tegn</div>
          </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-base-300/70 pt-4 sm:flex-row">
            <button type="button" className="btn btn-success min-h-11 rounded-2xl px-5 shadow-lg shadow-success/20" onClick={handleSave}>Gem</button>
            <button type="button" className="btn btn-ghost min-h-11 rounded-2xl border border-base-300/70 bg-base-100/78 px-5" onClick={handleCancel}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperienceList;
