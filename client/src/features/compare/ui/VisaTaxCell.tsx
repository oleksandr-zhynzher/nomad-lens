import type React from "react";
import { useTranslation } from "react-i18next";
import { TAX_STATUS_COLORS } from "@core/constants";
import type { VisaSlotLangProps } from "@features/compare/utils";
import { getLocalizedVisa } from "@features/compare/utils";

export function VisaTaxCell({ slot, lang }: VisaSlotLangProps) {
  const { t } = useTranslation();
  const { visa, loc } = getLocalizedVisa(slot.country, lang);
  const status = visa.tax.status;
  const colors = TAX_STATUS_COLORS[status] ?? { bg: "#2A2A2A", text: "#9E9E9E" };
  const taxStatusLabels: Record<typeof status, string> = {
    exempt: t("countryPage.visa.taxExempt"),
    special: t("countryPage.visa.taxSpecial"),
    standard: t("countryPage.visa.taxStandard"),
  };
  const label = taxStatusLabels[status];
  const taxNotes = loc?.tax?.notes ?? visa.tax.notes;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="rounded-full bg-[var(--tax-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--tax-text)]"
          style={{ "--tax-bg": colors.bg, "--tax-text": colors.text } as React.CSSProperties}
        >
          {label}
        </span>
        {visa.tax.rate == null ? null : (
          <span
            className="font-mono text-[16px] font-semibold text-[var(--tax-text)]"
            style={{ "--tax-text": colors.text } as React.CSSProperties}
          >
            {visa.tax.rate}%
          </span>
        )}
      </div>
      {taxNotes !== "" ? (
        <span className="max-w-[260px] text-center text-[11px] leading-[1.4] text-dim">
          {taxNotes}
        </span>
      ) : null}
    </div>
  );
}
