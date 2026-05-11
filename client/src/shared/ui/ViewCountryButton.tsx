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
      className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors h-10 bg-transparent border border-border rounded-md text-[13px] font-medium text-accent-dim no-underline mt-4"
      onClick={(e) => e.stopPropagation()}
    >
      <User size={14} />
      {t("countryPage.viewProfile", "View Country Details")}
    </Link>
  );
}
