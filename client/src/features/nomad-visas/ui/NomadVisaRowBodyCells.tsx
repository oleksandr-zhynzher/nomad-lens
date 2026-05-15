import { useTranslation } from "react-i18next";
import { scoreColourClass } from "@core/utils";
import type { CountryData } from "@core/models";
import { budgetCellClass } from "./nomad-visas.utils";

type VisaType = NonNullable<CountryData["nomadVisa"]>;

interface NomadVisaRowBodyCellsProps {
  readonly visa: VisaType;
  readonly overallScore: number;
  readonly monthlyBudget: number | null;
  readonly budget: number;
}

export function NomadVisaRowBodyCells({
  visa,
  overallScore,
  monthlyBudget,
  budget,
}: NomadVisaRowBodyCellsProps) {
  const { t } = useTranslation();
  return (
    <>
      <td className="px-3 py-4">
        <span className="text-[13px] text-tertiary">{visa.visaName}</span>
      </td>
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${scoreColourClass(overallScore, "text")}`}
        >
          {overallScore.toFixed(1)}
        </span>
      </td>
      <td className="px-3 py-4 text-right">
        <span className={budgetCellClass(monthlyBudget, budget)}>
          {monthlyBudget == null ? "—" : `$${monthlyBudget.toLocaleString()}`}
        </span>
      </td>
      <td className="px-3 py-4">
        <span className="font-mono text-sm font-semibold text-white">{visa.duration.initial}</span>
        <span className="ml-[3px] text-xs text-dim">{t("countryPage.visa.mo")}</span>
        {visa.duration.maxExtension > 0 ? (
          <span className="ml-1 text-[11px] text-dimmer">+{visa.duration.maxExtension}</span>
        ) : null}
      </td>
      <td className="px-3 py-4 text-right">
        <span
          className={`font-mono text-sm font-semibold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-white"}`}
        >
          {visa.cost.amount === 0
            ? t("countryPage.visa.free", "Free")
            : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
        </span>
      </td>
    </>
  );
}
