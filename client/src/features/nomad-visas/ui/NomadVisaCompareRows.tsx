import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData, NomadVisaDetails } from "@core/models";
import { TAX_STATUS_COLORS } from "@core/constants";
import { Row, Cell, VALUE_MONO, VALUE_TEXT } from "./CompareTableParts";
import { getTaxStatusLabel } from "./nomad-visas.utils";
import { NomadVisaIncomeCompareRow } from "./NomadVisaIncomeCompareRow";
import { NomadVisaApplicationCompareRows } from "./NomadVisaApplicationCompareRows";

type VisaCountry = CountryData & { nomadVisa: NomadVisaDetails };

interface NomadVisaCompareRowsProps {
  readonly selected: VisaCountry[];
  readonly count: number;
}

export function NomadVisaCompareRows({ selected, count }: NomadVisaCompareRowsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Row label={t("nomadVisasPage.table.visaName", "Visa Name")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span className={VALUE_TEXT}>{c.nomadVisa.visaName}</span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisasPage.table.duration", "Duration")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span className={VALUE_MONO}>{c.nomadVisa.duration.initial}</span>
            <span className="ml-[3px] text-xs text-dim">{t("countryPage.visa.mo")}</span>
            {c.nomadVisa.duration.maxExtension > 0 ? (
              <span className="ml-1.5 text-[11px] text-dimmer">
                +{c.nomadVisa.duration.maxExtension} {t("countryPage.visa.mo")}{" "}
                {t("countryPage.visa.extension")}
              </span>
            ) : null}
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisasPage.table.cost", "Cost")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span
              className={`${VALUE_MONO} ${c.nomadVisa.cost.amount === 0 ? "text-[#44CC66]" : "text-white"}`}
            >
              {c.nomadVisa.cost.amount === 0
                ? t("countryPage.visa.free", "Free")
                : `${c.nomadVisa.cost.currency} ${c.nomadVisa.cost.amount.toLocaleString()}`}
            </span>
          </Cell>
        ))}
      </Row>
      <NomadVisaIncomeCompareRow selected={selected} count={count} />
      <Row label={t("nomadVisasPage.table.tax", "Tax Status")}>
        {selected.map((c) => {
          const taxColors = TAX_STATUS_COLORS[c.nomadVisa.tax.status];
          return (
            <Cell key={c.code} count={count}>
              <span
                className="rounded-full bg-[var(--tax-bg)] px-2.5 py-[3px] font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--tax-text)]"
                style={{ "--tax-bg": taxColors.bg, "--tax-text": taxColors.text } as CSSProperties}
              >
                {getTaxStatusLabel(c.nomadVisa.tax.status, t)}
              </span>
            </Cell>
          );
        })}
      </Row>
      <Row label={t("nomadVisaComparePage.taxRate", "Tax Rate")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span className={VALUE_MONO}>
              {c.nomadVisa.tax.rate == null ? "—" : `${c.nomadVisa.tax.rate}%`}
            </span>
          </Cell>
        ))}
      </Row>
      <NomadVisaApplicationCompareRows selected={selected} count={count} />
    </>
  );
}
