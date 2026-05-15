import { List, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CountryDetailPanelFooterProps {
  readonly langPrefix: string;
  readonly countryCode: string;
  readonly onClose: () => void;
  readonly onViewInList: () => void;
}

export function CountryDetailPanelFooter({
  langPrefix,
  countryCode,
  onClose,
  onViewInList,
}: CountryDetailPanelFooterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border px-5 py-4">
      <button
        onClick={() => {
          onViewInList();
          onClose();
        }}
        className="interactive-cta-link flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
      >
        <List size={14} />
        {t("countryDetail.viewInList")}
      </button>
      <Link
        to={`${langPrefix}/country/${countryCode}`}
        onClick={onClose}
        className="interactive-cta-link flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim no-underline transition-colors"
      >
        <User size={14} />
        {t("countryPage.viewProfile", "View Country Details")}
      </Link>
    </div>
  );
}
