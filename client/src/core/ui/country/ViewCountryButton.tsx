import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ViewCountryButtonProps {
  to: string;
}

/** "View Country Details" CTA link used at the bottom of country cards and detail panels. */
export function ViewCountryButton({ to }: ViewCountryButtonProps) {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className="interactive-cta-link mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim no-underline transition-colors"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <User size={14} />
      {t("countryPage.viewProfile", "View Country Details")}
    </Link>
  );
}
