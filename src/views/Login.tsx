import React, { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import { createAuthClient, createApiClient } from "../helpers/ApiFactory";
import { AuthenticationApi, type LoginRequest } from "../findjobnu-auth";
import { ProfileApi } from "../findjobnu-api";
import { prepareLinkedInLogin } from "../helpers/oauth";
import Seo from "../components/Seo";

const api = createAuthClient(AuthenticationApi);

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const redirectTarget = searchParams.get("redirect");

  const featurePoints = [
    "Fortsæt med gemte jobs, anbefalinger og notifikationer ét sted.",
    "Gå direkte videre til din profil og hold styr på din jobsøgning.",
    "Brug LinkedIn eller e-mail, alt efter hvad der passer bedst lige nu.",
  ];

  const stats = [
    { label: "Adgang", value: "1 login", note: "til hele din profil" },
    { label: "Overblik", value: "Samlet", note: "jobs, alerts og data" },
    { label: "Tempo", value: "Hurtigt", note: "kom videre uden friktion" },
  ];

  const inputClass = "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
  const labelTextClass = "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";
  const helperTextClass = "text-sm leading-6 text-base-content/60";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "email" && emailTouched) {
      setEmailInvalid(!e.target.checkValidity());
    }
    if (name === "password" && passwordTouched) {
      setPasswordInvalid(!e.target.checkValidity());
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "email") {
      setEmailTouched(true);
      setEmailInvalid(!e.target.checkValidity());
    }
    if (name === "password") {
      setPasswordTouched(true);
      setPasswordInvalid(!e.target.checkValidity());
    }
  };

  const linkedInLoginUrl = useMemo(() => {
    const baseUrl = import.meta.env.VITE_LINKEDIN_LOGIN_URL ?? "https://auth.findjob.nu/api/auth/linkedin/login";
    if (redirectTarget) {
      const url = new URL(baseUrl);
      url.searchParams.set("redirect", redirectTarget);
      return url.toString();
    }
    return baseUrl;
  }, [redirectTarget]);

  const handleLinkedInLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const redirect = prepareLinkedInLogin(linkedInLoginUrl);
    globalThis.location.href = redirect;
  };

  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) {
      // mark fields as touched and update invalid states to display hints appropriately
      setEmailTouched(true);
      setPasswordTouched(true);
      if (emailRef.current) setEmailInvalid(!emailRef.current.checkValidity());
      if (passwordRef.current) setPasswordInvalid(!passwordRef.current.checkValidity());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ loginRequest: form });
      setUser({
        email: res.email ?? "",
        accessToken: res.accessToken ?? "",
        refreshToken: res.refreshToken ?? "",
        userId: res.userId ?? "",
        accessTokenExpiration: res.accessTokenExpiration?.toISOString() ?? "",
      });

      //Attempt to cache SavedJobs
      const userProfileApi = createApiClient(ProfileApi, res.accessToken);

      try {
        const savedJobsResponse = await userProfileApi.getSavedJobsByUserId({ userId: res.userId ?? "" });
        const savedJobsArray = savedJobsResponse.items?.map(job => job.jobID?.toString()) ?? [];
        localStorage.setItem("savedJobsArray", savedJobsArray.join(","));
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
      }
      
      const redirectTo = redirectTarget || "/";
      globalThis.location.href = redirectTo;
    } catch (err: unknown) {
      setError("Login fejlede. Tjek dine oplysninger.");
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Log ind | FindJob.nu"
        description="Log ind på FindJob.nu for at se dine jobanbefalinger, gemte jobs og profil."
        path="/login"
      />
      <div className="not-prose">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:p-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                Log ind på FindJob.nu
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.9rem]">
                  Velkommen tilbage til din jobsøgning
                </h1>
                <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                  Hop direkte ind i dine gemte jobs, anbefalinger og profilindstillinger med en loginoplevelse, der er gjort tydeligere, roligere og bedre på mobil.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-base-content">{item.value}</p>
                    <p className="text-sm text-base-content/65">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {featurePoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {redirectTarget && (
                <div className="rounded-[1.35rem] border border-primary/15 bg-base-100/78 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-base-content">Du bliver sendt videre bagefter</p>
                      <p className="mt-1 text-sm leading-6 text-base-content/68">
                        Når du logger ind, går du direkte tilbage til den side, du kom fra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="btn btn-success min-h-12 rounded-2xl px-6 shadow-lg shadow-success/20">
                  Opret bruger
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-base-300/80 bg-base-100/75 px-4 py-3 text-sm text-base-content/68 shadow-sm">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  Dine loginoplysninger håndteres sikkert.
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-xl sm:p-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Adgang til din konto</p>
                <h2 className="text-2xl font-semibold tracking-tight text-base-content">Log ind</h2>
                <p className="text-base leading-7 text-base-content/70">
                  Se gemte job, fortsæt din profil og hold styr på dine anbefalinger fra samme sted.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4" ref={formRef}>
                <fieldset className="grid gap-4">
                  <legend className="sr-only">Log ind</legend>

                  <div className="form-control gap-2">
                    <label className="label p-0" htmlFor="email">
                      <span className={labelTextClass}>Email</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="din@email.dk"
                      className={`${inputClass} ${emailTouched && emailInvalid ? "input-error" : ""}`.trim()}
                      value={form.email ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      ref={emailRef}
                      autoComplete="email"
                      required
                      aria-invalid={emailTouched && emailInvalid ? "true" : "false"}
                    />
                    {emailTouched && emailInvalid && (
                      <div className="validator-hint text-error text-sm">Indtast en gyldig e-mailadresse</div>
                    )}
                  </div>

                  <div className="form-control gap-2">
                    <label className="label p-0" htmlFor="password">
                      <span className={labelTextClass}>Adgangskode</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Din adgangskode"
                      className={`${inputClass} ${passwordTouched && passwordInvalid ? "input-error" : ""}`.trim()}
                      value={form.password ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      ref={passwordRef}
                      autoComplete="current-password"
                      minLength={8}
                      pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"
                      title="Mindst 8 tegn, inkl. tal, små og store bogstaver"
                      required
                      aria-invalid={passwordTouched && passwordInvalid ? "true" : "false"}
                    />
                    {passwordTouched && passwordInvalid && (
                      <p className="validator-hint text-error text-sm">
                        Mindst 8 tegn, inklusive
                        <br />Mindst ét tal
                        <br />Mindst ét lille bogstav
                        <br />Mindst ét stort bogstav
                      </p>
                    )}
                    <p className={helperTextClass}>Brug den samme adgangskode, som du oprettede kontoen med.</p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary min-h-12 w-full rounded-2xl px-6 shadow-lg shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? "Logger ind..." : "Log ind"}
                  </button>

                  {error && (
                    <div className="alert alert-error rounded-2xl">
                      <span>{error}</span>
                    </div>
                  )}
                </fieldset>
              </form>

              <div className="divider my-6 text-sm text-base-content/45">eller fortsæt med</div>

              <button
                type="button"
                className="btn min-h-12 w-full rounded-2xl border-[#0059b3] bg-[#0967C2] text-white shadow-lg shadow-[#0967C2]/20 hover:border-[#0059b3] hover:bg-[#0b5cad]"
                onClick={handleLinkedInLogin}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z" /></svg>
                LinkedIn
              </button>

              <div className="mt-6 rounded-[1.35rem] border border-base-300/70 bg-base-100/72 p-4 shadow-sm">
                <p className="text-sm font-semibold text-base-content">Har du ikke en konto endnu?</p>
                <p className="mt-1 text-sm leading-6 text-base-content/68">
                  Opret en profil og få adgang til gemte jobs, jobagenter og personlige anbefalinger.
                </p>
                <Link to="/register" className="btn btn-success mt-4 min-h-11 w-full rounded-2xl">
                  Opret bruger
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;