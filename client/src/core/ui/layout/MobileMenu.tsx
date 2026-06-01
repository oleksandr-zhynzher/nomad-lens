import { MobileSheet } from "@core/ui/MobileSheet";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { NavView } from "./layout.utils";
import { MobileNavGrid } from "./MobileNavGrid";

interface MobileMenuProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly activeView: NavView | null;
  readonly langPrefix: string;
  readonly pathname: string;
  readonly langSwitchPath: (lang: string) => string;
  readonly currentLangCode: string;
}

export function MobileMenu({
  open,
  onClose,
  activeView,
  langPrefix,
  pathname,
  langSwitchPath,
  currentLangCode,
}: MobileMenuProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <MobileSheet
      open={open}
      title={t("views.viewLabel")}
      closeLabel={t("a11y.closeMenu", "Close menu")}
      onClose={onClose}
    >
      <div className="flex max-h-full flex-col gap-1 overflow-y-auto p-4">
        <p className="mb-1 text-[10px] font-semibold tracking-[1.5px] text-dimmest uppercase">
          {t("views.viewLabel")}
        </p>
        <MobileNavGrid
          activeView={activeView}
          langPrefix={langPrefix}
          pathname={pathname}
          onClose={onClose}
        />

        <div className="flex items-center gap-3 border-b border-[#1E1E1E] py-3">
          {(["en", "ua", "ru"] as const).map((lang) => (
            <Link
              key={lang}
              to={langSwitchPath(lang)}
              onClick={onClose}
              className={`text-[13px] no-underline ${currentLangCode === lang ? "font-bold text-accent-dim" : "font-normal text-dimmer"}`}
            >
              {t(`langSwitcher.${lang}`)}
            </Link>
          ))}
        </div>

        <a
          href="https://github.com/oleksandr-zhynzher/nomad-lens"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 py-3 text-sm text-muted no-underline"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          {t("nav.github")}
        </a>
      </div>
    </MobileSheet>
  );
}
