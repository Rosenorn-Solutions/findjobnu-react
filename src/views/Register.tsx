import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import { AuthenticationApi, type RegisterRequest } from "../findjobnu-auth";
import { Link } from "react-router-dom";
import { handleApiError } from "../helpers/ErrorHelper";
import { ProfileApi } from "../findjobnu-api";
import { createAuthClient, createApiClient, createProfileSimple } from "../helpers/ApiFactory";
import { prepareLinkedInLogin } from "../helpers/oauth";
import Seo from "../components/Seo";

const api = createAuthClient(AuthenticationApi);

const registerValuePoints = [
  "Byg en profil, du kan vende tilbage til hver gang du søger nyt.",
  "Gem jobs, modtag anbefalinger og kom hurtigere fra fund til ansøgning.",
  "Start med e-mail eller LinkedIn, og fortsæt med profilopsætningen bagefter.",
];

const registerStats = [
  { label: "Profil", value: "1 konto", note: "alt samlet ét sted" },
  { label: "Setup", value: "Få min.", note: "for at komme i gang" },
  { label: "Fokus", value: "Mere", note: "overblik over din jobsøgning" },
];

const inputClass = "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
const labelTextClass = "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";
const helperTextClass = "text-sm leading-6 text-base-content/60";

const validatedFields = ["firstName", "lastName", "email", "password"] as const;

type ValidatedField = (typeof validatedFields)[number];

type FieldStateSetters = {
  touchSetters: Record<ValidatedField, React.Dispatch<React.SetStateAction<boolean>>>;
  invalidSetters: Record<ValidatedField, React.Dispatch<React.SetStateAction<boolean>>>;
  fieldRefs: Record<ValidatedField, React.RefObject<HTMLInputElement | null>>;
};

type RegisterFormPanelProps = {
  form: RegisterRequest;
  loading: boolean;
  error: string | null;
  success: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  firstNameRef: React.RefObject<HTMLInputElement | null>;
  lastNameRef: React.RefObject<HTMLInputElement | null>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
  firstNameTouched: boolean;
  lastNameTouched: boolean;
  emailTouched: boolean;
  passwordTouched: boolean;
  firstNameInvalid: boolean;
  lastNameInvalid: boolean;
  emailInvalid: boolean;
  passwordInvalid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleLinkedInLogin: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type ValidatedInputFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password";
  value: string;
  touched: boolean;
  invalid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  invalidMessage: React.ReactNode;
  helperText?: string;
  autoComplete?: string;
  minLength?: number;
  pattern?: string;
  title?: string;
};

const isValidatedField = (value: string): value is ValidatedField =>
  (validatedFields as readonly string[]).includes(value);

const syncFieldValidity = (
  field: ValidatedField,
  element: HTMLInputElement,
  touchedState: Record<ValidatedField, boolean>,
  invalidSetters: FieldStateSetters["invalidSetters"],
) => {
  if (touchedState[field]) {
    invalidSetters[field](!element.checkValidity());
  }
};

const markFieldTouchedAndValidate = (
  field: ValidatedField,
  element: HTMLInputElement,
  touchSetters: FieldStateSetters["touchSetters"],
  invalidSetters: FieldStateSetters["invalidSetters"],
) => {
  touchSetters[field](true);
  invalidSetters[field](!element.checkValidity());
};

const markInvalidFieldsFromRefs = ({ touchSetters, invalidSetters, fieldRefs }: FieldStateSetters) => {
  for (const field of validatedFields) {
    touchSetters[field](true);
    const element = fieldRefs[field].current;
    if (element) {
      invalidSetters[field](!element.checkValidity());
    }
  }
};

const useRegisterSuccessRedirect = (success: boolean) => {
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      globalThis.location.replace("/profile");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);
};

const RegisterHeroPanel: React.FC = () => (
  <div className="space-y-6">
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
      <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
      Kom hurtigt i gang
    </div>

    <div className="space-y-3">
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.9rem]">
        Opret din konto og byg din jobprofil med bedre overblik
      </h1>
      <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
        Registreringen er gjort mere overskuelig, så du kan komme hurtigt fra oprettelse til profilopsætning, gemte jobs og personlige anbefalinger.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {registerStats.map((item) => (
        <div key={item.label} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-base-content">{item.value}</p>
          <p className="text-sm text-base-content/65">{item.note}</p>
        </div>
      ))}
    </div>

    <div className="space-y-3">
      {registerValuePoints.map((point) => (
        <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <span>{point}</span>
        </div>
      ))}
    </div>

    <div className="rounded-[1.35rem] border border-primary/15 bg-base-100/78 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-base-content">Klar til næste trin</p>
          <p className="mt-1 text-sm leading-6 text-base-content/68">
            Når kontoen er oprettet, sender vi dig videre til profilopsætning, så du kan gøre din profil klar med det samme.
          </p>
        </div>
      </div>
    </div>

    <div className="inline-flex items-center gap-2 rounded-2xl border border-base-300/80 bg-base-100/75 px-4 py-3 text-sm text-base-content/68 shadow-sm">
      <ShieldCheckIcon className="h-5 w-5 text-primary" aria-hidden="true" />
      Din konto og dine oplysninger håndteres sikkert.
    </div>
  </div>
);

