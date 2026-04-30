import React, { useEffect, useRef, useState } from "react";
import { PencilSquareIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import type { Education } from "../findjobnu-api/models/Education";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { DANISH_DATE_PATTERN, formatDateForDisplay, isValidDanishDateString, toApiDateString, toDateFromInput } from "../helpers/date";

interface Props {
  educations: Education[];
  onAdd: (edu: Education) => void;
  onUpdate: (edu: Education) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptyEducation: Education = {
  degree: "",
  institution: "",
  fromDate: "",
  toDate: "",
  description: "",
};

const formatEducationRange = (fromDate?: string | null, toDate?: string | null) => {
  const from = formatDateForDisplay(fromDate ?? undefined);
  const to = formatDateForDisplay(toDate ?? undefined);

  if (!from && !to) return "Dato ikke angivet";
  if (!to) return `${from} - Nu`;
  return `${from} - ${to}`;
};

const EducationList: React.FC<Props> = ({ educations, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Education>(emptyEducation);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fromDateInputRef = useRef<HTMLInputElement | null>(null);
  const toDateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayFromRef = useRef<Pikaday | null>(null);
  const pikadayToRef = useRef<Pikaday | null>(null);
  const labelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45";
  const inputClass = "input input-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";
  const textareaClass = "textarea textarea-bordered validator w-full rounded-[1.2rem] border-base-300 bg-base-100/90";

  const handleEdit = (edu: Education) => {
    if (readOnly) return;
    setEditingId(edu.id!);
    setForm({
      ...edu,
      fromDate: formatDateForDisplay(edu.fromDate ?? undefined),
      toDate: formatDateForDisplay(edu.toDate ?? undefined),
    });
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
    const datesValid = isValidDateInput(form.fromDate) && isValidDateInput(form.toDate);

    if (!datesValid) {
      [fromDateInputRef.current, toDateInputRef.current].forEach(input => {
        if (!input) return;
        input.setCustomValidity("Ugyldig dato. Brug formatet dd/mm/yyyy.");
        input.reportValidity();
        input.setCustomValidity("");
      });
      return;
    }

    const withApiDates: Education = {
      ...form,
      fromDate: toApiDateString(form.fromDate) ?? form.fromDate,
      toDate: toApiDateString(form.toDate) ?? form.toDate,
    };

    if (editingId) {
      onUpdate({ ...withApiDates, id: editingId });
    } else {
      onAdd(withApiDates);
    }
    setEditingId(null);
    setForm(emptyEducation);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyEducation);
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
      if (pikadayToRef.current && form.toDate) {
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
        {educations.map((edu, index) => (
          <article key={edu.id ?? `${edu.degree}-${edu.institution}-${index}`} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold text-base-content">{edu.degree || "Uddannelse"}</p>
                  <p className="text-sm leading-6 text-base-content/65">{edu.institution || "Tilføj institution"}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-base-300/70 bg-base-200/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/55 shadow-sm">
                  {formatEducationRange(edu.fromDate ?? null, edu.toDate ?? null)}
                </span>
                {edu.description ? (
                  <p className="text-sm leading-6 text-base-content/72">{edu.description}</p>
                ) : null}
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-base-300/70 bg-base-100/85 px-4" onClick={() => handleEdit(edu)}>
                    <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                    Rediger
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-error/20 bg-error/10 px-4 text-error hover:bg-error/15" onClick={() => onDelete(edu.id!)}>
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
        <button type="button" className="btn btn-primary min-h-11 rounded-2xl px-5 shadow-lg shadow-primary/20" onClick={() => { setEditingId(0); setForm(emptyEducation); }}>
          Tilføj uddannelse
          <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-control gap-2">
            <label className="label p-0" htmlFor="degree-new">
              <span className={labelClass}>Uddannelse</span>
            </label>
            <input id="degree-new" className={inputClass} name="degree" value={form.degree || ""} onChange={handleChange} placeholder="Uddannelse" title="Uddannelse" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
            <p className="validator-hint">Mindst 2 tegn</p>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="institution-new">
              <span className={labelClass}>Institution</span>
            </label>
            <input id="institution-new" className={inputClass} name="institution" value={form.institution || ""} onChange={handleChange} placeholder="Institution" title="Institution" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
            <p className="validator-hint">Mindst 2 tegn</p>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="fromDate-new">
              <span className={labelClass}>Fra (dd/mm/yyyy)</span>
            </label>
            <input id="fromDate-new" className={inputClass} name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Fra" required pattern={DANISH_DATE_PATTERN.source} ref={fromDateInputRef} autoComplete="off" />
            <div className="validator-hint">Format: dd/mm/yyyy</div>
          </div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="toDate-new">
              <span className={labelClass}>Til (dd/mm/yyyy)</span>
            </label>
            <input id="toDate-new" className={inputClass} name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Til" required pattern={DANISH_DATE_PATTERN.source} ref={toDateInputRef} autoComplete="off" />
            <div className="validator-hint">Format: dd/mm/yyyy</div>
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

export default EducationList;
