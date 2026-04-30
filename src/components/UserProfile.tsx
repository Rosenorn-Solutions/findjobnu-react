import React, { useCallback, useEffect, useRef, useState } from "react";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { useUser } from "../context/UserContext.shared";
import { ProfileApi } from "../findjobnu-api";
import type { Profile } from "../findjobnu-api/models/Profile";
import type { Experience } from "../findjobnu-api/models/Experience";
import type { Education } from "../findjobnu-api/models/Education";
import type { Skill } from "../findjobnu-api/models/Skill";
import type { ProfileDto } from "../findjobnu-api/models/ProfileDto";
import ProfileSkeleton from "./ProfileSkeleton";
import BasicInfoCard from "./userProfile/BasicInfoCard";
import AboutKeywordsCard from "./userProfile/AboutKeywordsCard";
import ExperiencesCard from "./userProfile/ExperiencesCard";
import EducationsCard from "./userProfile/EducationsCard";
import SkillsCard from "./userProfile/SkillsCard";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  MapPinIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient, createProfileSimple } from "../helpers/ApiFactory";
import { mapProfileDtoToProfile, mapProfileToUpdateRequest } from "../helpers/mappers";
import { formatDateForDisplay, toApiDateString, toDateFromInput } from "../helpers/date";
import ImportCvCard from "./ImportCvCard";

interface Props { userId: string; refreshKey?: number; }

type EditingCard = 'basic' | 'about' | 'experiences' | 'educations' | 'skills' | null;
type DetailsTab = "experiences" | "educations" | "skills";

const detailTabs: Array<{
  key: DetailsTab;
  label: string;
  note: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  {
    key: "experiences",
    label: "Erfaringer",
    note: "Vis tidligere roller og ansvar",
    icon: BriefcaseIcon,
  },
  {
    key: "educations",
    label: "Uddannelser",
    note: "Saml kurser og uddannelsesforloeb",
    icon: AcademicCapIcon,
  },
  {
    key: "skills",
    label: "Færdigheder",
    note: "Fremhaev de vigtigste kompetencer",
    icon: SparklesIcon,
  },
];

