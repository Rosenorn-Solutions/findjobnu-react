import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import EditableCardFrame from "./EditableCardFrame";
import type { Profile } from "../../findjobnu-api/models/Profile";
import type { ProfileDto } from "../../findjobnu-api/models/ProfileDto";

interface AboutKeywordsCardProps {
  profile: ProfileDto;
  form: Profile | null;
  editing: boolean;
  keywordsInput: string;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onBasicInfoChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeywordsChange: (value: string) => void;
}

const AboutKeywordsCard: React.FC<AboutKeywordsCardProps> = ({
  profile,
  form,
  editing,
  keywordsInput,
  onToggleEdit,
  onCancel,
  onSave,
  onBasicInfoChange,
  onKeywordsChange,
}) => {
  const aboutValue = profile.basicInfo?.about?.trim()
    ? profile.basicInfo.about
    : "";
  const fieldShellClass = "rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm";
  const labelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45";
  const inputClass = "input input-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";
  const textareaClass = "textarea textarea-bordered validator w-full rounded-[1.2rem] border-base-300 bg-base-100/90";

  return (
    <EditableCardFrame
      title={<span>Om mig &amp; Nøgleord</span>}
      editTooltip="Rediger Om mig & Nøgleord"
      editing={editing}
      onToggleEdit={onToggleEdit}
      onCancel={onCancel}
      onSave={onSave}
    >
      <div className={fieldShellClass}>
        <label className={labelClass} htmlFor="about">
          Om mig
        </label>
        {editing ? (
          <>
            <textarea
              className={textareaClass}
              id="about"
              name="about"
              value={form?.basicInfo?.about ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Kort beskrivelse"
              rows={4}
              maxLength={1000}
              title="Maks 1000 tegn."
            />
            <div className="validator-hint">Maks 1000 tegn</div>
          </>
        ) : (
          <div className="mt-2 text-base leading-7 text-base-content">{aboutValue || <span className="text-base-content/35">Ikke angivet</span>}</div>
        )}
      </div>

      <div className="h-px bg-base-300/70" />

      <div className={fieldShellClass}>
        <label className={labelClass} htmlFor="keywords">
          Top kompetencer
          {" "}
          <button
            type="button"
            className="tooltip tooltip-left inline-flex h-8 w-8 items-center justify-center rounded-full border border-base-300/70 bg-base-100/75 text-base-content/60 transition hover:border-primary/25 hover:text-base-content"
            data-tip="Dine top kompetencer anvendes i højere grad end andre informationer, når vi udsøger anbefalede job."
            aria-label="Hjælp til Min Profil"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/60 hover:text-base-content" aria-hidden />
          </button>
        </label>
        {editing ? (
          <>
            <input
              className={inputClass}
              id="keywords"
              name="keywords"
              value={keywordsInput}
              onChange={(event) => onKeywordsChange(event.target.value)}
              placeholder="f.eks. React, TypeScript, .NET, Azure"
            />
            <div className="validator-hint">Adskil med komma. Eksempel: React, TypeScript, .NET</div>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.keywords && profile.keywords.length > 0 ? (
              profile.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-sm text-base-content/72 shadow-sm">
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-base-content/35">Ikke angivet</span>
            )}
          </div>
        )}
      </div>
    </EditableCardFrame>
  );
};

export default AboutKeywordsCard;
