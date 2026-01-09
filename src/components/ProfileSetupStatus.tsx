import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface SetupState {
  loading: boolean;
  profileFound: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasTopKeywords: boolean;
  hasJobAgent: boolean;
  hasConnections: boolean;
}

interface ProfileSetupStatusProps {
  userId: string;
  setupState: SetupState;
}

const StatusRow: React.FC<{ label: string; done: boolean; hint?: string }> = ({ label, done, hint }) => (
  <div className="flex items-start gap-3">
    {done ? (
      <CheckCircleIcon className="w-5 h-5 text-success mt-0.5" aria-hidden="true" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-base-300 mt-0.5" aria-hidden="true" />
    )}
    <div>
      <p className="font-medium">{label}</p>
      {hint && <p className="text-sm text-base-content/70">{hint}</p>}
    </div>
  </div>
);

const ProfileSetupStatus: React.FC<ProfileSetupStatusProps> = ({ userId, setupState }) => {
  return (
    <div className="p-4 sm:p-5 ">
      {userId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-base-content/70">Status for anbefalinger</p>
              <p className="text-lg font-semibold">{setupState.loading ? "Opdaterer..." : "Klar til bedre matches"}</p>
            </div>
            <span className={`badge ${setupState.hasSkills && setupState.hasTopKeywords ? "badge-success" : ""}`}>
              {setupState.hasSkills && setupState.hasTopKeywords ? "Prioriteret" : "Udfyld færdigheder"}
            </span>
          </div>

          <div className="space-y-3">
            <StatusRow
              label="Profil + erfaring/uddannelse/færdigheder"
              done={setupState.profileFound && (setupState.hasExperience || setupState.hasEducation || setupState.hasSkills)}
              hint="Jo mere du udfylder, desto skarpere matcher vi."
            />
            <StatusRow
              label="Færdigheder og top kompetencer"
              done={setupState.hasSkills && setupState.hasTopKeywords}
              hint="Dette vægter højest i vores anbefalinger."
            />
            <StatusRow
              label="Jobagent aktiveret"
              done={setupState.hasJobAgent}
              hint="Holder øje for dig og sender nye match."
            />
            <StatusRow
              label="Forbindelser (LinkedIn)"
              done={setupState.hasConnections}
              hint="Importér erfaringer og hold profilen opdateret."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <a className="btn btn-sm btn-primary" href="/profile">Opdatér profil</a>
            <a className="btn btn-sm btn-outline" href="/profile?panel=jobAgent">Åbn jobagent</a>
            <a className="btn btn-sm btn-outline" href="/profile">Tilføj kompetencer</a>
            <a className="btn btn-sm btn-outline" href="/profile?panel=connections">Forbind LinkedIn</a>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold">Log ind for at se din status</p>
          <p className="text-base-content/70">
            Opret en konto, udfyld din profil, og kom tilbage for at se hvordan du står for anbefalingerne.
          </p>
          <div className="flex justify-center gap-3">
            <a className="btn btn-primary" href="/register">Opret bruger</a>
            <a className="btn btn-outline" href="/login">Log ind</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetupStatus;