const UserProfileComponent: React.FC<Props> = ({ userId, refreshKey }) => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateOfBirthInput, setDateOfBirthInput] = useState<string>("");
  // Which card is currently being edited (null = none)
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  // Toast confirmation handling
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("experiences");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importRefresh, setImportRefresh] = useState(0);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      globalThis.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastTimerRef.current = globalThis.setTimeout(() => setToast(null), 3000);
  };
  // LocationTypeahead handles suggestions
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayRef = useRef<Pikaday | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const token = user?.accessToken;

  const applyProfileState = useCallback((dto: ProfileDto | null) => {
    if (!dto) {
      setProfile(null);
      setForm(null);
      setDateOfBirthInput("");
      setLocation("");
      setKeywordsInput("");
      return;
    }

    const mapped = mapProfileDtoToProfile(dto);
    setProfile(dto);
    setForm(mapped);
    setDateOfBirthInput(formatDateForDisplay(mapped.basicInfo.dateOfBirth));
    setLocation(mapped.basicInfo.location ?? "");
    setKeywordsInput((mapped.keywords ?? []).join(", "));
  }, []);

  // Date picker setup
  useEffect(() => {
    if (editingCard === 'basic' && dateInputRef.current) {
      pikadayRef.current ??= new Pikaday({
        field: dateInputRef.current,
        format: "DD/MM/YYYY",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        onSelect: (d: Date) => setDateOfBirthInput(formatDateForDisplay(d)),
      });
      if (dateOfBirthInput) {
        const parsed = toDateFromInput(dateOfBirthInput);
        if (parsed) pikadayRef.current.setDate(parsed, true);
      }
    }
    return () => { if (pikadayRef.current) { pikadayRef.current.destroy(); pikadayRef.current = null; } };
  }, [editingCard, dateOfBirthInput]);

  // Fetch profile
  useEffect(() => {
    const api = createApiClient(ProfileApi, token);
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await api.getProfileByUserId({ userId });
        if (cancelled) return;
        applyProfileState(data);
      } catch (e) {
        const err = await handleApiError(e);
        if (err.type !== "not_found") setError(err.message);
        applyProfileState(null);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId, token, applyProfileState, refreshKey, importRefresh]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setForm({ ...form, basicInfo: { ...form.basicInfo, [e.target.name]: e.target.value } });
  };

  // LocationTypeahead handles focus, change, and suggestion click

  const handleSave = async () => {
    if (!form?.id) return;
    // Trigger HTML5 validation for inputs using DaisyUI Validator
    if (containerRef.current) {
      const fields = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input.validator, textarea.validator, select.validator"
      );
      for (const field of Array.from(fields)) {
        if (!field.checkValidity()) {
          field.reportValidity();
          setError("Ret venligst valideringsfejlene.");
          return;
        }
      }
    }
    const api = createApiClient(ProfileApi, token);
    setLoading(true); setError(null);
    try {
      const trimOrNull = (value?: string | null): string | null => {
        if (value == null) return null;
        const trimmed = value.trim();
        return trimmed.length === 0 ? null : trimmed;
      };

      const normalizeDateString = (value?: string | null): string | null => {
        const trimmed = trimOrNull(value);
        if (!trimmed) return null;
        return toApiDateString(trimmed) ?? trimmed;
      };
      const parsedKeywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      const dateValue = dateOfBirthInput ? toDateFromInput(dateOfBirthInput) : null;
      const normalizedDob = dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue : null;
      const updatedProfile: Profile = {
        ...form,
        keywords: parsedKeywords,
        experiences: (form.experiences || []).map(exp => ({
          ...exp,
          fromDate: normalizeDateString(exp.fromDate),
          toDate: normalizeDateString(exp.toDate),
        })),
        educations: (form.educations || []).map(edu => ({
          ...edu,
          fromDate: normalizeDateString(edu.fromDate),
          toDate: normalizeDateString(edu.toDate),
        })),
        basicInfo: {
          ...form.basicInfo,
          dateOfBirth: normalizedDob,
          location,
        },
      };

      const updateRequest = mapProfileToUpdateRequest(updatedProfile);
      await api.updateProfile({ id: form.id, profileUpdateRequest: updateRequest });
      const refreshed = await api.getProfileByUserId({ userId });
      applyProfileState(refreshed);
      setEditingCard(null);
      showToast('Profil gemt');
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  const handleCreateProfile = async () => {
    const api = createApiClient(ProfileApi, token);
    setLoading(true); setError(null);
    try {
      const newProfile: Profile = {
        userId,
        basicInfo: { firstName: "", lastName: "", phoneNumber: "", dateOfBirth: null, location: "" },
        savedJobPosts: [], keywords: [], experiences: [], educations: [], interests: [], accomplishments: [], contacts: [], skills: []
      } as Profile;
  await createProfileSimple(api, {
    userId,
    fullName: `${newProfile.basicInfo?.firstName ?? ""} ${newProfile.basicInfo?.lastName ?? ""}`.trim(),
    email: undefined,
    phone: newProfile.basicInfo?.phoneNumber ?? undefined,
    summary: newProfile.basicInfo?.about ?? undefined,
  });
  const fresh = await api.getProfileByUserId({ userId });
  applyProfileState(fresh);
  setEditingCard('basic');
  showToast('Profil oprettet');
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  const populateFormFromExistingProfile = (card: NonNullable<EditingCard>) => {
    if (!profile) return;
    const mapped = mapProfileDtoToProfile(profile);
    setForm(mapped);
    if (card === "basic") {
      setLocation(mapped.basicInfo.location ?? "");
      setDateOfBirthInput(formatDateForDisplay(mapped.basicInfo.dateOfBirth));
      setKeywordsInput((mapped.keywords ?? []).join(", "));
    }
    if (card === "about") {
      setKeywordsInput((mapped.keywords ?? []).join(", "));
    }
  };

  const updateFormState = (updater: (prev: Profile) => Profile) => {
    setForm((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    updateFormState((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, location: value },
    }));
  };

  const handleToggleOpenToWork = (checked: boolean) => {
    updateFormState((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, openToWork: checked },
    }));
  };

  const handleExperienceAdd = (experience: Experience) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: [...(prev.experiences ?? []), experience],
    }));
  };

  const handleExperienceUpdate = (experience: Experience) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: (prev.experiences ?? []).map((existing) =>
        existing.id === experience.id ? experience : existing
      ),
    }));
  };

  const handleExperienceDelete = (experienceId: number) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: (prev.experiences ?? []).filter((existing) => existing.id !== experienceId),
    }));
  };

  const handleEducationAdd = (education: Education) => {
    updateFormState((prev) => ({
      ...prev,
      educations: [...(prev.educations ?? []), education],
    }));
  };

  const handleEducationUpdate = (education: Education) => {
    updateFormState((prev) => ({
      ...prev,
      educations: (prev.educations ?? []).map((existing) =>
        existing.id === education.id ? education : existing
      ),
    }));
  };

  const handleEducationDelete = (educationId: number) => {
    updateFormState((prev) => ({
      ...prev,
      educations: (prev.educations ?? []).filter((existing) => existing.id !== educationId),
    }));
  };

  const handleSkillAdd = (skill: Skill) => {
    updateFormState((prev) => ({
      ...prev,
      skills: [...(prev.skills ?? []), skill],
    }));
  };

  const handleSkillUpdate = (skill: Skill) => {
    updateFormState((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).map((existing) => (existing.id === skill.id ? skill : existing)),
    }));
  };

  const handleSkillDelete = (skillId: number) => {
    updateFormState((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).filter((existing) => existing.id !== skillId),
    }));
  };

  const beginEditingCard = (card: NonNullable<EditingCard>) => {
    populateFormFromExistingProfile(card);
    setEditingCard((prev) => (prev === card ? null : card));
  };

  const cancelEditingCard = (card: NonNullable<EditingCard>) => {
    populateFormFromExistingProfile(card);
    setEditingCard(null);
  };

  const switchDetailsTab = (tab: DetailsTab) => {
    setDetailsTab(tab);
    setEditingCard(null);
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Profil onboarding
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                Start din profil med et bedre overblik
              </h2>
              <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                Opret grundprofilen nu, og udfyld erfaring, uddannelse og kompetencer lidt ad gangen. Du kan altid importere CV og redigere bagefter.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Kom hurtigt i gang med basisoplysninger og jobtitel.",
                "Føj erfaringer, uddannelser og kompetencer til, naar det passer dig.",
                "Forbedr dine anbefalinger og profilmatch trin for trin.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Klar til start</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-base-content">Opret din profil</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/68">
              {error ?? "Ingen profil fundet endnu. Opret profilen nu og udfyld detaljerne, naar du er klar."}
            </p>

            <div className="mt-5 rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Efter oprettelse</p>
              <p className="mt-2 text-sm leading-6 text-base-content/68">
                Du lander direkte i din profil og kan straks redigere felter, tilfoeje kompetencer og importere dit CV.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button type="button" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20" onClick={handleCreateProfile}>
                Opret profil
              </button>
              <p className="text-xs leading-6 text-base-content/55">Det tager kun et øjeblik at oprette basisprofilen.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const experiences = form?.experiences ?? [];
  const educations = form?.educations ?? [];
  const skills = form?.skills ?? [];
  const basicInfo = form?.basicInfo ?? profile.basicInfo ?? {};
  const displayName = [basicInfo.firstName, basicInfo.lastName].filter((value): value is string => Boolean(value?.trim())).join(" ") || "Gør din profil klar";
  const headline = basicInfo.jobTitle?.trim() || "Tilføj titel, erfaring og nøgleord for skarpere jobmatch";
  const currentLocation = (location || basicInfo.location || "").trim();
  const hasLocation = currentLocation.length > 0;
  const activeKeywords = (keywordsInput ? keywordsInput.split(",") : profile.keywords ?? [])
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
  const completionChecks = [
    Boolean(basicInfo.firstName?.trim() && basicInfo.lastName?.trim()),
    Boolean(basicInfo.jobTitle?.trim()),
    hasLocation,
    Boolean(basicInfo.about?.trim()),
    experiences.length > 0,
    educations.length > 0,
    skills.length > 0,
    activeKeywords.length > 0,
  ];
  const completionPercent = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
  const summaryStats = [
    {
      label: "Erfaringer",
      value: experiences.length.toString(),
      note: experiences.length === 1 ? "rolle registreret" : "roller registreret",
    },
    {
      label: "Uddannelser",
      value: educations.length.toString(),
      note: educations.length === 1 ? "uddannelse tilføjet" : "uddannelser tilføjet",
    },
    {
      label: "Færdigheder",
      value: skills.length.toString(),
      note: activeKeywords.length > 0 ? `${activeKeywords.length} nøgleord valgt` : "tilføj nøgleord for bedre match",
    },
  ];
  const onboardingChecks = [
    {
      label: "Basisoplysninger",
      complete: Boolean(basicInfo.firstName?.trim() && basicInfo.lastName?.trim() && basicInfo.jobTitle?.trim()),
    },
    {
      label: "Erfaring og uddannelse",
      complete: experiences.length > 0 || educations.length > 0,
    },
    {
      label: "Kompetencer og søgeord",
      complete: skills.length > 0 || activeKeywords.length > 0,
    },
  ];

  return (
    <div className="w-full h-fit space-y-6" ref={containerRef}>
      {error && (
        <div className="rounded-[1.35rem] border border-error/25 bg-error/10 px-4 py-3 text-sm text-error shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-10 h-44 w-44 rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.15fr)_320px] xl:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
              Profil overblik
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">{displayName}</h2>
              <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">{headline}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-base-content/68">
              <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/76 px-4 py-2 shadow-sm">
                <MapPinIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                {hasLocation ? currentLocation : "Tilføj din by"}
              </span>
              <span className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm",
                basicInfo.openToWork
                  ? "border-success/25 bg-success/10 text-success"
                  : "border-base-300/70 bg-base-100/76 text-base-content/68",
              ].join(" ")}>
                <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                {basicInfo.openToWork ? "Aktivt søgende" : "Passiv profilstatus"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/76 px-4 py-2 shadow-sm">
                <SparklesIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                {activeKeywords.length} nøgleord valgt
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {summaryStats.map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-base-content">{item.value}</p>
                  <p className="text-sm leading-6 text-base-content/65">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Onboarding status</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-base-content">Profilstyrke {completionPercent}%</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/68">
              Gør profilen stærkere ved at udfylde de vigtigste oplysninger, så du står tydeligere i anbefalinger og fremtidige match.
            </p>

            <progress className="progress progress-primary mt-5 h-2 w-full" value={completionPercent} max={100} />

            <div className="mt-5 space-y-3">
              {onboardingChecks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-[1.1rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <CheckCircleIcon className={[
                    "h-5 w-5 shrink-0",
                    item.complete ? "text-success" : "text-base-content/35",
                  ].join(" ")} aria-hidden="true" />
                  <span className="text-sm text-base-content/72">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button type="button" className="btn btn-primary min-h-12 rounded-2xl px-5 shadow-lg shadow-primary/20" onClick={() => beginEditingCard("basic")}>
                Rediger profil
              </button>
              <button type="button" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/70 bg-base-100/78 px-5" onClick={() => setShowImportDialog(true)}>
                <CloudArrowUpIcon className="h-5 w-5" aria-hidden="true" />
                Importér CV
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <BasicInfoCard
          profile={profile}
          form={form}
          editing={editingCard === 'basic'}
          location={location}
          dateOfBirthInput={dateOfBirthInput}
          onToggleEdit={() => beginEditingCard('basic')}
          onCancel={() => cancelEditingCard('basic')}
          onSave={handleSave}
          onBasicInfoChange={handleBasicInfoChange}
          onLocationChange={handleLocationChange}
          onDateOfBirthChange={(value) => setDateOfBirthInput(value)}
          onToggleOpenToWork={handleToggleOpenToWork}
          onDateInputRef={(node) => {
            dateInputRef.current = node;
          }}
          onImportClick={() => setShowImportDialog(true)}
        />

        <AboutKeywordsCard
          profile={profile}
          form={form}
          editing={editingCard === 'about'}
          keywordsInput={keywordsInput}
          onToggleEdit={() => beginEditingCard('about')}
          onCancel={() => cancelEditingCard('about')}
          onSave={handleSave}
          onBasicInfoChange={handleBasicInfoChange}
          onKeywordsChange={(value) => setKeywordsInput(value)}
        />

        <section className="rounded-[1.75rem] border border-base-300/70 bg-gradient-to-br from-base-100/95 via-base-100/88 to-primary/5 p-4 shadow-lg backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Profil detaljer</p>
              <h3 className="text-2xl font-semibold tracking-tight text-base-content">Byg profilen videre</h3>
              <p className="max-w-2xl text-sm leading-6 text-base-content/68">
                Vælg det område, du vil opdatere nu. Hver sektion er gjort mere overskuelig på både mobil og desktop.
              </p>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Profil detaljer navigation">
              {detailTabs.map(({ key, label, note, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={[
                    "flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200",
                    detailsTab === key
                      ? "border-primary/25 bg-base-100 text-base-content shadow-lg shadow-primary/10"
                      : "border-base-300/70 bg-base-100/70 text-base-content/72 hover:border-primary/15 hover:bg-base-100/90",
                  ].join(" ")}
                  onClick={() => switchDetailsTab(key)}
                  aria-pressed={detailsTab === key}
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-medium text-base-content">{label}</span>
                    <span className="block text-xs leading-5 text-base-content/55">{note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {detailsTab === "experiences" && (
          <ExperiencesCard
            experiences={experiences}
            editing={editingCard === 'experiences'}
            onToggleEdit={() => beginEditingCard('experiences')}
            onCancel={() => cancelEditingCard('experiences')}
            onSave={handleSave}
            onAdd={handleExperienceAdd}
            onUpdate={handleExperienceUpdate}
            onDelete={handleExperienceDelete}
          />
        )}

        {detailsTab === "educations" && (
          <EducationsCard
            educations={educations}
            editing={editingCard === 'educations'}
            onToggleEdit={() => beginEditingCard('educations')}
            onCancel={() => cancelEditingCard('educations')}
            onSave={handleSave}
            onAdd={handleEducationAdd}
            onUpdate={handleEducationUpdate}
            onDelete={handleEducationDelete}
          />
        )}

        {detailsTab === "skills" && (
          <SkillsCard
            skills={skills}
            editing={editingCard === 'skills'}
            onToggleEdit={() => beginEditingCard('skills')}
            onCancel={() => cancelEditingCard('skills')}
            onSave={handleSave}
            onAdd={handleSkillAdd}
            onUpdate={handleSkillUpdate}
            onDelete={handleSkillDelete}
          />
        )}
      </div>

      {toast && (
        <div className="toast toast-end z-50">
          <div className="rounded-[1.25rem] border border-success/25 bg-base-100/94 px-4 py-3 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 text-sm text-base-content">
              <CheckCircleIcon className="h-5 w-5 text-success" aria-hidden="true" />
              <span>{toast}</span>
            </div>
          </div>
        </div>
      )}

      {showImportDialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl rounded-[1.75rem] border border-base-300/70 bg-base-100/96 p-0 shadow-2xl">
            <div className="flex items-start justify-between border-b border-base-300/70 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">CV import</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-base-content">Importér dit CV til profilen</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-full"
                aria-label="Luk"
                onClick={() => setShowImportDialog(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <ImportCvCard
                accessToken={token ?? ""}
                onImported={() => {
                  setShowImportDialog(false);
                  setImportRefresh((n) => n + 1);
                  showToast("CV importeret");
                }}
              />
            </div>
          </div>
          <div className="modal-backdrop bg-slate-950/35 backdrop-blur-sm" onClick={() => setShowImportDialog(false)} aria-hidden />
        </div>
      )}
    </div>
  );
};

export default UserProfileComponent;