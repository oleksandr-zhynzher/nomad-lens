import { BarChart3, List, Map, Palmtree, Plane, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { mobileNavBtnClass, mobileNavLinkClass } from "./layout.styles";
import { type NavView, viewPath } from "./layout.utils";

interface MobileNavGridProps {
  readonly activeView: NavView | null;
  readonly langPrefix: string;
  readonly pathname: string;
  readonly onClose: () => void;
}

export function MobileNavGrid({ activeView, langPrefix, pathname, onClose }: MobileNavGridProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      <Link
        to={viewPath("list", langPrefix)}
        onClick={() => {
          onClose();
        }}
        className={mobileNavBtnClass(activeView === "list")}
      >
        <List size={16} />
        {t("views.list")}
      </Link>
      <Link
        to={viewPath("map", langPrefix)}
        onClick={() => {
          onClose();
        }}
        className={mobileNavBtnClass(activeView === "map")}
      >
        <Map size={16} />
        {t("views.map")}
      </Link>
      <Link
        to={viewPath("compare", langPrefix)}
        onClick={() => {
          onClose();
        }}
        className={mobileNavBtnClass(activeView === "compare")}
      >
        <BarChart3 size={16} />
        {t("views.compare")}
      </Link>
      <Link
        to={`${langPrefix}/nomad-visas`}
        onClick={onClose}
        className={mobileNavLinkClass(pathname.endsWith("/nomad-visas"))}
      >
        <Plane size={16} />
        {t("nav.nomadVisas")}
      </Link>
      <Link
        to={`${langPrefix}/budget-matcher`}
        onClick={onClose}
        className={mobileNavLinkClass(pathname.endsWith("/budget-matcher"))}
      >
        <Wallet size={16} />
        {t("nav.budgetMatcher")}
      </Link>
      <Link
        to={`${langPrefix}/tourism`}
        onClick={onClose}
        className={mobileNavLinkClass(pathname.endsWith("/tourism"))}
      >
        <Palmtree size={16} />
        {t("nav.tourism", "Tourism")}
      </Link>
    </div>
  );
}