const ValidatedInputField: React.FC<ValidatedInputFieldProps> = ({
  id,
  name,
  label,
  placeholder,
  type,
  value,
  touched,
  invalid,
  onChange,
  onBlur,
  inputRef,
  invalidMessage,
  helperText,
  autoComplete,
  minLength,
  pattern,
  title,
}) => (
  <div className="form-control gap-2">
    <label className="label p-0" htmlFor={id}>
      <span className={labelTextClass}>{label}</span>
    </label>
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      className={`${inputClass} ${touched && invalid ? "input-error" : ""}`.trim()}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      ref={inputRef}
      autoComplete={autoComplete}
      required
      minLength={minLength}
      pattern={pattern}
      title={title}
      aria-invalid={touched && invalid ? "true" : "false"}
    />
    {touched && invalid && <div className="validator-hint text-error text-sm">{invalidMessage}</div>}
    {helperText && <p className={helperTextClass}>{helperText}</p>}
  </div>
);

const RegisterStatusMessages: React.FC<{ error: string | null; success: boolean }> = ({ error, success }) => (
  <>
    {error && (
      <div className="alert alert-error rounded-2xl">
        <span>{error}</span>
      </div>
    )}

    {success && (
      <div className="alert alert-success rounded-2xl">
        <div className="flex flex-col gap-2">
          <span>
            Bruger oprettet! Tjek din E-mail for at bekræfte din konto. Du kan allerede nu redigere din{" "}
            <Link to="/profile" className="link link-primary" onClick={() => globalThis.location.replace("/profile")}>profil</Link>.
          </span>
          <span className="flex items-center gap-2">
            <span className="loading loading-spinner loading-md"></span>
            <span>Du bliver omdirigeret til profilopsætning...</span>
          </span>
        </div>
      </div>
    )}
  </>
);

