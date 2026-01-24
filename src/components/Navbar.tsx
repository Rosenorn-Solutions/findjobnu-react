import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext.shared";
import { useTheme } from "../context/ThemeContext";
import { 
  UserCircleIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "da" ? "en" : "da";
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute("lang", newLang);
  };

  const languageSwitchLabel =
    i18n.language === "da" ? t("language.switchToDanish") : t("language.switchToEnglish");

  // Base classes for nav links - min 44px touch target for accessibility
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative py-3 px-2 text-base min-h-[44px] flex items-center transition-colors duration-200 hover:text-primary ${
      isActive ? "font-bold text-primary" : "text-base-content/80"
    } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100 ${
      isActive ? "after:scale-x-100" : ""
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block py-3 px-3 min-h-[44px] flex items-center rounded-lg text-base transition-colors duration-200 hover:bg-base-200 hover:text-primary ${
      isActive ? "font-bold text-primary bg-base-200" : "text-base-content/80"
    }`;

  return (
    <nav className="bg-base-100/80 backdrop-blur-md shadow-lg mb-5 sticky top-0 z-50 transition-colors border-b border-base-content/10">
      <div className="max-w-350 w-full mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/findjobnu-logo.svg" alt="FindJob.nu logo" className="h-8 w-8" />
            <span className="text-xl font-bold">FindJob.nu</span>
          </Link>

          {/* Desktop navigation links */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <NavLink className={navLinkClasses} to="/jobsearch">
                <span className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  {t("nav.jobSearch")}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClasses} to="/vaerktoejer">
                <span className="flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-5 h-5" />
                  {t("nav.tools")}
                </span>
              </NavLink>
            </li>
            <li>
              <span
                className="py-3 px-2 text-base min-h-11 flex items-center text-base-content/40 cursor-not-allowed tooltip tooltip-bottom"
                data-tip={t("nav.comingSoon")}
                aria-disabled="true"
              >
                <span className="flex items-center gap-2">
                  <BuildingOffice2Icon className="w-5 h-5" />
                  {t("nav.employer")}
                </span>
              </span>
            </li>
            <li>
              <NavLink className={navLinkClasses} to="/cv">
                <span className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  {t("nav.goodCv")}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClasses} to="/contact">
                <span className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  {t("nav.contact")}
                </span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Right: Language, Theme, Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="relative py-3 px-3 min-h-11 min-w-11 flex items-center justify-center text-base text-base-content/80 transition-colors duration-200 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100"
            aria-label={`${i18n.language} - ${languageSwitchLabel}`}
            title={languageSwitchLabel}
          >
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label={theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight")}
            title={theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight")}
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar flex items-center justify-center"
                aria-label={t("nav.userMenu")}
              >
                <UserCircleIcon className="w-9 h-9 text-primary" />
              </button>
              <ul className="menu menu-md dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow-lg border border-base-content/10 text-base">
                <li>
                  <Link to="/profile" className="flex items-center gap-2 text-base">
                    <UserCircleIcon className="w-5 h-5" />
                    {t("nav.profile")}
                  </Link>
                </li>
                <li>
                  <Link to="/profile/settings" className="flex items-center gap-2 text-base">
                    <Cog6ToothIcon className="w-5 h-5" />
                    {t("nav.settings")}
                  </Link>
                </li>
                <li className="mt-2">
                  <button
                    className="btn btn-error btn-outline w-full"
                    type="button"
                    onClick={handleLogout}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                      {t("nav.logout")}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/register" className="btn btn-success min-h-11">
                <span className="flex items-center gap-2">
                  <UserPlusIcon className="w-5 h-5" />
                  {t("nav.register")}
                </span>
              </Link>
              <Link to="/login" className="btn btn-primary min-h-11">
                <span className="flex items-center gap-2">
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                  {t("nav.login")}
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Right side controls */}
        <div className="md:hidden flex items-center gap-1">
          {/* Language Switcher - Mobile */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label={`${i18n.language} - ${languageSwitchLabel}`}
            title={languageSwitchLabel}
          >
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
          </button>

          {/* Theme Toggle - Mobile */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          {/* Burger Menu */}
          <button
            type="button"
            aria-label={t("nav.openMenu")}
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-base-content/10 bg-base-100/95 backdrop-blur-md shadow-inner">
          <div className="px-4 py-4 flex flex-col gap-2">
            <NavLink
              className={mobileNavLinkClasses}
              to="/jobsearch"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5" />
                {t("nav.jobSearch")}
              </span>
            </NavLink>
            <NavLink
              className={mobileNavLinkClasses}
              to="/vaerktoejer"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5" />
                {t("nav.tools")}
              </span>
            </NavLink>
            <span
              className="py-3 px-3 min-h-11 flex items-center text-base text-base-content/40 cursor-not-allowed"
              aria-disabled="true"
            >
              <span className="flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5" />
                {t("nav.employer")} ({t("nav.comingSoon")})
              </span>
            </span>
            <NavLink
              className={mobileNavLinkClasses}
              to="/cv"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                {t("nav.goodCv")}
              </span>
            </NavLink>
            <NavLink
              className={mobileNavLinkClasses}
              to="/contact"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                {t("nav.contact")}
              </span>
            </NavLink>

            <div className="divider my-2" />

            {user ? (
              <>
                <NavLink
                  className={mobileNavLinkClasses}
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5" />
                    {t("nav.profile")}
                  </span>
                </NavLink>
                <NavLink
                  className={mobileNavLinkClasses}
                  to="/profile/settings"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5" />
                    {t("nav.settings")}
                  </span>
                </NavLink>
                <button
                  type="button"
                  className="btn btn-error btn-outline mt-2"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                    {t("nav.logout")}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/register"
                  className="btn btn-outline btn-success"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <UserPlusIcon className="w-5 h-5" />
                    {t("nav.register")}
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="btn btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    {t("nav.login")}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;