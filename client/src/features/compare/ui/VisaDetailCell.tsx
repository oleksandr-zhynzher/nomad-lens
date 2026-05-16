import type { VisaField } from "@core/constants";
import type { VisaSlotLangProps } from "@features/compare/utils";
import { getCurrencySymbol, getLocalizedVisa } from "@features/compare/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { VisaBenefitsCell } from "./VisaBenefitsCell";
import { VisaIncomeCell } from "./VisaIncomeCell";
import { VisaTaxCell } from "./VisaTaxCell";

type DetailField = Extract<
  VisaField,
  "renewable" | "cost" | "income" | "taxStatus" | "online" | "processingTime" | "benefits"
>;

interface VisaDetailCellProps extends VisaSlotLangProps {
  readonly field: DetailField;
}

export function VisaDetailCell({ slot, field, lang }: VisaDetailCellProps) {
  const { t } = useTranslation();
  const { visa, loc } = getLocalizedVisa(slot.country, lang);

  switch (field) {
    case "renewable":
      return visa.duration.renewable ? (
        <CheckCircle2 size={20} className="text-success" />
      ) : (
        <XCircle size={20} className="text-dimmer" />
      );
    case "cost":
      return (
        <span
          className={`font-mono text-[20px] font-semibold ${visa.cost.amount === 0 ? "text-success" : "text-on-surface"}`}
        >
          {visa.cost.amount === 0 ? (
            t("countryPage.free")
          ) : (
            <>
              {getCurrencySymbol(visa.cost.currency)} {visa.cost.amount.toLocaleString()}
            </>
          )}
        </span>
      );
    case "income":
      return <VisaIncomeCell slot={slot} lang={lang} />;
    case "taxStatus":
      return <VisaTaxCell slot={slot} lang={lang} />;
    case "online":
      return visa.applicationProcess.online ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-success" />
          <span className="text-xs text-success">{t("compare.online")}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <XCircle size={16} className="text-muted" />
          <span className="text-xs text-muted">{t("compare.inPerson")}</span>
        </div>
      );
    case "processingTime":
      return (
        <span className="text-[13px] text-on-surface">
          {loc?.applicationProcess?.processingTime ?? visa.applicationProcess.processingTime}
        </span>
      );
    case "benefits":
      return <VisaBenefitsCell slot={slot} lang={lang} />;
  }
}
