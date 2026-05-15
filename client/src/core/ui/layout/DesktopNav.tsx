import { BarChart3, List, Map, Palmtree, Plane, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { NavView } from "./layout.utils";
import { headerNavBtnClass, headerNavLinkClass } from "./layout.styles";

interface DesktopNavProps {
  readonly activeView: NavView | null;
  readonly onViewClick: (view: NavView) => void;
  readonly langPrefix: string;
  readonly pathname: string;
}

export function DesktopNav({ activeView, onViewClick, langPrefix, pathname }: DesktopNavProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex gap-1 rounded-md bg-surface-4 p-1">
        <button
          onClick={() => {
            onViewClick("list");
          }}
          className={headerNavBtnClass(activeView === "list")}
        >
          <List size={16} />
          {t("views.list")}
        </button>
        <button
          onClick={() => {
            onViewClick("map");
          }}
          className={headerNavBtnClass(activeView === "map")}
        >
          <Map size={16} />
          {t("views.map")}
        </button>
        <button
          onClick={() => {
            onViewClick("compare");
          }}
          className={headerNavBtnClass(activeView === "compare")}
        >
          <BarChart3 size={16} />
          {t("views.compare")}
        </button>
        <Link
          to={`${langPrefix}/nomad-visas`}
          className={headerNavLinkClass(pathname.endsWith("/nomad-visas"))}
        >
          <Plane size={16} />
          {t("nav.nomadVisas")}
        </Link>
        <Link
          to={`${langPrefix}/budget-matcher`}
          className={headerNavLinkClass(pathname.endsWith("/budget-matcher"))}
        >
          <Wallet size={16} />
          {t("nav.budgetMatcher")}
        </Link>
        <Link
          to={`${langPrefix}/tourism`}
          className={headerNavLinkClass(pathname.endsWith("/tourism"))}
        >
          <Palmtree size={16} />
          {t("nav.tourism", "Tourism")}
        </Link>
      </div>

      <a
        href="https:/github.com/oleksandr-zhynzher/nomad-lens"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-slate-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http:/www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        {t("nav.github")}
      </a>
    </>
  );
}
