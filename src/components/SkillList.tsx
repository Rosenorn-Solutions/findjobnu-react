import React, { useRef, useState } from "react";
import { PencilSquareIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import type { Skill } from "../findjobnu-api/models/Skill";
import { SkillProficiency } from "../findjobnu-api/models/SkillProficiency";

interface Props {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onUpdate: (skill: Skill) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptySkill: Skill = {
  name: "",
  proficiency: SkillProficiency.NUMBER_0,
};

const proficiencyLabels = ["Begynder", "Let øvet", "Øvet", "Ekspert"];

const SkillList: React.FC<Props> = ({ skills, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Skill>(emptySkill);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45";
  const inputClass = "input input-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";
  const selectClass = "select select-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";

  const handleEdit = (skill: Skill) => {
    if (readOnly) return;
    setEditingId(skill.id!);
    setForm(skill);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "proficiency" ? Number(value) : value,
    });
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
    if (editingId) {
      onUpdate({ ...form, id: editingId });
    } else {
      onAdd(form);
    }
    setEditingId(null);
    setForm(emptySkill);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptySkill);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <article key={skill.id ?? `${skill.name}-${index}`} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-base-content">{skill.name || "Færdighed"}</p>
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/65 shadow-sm">
                  {proficiencyLabels[skill.proficiency]}
                </span>
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-base-300/70 bg-base-100/85 px-4" onClick={() => handleEdit(skill)}>
                    <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                    Rediger
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-2xl border border-error/20 bg-error/10 px-4 text-error hover:bg-error/15" onClick={() => onDelete(skill.id!)}>
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
        <button type="button" className="btn btn-primary min-h-11 rounded-2xl px-5 shadow-lg shadow-primary/20" onClick={() => { setEditingId(0); setForm(emptySkill); }}>
          Tilføj færdighed
          <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm sm:p-5">
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="skill-name-new">
              <span className={labelClass}>Færdighed</span>
            </label>
            <input id="skill-name-new" className={inputClass} name="name" value={form.name || ""} onChange={handleChange} placeholder="Færdighed" title="Færdighed" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn</p>
          <select className={selectClass} name="proficiency" value={form.proficiency} onChange={handleChange} title="Kompetenceniveau">
            <option value={SkillProficiency.NUMBER_0}>Begynder</option>
            <option value={SkillProficiency.NUMBER_1}>Let øvet</option>
            <option value={SkillProficiency.NUMBER_2}>Øvet</option>
            <option value={SkillProficiency.NUMBER_3}>Ekspert</option>
          </select>
          <div className="validator-hint">Vælg kompetenceniveau</div>
          <div className="mt-4 flex flex-col gap-3 border-t border-base-300/70 pt-4 sm:flex-row">
            <button type="button" className="btn btn-success min-h-11 rounded-2xl px-5 shadow-lg shadow-success/20" onClick={handleSave}>Gem</button>
            <button type="button" className="btn btn-ghost min-h-11 rounded-2xl border border-base-300/70 bg-base-100/78 px-5" onClick={handleCancel}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillList;
