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
      className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors"
      style={{
        display: "flex",
        height: "40px",
        backgroundColor: "transparent",
        border: "1px solid #333333",
        borderRadius: "6px",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--color-accent-dim)",
        textDecoration: "none",
        marginTop: "16px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <User size={14} />
      {t("countryPage.viewProfile", "View Country Details")}
    </Link>
  );
}