const RegisterFormPanel: React.FC<RegisterFormPanelProps> = ({
  form,
  loading,
  error,
  success,
  formRef,
  firstNameRef,
  lastNameRef,
  emailRef,
  passwordRef,
  firstNameTouched,
  lastNameTouched,
  emailTouched,
  passwordTouched,
  firstNameInvalid,
  lastNameInvalid,
  emailInvalid,
  passwordInvalid,
  handleChange,
  handleBlur,
  handleSubmit,
  handleLinkedInLogin,
}) => (
  <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-xl sm:p-6">
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Ny konto</p>
      <h2 className="text-2xl font-semibold tracking-tight text-base-content">Opret bruger</h2>
      <p className="text-base leading-7 text-base-content/70">
        Start med dine grundoplysninger, og fortsæt derefter direkte til profilopsætning og anbefalinger.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="mt-6 grid gap-4" ref={formRef}>
      <fieldset className="grid gap-4">
        <legend className="sr-only">Opret bruger</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <ValidatedInputField
            id="firstName"
            name="firstName"
            label="Fornavn"
            placeholder="Jens"
            type="text"
            value={form.firstName ?? ""}
            touched={firstNameTouched}
            invalid={firstNameInvalid}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={firstNameRef}
            autoComplete="given-name"
            minLength={2}
            pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
            title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            invalidMessage="Mindst 2 bogstaver"
          />

          <ValidatedInputField
            id="lastName"
            name="lastName"
            label="Efternavn"
            placeholder="Jensen"
            type="text"
            value={form.lastName ?? ""}
            touched={lastNameTouched}
            invalid={lastNameInvalid}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={lastNameRef}
            autoComplete="family-name"
            minLength={2}
            pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
            title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            invalidMessage="Mindst 2 bogstaver"
          />
        </div>

        <ValidatedInputField
          id="email"
          name="email"
          label="Email"
          placeholder="jens@email.dk"
          type="email"
          value={form.email ?? ""}
          touched={emailTouched}
          invalid={emailInvalid}
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={emailRef}
          autoComplete="email"
          invalidMessage="Indtast en gyldig e-mailadresse"
        />

        <ValidatedInputField
          id="password"
          name="password"
          label="Adgangskode"
          placeholder="Vælg en sikker adgangskode"
          type="password"
          value={form.password ?? ""}
          touched={passwordTouched}
          invalid={passwordInvalid}
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={passwordRef}
          autoComplete="new-password"
          minLength={8}
          pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Mindst 8 tegn, inkl. tal, små og store bogstaver"
          invalidMessage={(
            <>
              Mindst 8 tegn, inklusive
              <br />Mindst ét tal
              <br />Mindst ét lille bogstav
              <br />Mindst ét stort bogstav
            </>
          )}
          helperText="Brug mindst 8 tegn med både små og store bogstaver samt et tal."
        />

        <button
          type="submit"
          className="btn btn-success min-h-12 w-full rounded-2xl px-6 shadow-lg shadow-success/20"
          disabled={loading}
        >
          {loading ? "Opretter..." : "Opret konto"}
        </button>

        <button
          type="button"
          className="btn min-h-12 w-full rounded-2xl border-[#0059b3] bg-[#0967C2] text-white shadow-lg shadow-[#0967C2]/20 hover:border-[#0059b3] hover:bg-[#0b5cad]"
          onClick={handleLinkedInLogin}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
          LinkedIn
        </button>

        <RegisterStatusMessages error={error} success={success} />
      </fieldset>
    </form>

    <div className="divider my-6 text-sm text-base-content/45">eller gå videre til login</div>

    <Link to="/login" className="btn btn-primary min-h-11 w-full rounded-2xl">
      Log ind
      <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
    </Link>
  </div>
);

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ email: "", password: "", phone: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [firstNameInvalid, setFirstNameInvalid] = useState(false);
  const [lastNameInvalid, setLastNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const touchedState: Record<ValidatedField, boolean> = {
    firstName: firstNameTouched,
    lastName: lastNameTouched,
    email: emailTouched,
    password: passwordTouched,
  };

  const touchSetters: Record<ValidatedField, React.Dispatch<React.SetStateAction<boolean>>> = {
    firstName: setFirstNameTouched,
    lastName: setLastNameTouched,
    email: setEmailTouched,
    password: setPasswordTouched,
  };

  const invalidSetters: Record<ValidatedField, React.Dispatch<React.SetStateAction<boolean>>> = {
    firstName: setFirstNameInvalid,
    lastName: setLastNameInvalid,
    email: setEmailInvalid,
    password: setPasswordInvalid,
  };

  const fieldRefs: Record<ValidatedField, React.RefObject<HTMLInputElement | null>> = {
    firstName: firstNameRef,
    lastName: lastNameRef,
    email: emailRef,
    password: passwordRef,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (isValidatedField(name)) {
      syncFieldValidity(name, e.target, touchedState, invalidSetters);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (isValidatedField(name)) {
      markFieldTouchedAndValidate(name, e.target, touchSetters, invalidSetters);
    }
  };

  const linkedInLoginUrl = useMemo(() => (
    import.meta.env.VITE_LINKEDIN_LOGIN_URL ?? "https://auth.findjob.nu/api/auth/linkedin/login"
  ), []);

  const handleLinkedInLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const redirect = prepareLinkedInLogin(linkedInLoginUrl);
    globalThis.location.href = redirect;
  };

  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) {
      markInvalidFieldsFromRefs({ touchSetters, invalidSetters, fieldRefs });
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.register({ registerRequest: form });
      setUser({
        email: res.email ?? "",
        accessToken: res.accessToken ?? "",
        refreshToken: res.refreshToken ?? "",
        userId: res.userId ?? "",
        accessTokenExpiration: res.accessTokenExpiration?.toISOString() ?? "",
      });

      const upApi = createApiClient(ProfileApi, res.accessToken);
      await createProfileSimple(upApi, {
        userId: res.userId ?? "",
        fullName: `${form.firstName ?? ""} ${form.lastName ?? ""}`.trim(),
        email: form.email ?? undefined,
        phone: form.phone ?? undefined,
        summary: undefined,
      });

      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = await handleApiError(err);
      setError("Registrering fejlede. " + (apiErr?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  useRegisterSuccessRedirect(success);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Opret bruger | FindJob.nu"
        description="Opret en konto på FindJob.nu for at gemme jobs, aktivere jobagenter og få personlige anbefalinger."
        path="/register"
      />
      <div className="not-prose">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:p-8">
            <RegisterHeroPanel />
            <RegisterFormPanel
              form={form}
              loading={loading}
              error={error}
              success={success}
              formRef={formRef}
              firstNameRef={firstNameRef}
              lastNameRef={lastNameRef}
              emailRef={emailRef}
              passwordRef={passwordRef}
              firstNameTouched={firstNameTouched}
              lastNameTouched={lastNameTouched}
              emailTouched={emailTouched}
              passwordTouched={passwordTouched}
              firstNameInvalid={firstNameInvalid}
              lastNameInvalid={lastNameInvalid}
              emailInvalid={emailInvalid}
              passwordInvalid={passwordInvalid}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
              handleLinkedInLogin={handleLinkedInLogin}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;