import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import LocationTypeahead from "../LocationTypeahead";
import EditableCardFrame from "./EditableCardFrame";
import type { Profile } from "../../findjobnu-api/models/Profile";
import type { ProfileDto } from "../../findjobnu-api/models/ProfileDto";
import { DANISH_DATE_PATTERN } from "../../helpers/date";

interface BasicInfoCardProps {
  profile: ProfileDto;
  form: Profile | null;
  editing: boolean;
  location: string;
  dateOfBirthInput: string;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onBasicInfoChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onToggleOpenToWork: (checked: boolean) => void;
  onDateInputRef: (node: HTMLInputElement | null) => void;
  onImportClick: () => void;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  profile,
  form,
  editing,
  location,
  dateOfBirthInput,
  onToggleEdit,
  onCancel,
  onSave,
  onBasicInfoChange,
  onLocationChange,
  onDateOfBirthChange,
  onToggleOpenToWork,
  onDateInputRef,
  onImportClick,
}) => {
  const renderValue = (value?: string | null) => {
    if (!value || value.trim().length === 0) return <span className="text-base-content/35">Ikke angivet</span>;
    return value;
  };

  const renderDate = (value?: string | Date | null) => {
    if (!value) return <span className="text-base-content/35">Ikke angivet</span>;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return <span className="text-base-content/35">Ikke angivet</span>;
    return parsed.toLocaleDateString("da-DK");
  };

  const fieldShellClass = "rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm";
  const labelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45";
  const valueClass = "mt-2 text-base leading-7 text-base-content";
  const inputClass = "input input-bordered validator w-full rounded-2xl border-base-300 bg-base-100/90";

  return (
    <EditableCardFrame
      title={
        <>
          <span>Basisoplysninger</span>
          {" "}
          <button
            type="button"
            className="tooltip tooltip-left inline-flex h-8 w-8 items-center justify-center rounded-full border border-base-300/70 bg-base-100/75 text-base-content/60 transition hover:border-primary/25 hover:text-base-content"
            data-tip="Vi bruger dine informationer til at finde relevante job annoncer i bla. 'Anbefalede job'. Vi videregiver aldrig dine oplysninger til tredjeparter."
            aria-label="Hjælp til Min Profil"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/60 hover:text-base-content" aria-hidden />
          </button>
        </>
      }
      editTooltip="Rediger Basisoplysninger"
      actions={(
        <button
          type="button"
          className="tooltip tooltip-bottom btn btn-ghost btn-sm min-h-11 rounded-2xl border border-base-300/70 bg-base-100/78 px-4"
          data-tip="Importér fra PDF"
          onClick={onImportClick}
          aria-label="Importér fra PDF"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 3.5-3.5M12 15l-3.5-3.5M5 19h14" />
          </svg>
          Importér CV
        </button>
      )}
      editing={editing}
      onToggleEdit={onToggleEdit}
      onCancel={onCancel}
      onSave={onSave}
      bodyClassName="grid gap-4 lg:grid-cols-2"
    >
      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="firstName">
              <span className={labelClass}>Fornavn</span>
            </label>
            <input
              className={inputClass}
              id="firstName"
              name="firstName"
              value={form?.basicInfo?.firstName ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Fornavn"
              required
              minLength={2}
              pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
              title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            />
            <p className="validator-hint">
              Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
            </p>
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="firstName">Fornavn</label>
            <div className={valueClass}>{renderValue(profile.basicInfo?.firstName)}</div>
          </>
        )}
      </div>

      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="lastName">
              <span className={labelClass}>Efternavn</span>
            </label>
            <input
              className={inputClass}
              id="lastName"
              name="lastName"
              value={form?.basicInfo?.lastName ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Efternavn"
              required
              minLength={2}
              pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
              title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            />
            <p className="validator-hint">
              Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
            </p>
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="lastName">Efternavn</label>
            <div className={valueClass}>{renderValue(profile.basicInfo?.lastName)}</div>
          </>
        )}
      </div>

      <div className={fieldShellClass}>
        <label className={labelClass} htmlFor="location">
          By
        </label>
        {editing ? (
          <LocationTypeahead
            value={location}
            onChange={(value) => {
              onLocationChange(value);
            }}
            inputProps={{
              name: "location",
              id: "location",
              pattern: "^[A-Za-zÀ-ÿ' .-]{2,}$",
              title: "Brug mindst 2 tegn. Tilladte tegn: bogstaver, mellemrum, punktum, bindestreg og apostrof.",
              className: inputClass,
            }}
          />
        ) : (
          <div className={valueClass}>{renderValue(profile.basicInfo?.location)}</div>
        )}
      </div>

      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="dateOfBirth">
              <span className={labelClass}>Fødselsdato</span>
            </label>
            <input
              ref={onDateInputRef}
              className={inputClass}
              id="dateOfBirth"
              name="dateOfBirth"
              type="text"
              value={dateOfBirthInput}
              onChange={(event) => onDateOfBirthChange(event.target.value)}
              placeholder="dd/mm/yyyy"
              pattern={DANISH_DATE_PATTERN.source}
              title="Brug formatet dd/mm/yyyy."
            />
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="dateOfBirth">Fødselsdato</label>
            <div className={valueClass}>{renderDate(profile.basicInfo?.dateOfBirth ?? null)}</div>
          </>
        )}
      </div>

      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="jobTitle">
              <span className={labelClass}>Jobtitel</span>
            </label>
            <input
              className={inputClass}
              id="jobTitle"
              name="jobTitle"
              value={form?.basicInfo?.jobTitle ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Jobtitel"
              pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
              title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
            />
            <div className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</div>
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="jobTitle">Jobtitel</label>
            <div className={valueClass}>{renderValue(profile.basicInfo?.jobTitle)}</div>
          </>
        )}
      </div>

      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="company">
              <span className={labelClass}>Virksomhed</span>
            </label>
            <input
              className={inputClass}
              id="company"
              name="company"
              value={form?.basicInfo?.company ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Virksomhed"
              pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
              title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
            />
            <div className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</div>
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="company">Virksomhed</label>
            <div className={valueClass}>{renderValue(profile.basicInfo?.company)}</div>
          </>
        )}
      </div>

      <div className={fieldShellClass}>
        {editing ? (
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="phoneNumber">
              <span className={labelClass}>Telefonnummer</span>
            </label>
            <input
              className={inputClass}
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={form?.basicInfo?.phoneNumber ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Telefonnummer"
              pattern="^[+()0-9\\s-]{6,20}$"
              title="Indtast et gyldigt telefonnummer (6-20 tegn, tal, mellemrum, +, (), -)."
            />
            <p className="validator-hint">Gyldigt telefonnummer, f.eks. +45 12 34 56 78</p>
          </div>
        ) : (
          <>
            <label className={labelClass} htmlFor="phoneNumber">Telefonnummer</label>
            <div className={valueClass}>{renderValue(profile.basicInfo?.phoneNumber)}</div>
          </>
        )}
      </div>

      <div className={`${fieldShellClass} lg:col-span-2`}>
        <label className={labelClass} htmlFor="openToWork">
          Aktivt søgende?
        </label>
        {editing ? (
          <div className="mt-2 flex items-center gap-3">
            <input
              id="openToWork"
              type="checkbox"
              className="toggle toggle-primary"
              checked={!!form?.basicInfo?.openToWork}
              onChange={(event) => onToggleOpenToWork(event.target.checked)}
            />
            <span className="text-sm text-base-content/70">Vis at du er åben for nye muligheder</span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-3">
            <input
              id="openToWork"
              type="checkbox"
              className="toggle toggle-primary"
              checked={!!profile.basicInfo?.openToWork}
              readOnly
              disabled
            />
            <span
              className={`text-sm ${profile.basicInfo?.openToWork ? "text-success" : "text-base-content/70"}`}
            >
              {profile.basicInfo?.openToWork ? "Aktivt søgende." : "Ikke aktivt søgende."}
            </span>
          </div>
        )}
      </div>
    </EditableCardFrame>
  );
};

export default BasicInfoCard;
