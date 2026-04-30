import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { AuthenticationApi } from "../findjobnu-auth";
import { createAuthClient } from "../helpers/ApiFactory";
import { useUser } from "../context/UserContext.shared";

export type SettingsCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone?: "default" | "danger";
};

const SettingsCard: React.FC<SettingsCardProps> = ({ eyebrow, title, description, children, icon: Icon, tone = "default" }) => (
  <div
    className={[
      "relative overflow-hidden rounded-[1.75rem] border p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-42px_rgba(15,23,42,0.45)] sm:p-6",
      tone === "danger"
        ? "border-error/18 bg-gradient-to-br from-base-100 via-error/5 to-secondary/8"
        : "border-base-300/70 bg-gradient-to-br from-base-100/95 via-base-100/88 to-primary/5",
    ].join(" ")}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_58%)]" />
    <div className="relative space-y-5">
      <div className="flex items-start gap-4">
        <div className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
          tone === "danger"
            ? "border-error/15 bg-error/10 text-error"
            : "border-primary/15 bg-primary/10 text-primary",
        ].join(" ")}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className={[
            "text-xs font-semibold uppercase tracking-[0.22em]",
            tone === "danger" ? "text-error/75" : "text-primary/80",
          ].join(" ")}>{eyebrow}</p>
          <h2 className={[
            "text-2xl font-semibold tracking-tight",
            tone === "danger" ? "text-error" : "text-base-content",
          ].join(" ")}>{title}</h2>
          <p className="text-sm leading-6 text-base-content/68">{description}</p>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const SettingsPanel: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const userId = user?.userId ?? "";
  const token = user?.accessToken ?? "";

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  const authApi = useMemo(() => createAuthClient(AuthenticationApi, token), [token]);

  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLockout, setLoadingLockout] = useState(false);
  const inputClass = "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
  const labelTextClass = "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";

  const resetMessages = () => {
    setStatus(null);
    setError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoadingEmail(true);
    try {
      await authApi.changeEmail({
        changeEmailRequest: {
          userId,
          newEmail: emailForm.newEmail.trim(),
          currentPassword: emailForm.currentPassword,
        },
      });
      setStatus("Vi har sendt en bekræftelsesmail til den nye adresse.");
      setEmailForm({ newEmail: "", currentPassword: "" });
    } catch (err) {
      setError("Kunne ikke opdatere e-mail. Tjek adgangskode og e-mail.");
      console.warn(err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoadingPassword(true);
    try {
      await authApi.changePassword({
        changePasswordRequest: {
          userId,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setStatus("Adgangskode opdateret.");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError("Kunne ikke opdatere adgangskode. Tjek felterne.");
      console.warn(err);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLockout = async () => {
    const confirmed = globalThis.confirm("Are you sure you want to lock the account temporarily?");
    if (!confirmed) return;
    resetMessages();
    setLoadingLockout(true);
    try {
      await authApi.lockoutUser({ body: userId });
      setStatus("Kontoen er låst. Log ind igen for at låse op.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessTokenExpiration");
      setUser(null);
      navigate("/login");
    } catch (err) {
      setError("Kunne ikke låse kontoen.");
      console.warn(err);
    } finally {
      setLoadingLockout(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_300px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Kontoindstillinger
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                Hold adgang, sikkerhed og kontaktoplysninger samlet
              </h2>
              <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
                Indstillingerne er gjort mere rolige og tydelige, så det er nemmere at opdatere konto-oplysninger uden at være i tvivl om konsekvensen af hvert valg.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Skift e-mail med tydelig bekræftelse og samme sikre flow.",
                "Opdater adgangskode uden at forlade profilområdet.",
                "Lås kontoen midlertidigt, hvis du vil pause adgang til den.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Sikkerhedsnotat</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Fokus</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">Konto</p>
                <p className="text-sm leading-6 text-base-content/65">e-mail, adgang og låsning styres ét sted</p>
              </div>
              <div className="rounded-[1.25rem] border border-primary/15 bg-primary/8 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-base-content/68">
                    Ændringer her påvirker kun konto-adgang og sikkerhed, ikke dine gemte job eller profilindhold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SettingsCard
          eyebrow="Kontakt"
          title="Opdater e-mail"
          description="Skift adressen, du bruger til login og bekræftelser. Vi sender en bekræftelse til den nye e-mail, før ændringen træder i kraft."
          icon={EnvelopeIcon}
        >
          <form className="flex flex-col" onSubmit={handleEmailSubmit}>
            <fieldset className="grid gap-4">
              <legend className="sr-only">Opdater e-mail</legend>
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="newEmail"><span className={labelTextClass}>Ny e-mail</span></label>
              <input
                id="newEmail"
                className={inputClass}
                type="email"
                placeholder="Ny e-mail"
                value={emailForm.newEmail}
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                required
              />
              </div>
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="currentPassword"><span className={labelTextClass}>Nuværende adgangskode</span></label>
              <input
                id="currentPassword"
                className={inputClass}
                type="password"
                placeholder="Nuværende adgangskode"
                value={emailForm.currentPassword}
                onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
                minLength={6}
              />
              </div>
              <button className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20" type="submit" disabled={loadingEmail}>
                {loadingEmail ? "Opdaterer..." : "Send bekræftelse"}
              </button>
            </fieldset>
          </form>
        </SettingsCard>

        <SettingsCard
          eyebrow="Sikkerhed"
          title="Opdater adgangskode"
          description="Vælg en ny adgangskode, hvis du vil styrke kontosikkerheden eller udskifte en kode, du ikke længere vil bruge."
          icon={KeyIcon}
        >
          <form className="flex flex-col" onSubmit={handlePasswordSubmit}>
            <fieldset className="grid gap-4">
              <legend className="sr-only">Opdater adgangskode</legend>
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="oldPassword"><span className={labelTextClass}>Nuværende adgangskode</span></label>
              <input
                id="oldPassword"
                className={inputClass}
                type="password"
                placeholder="Nuværende adgangskode"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                required
                minLength={6}
              />
              </div>
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="newPassword"><span className={labelTextClass}>Ny adgangskode</span></label>
              <input
                id="newPassword"
                className={inputClass}
                type="password"
                placeholder="Ny adgangskode"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              </div>
              <button className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20" type="submit" disabled={loadingPassword}>
                {loadingPassword ? "Opdaterer..." : "Gem ny adgangskode"}
              </button>
            </fieldset>
          </form>
        </SettingsCard>

        <SettingsCard
          eyebrow="Pause adgang"
          title="Lås konto"
          description="Brug dette, hvis du midlertidigt vil lukke adgangen til kontoen. Du skal logge ind igen bagefter for at låse den op."
          icon={LockClosedIcon}
          tone="danger"
        >
          <p className="mb-4 text-sm text-base-content/70">Låser kontoen indtil du logger ind igen. Brugbar hvis du vil pause adgang.</p>
          <button className="btn btn-ghost min-h-12 rounded-2xl border border-error/20 bg-error/10 px-6 text-error hover:bg-error/15" onClick={handleLockout} disabled={loadingLockout}>
            {loadingLockout ? "Låser..." : "Lås konto"}
          </button>
        </SettingsCard>
      </div>

      {(status || error) && (
        <div className={`alert rounded-[1.35rem] shadow-sm ${status ? "alert-success" : "alert-error"}`}>
          <span>{status ?? error}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
