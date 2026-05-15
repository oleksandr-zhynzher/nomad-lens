import { useTranslation } from "react-i18next";
import type { NomadVisaDetails } from "@core/models";
import { Row, Cell, VALUE_MONO } from "./CompareTableParts";

interface VisaCountry {
  code: string;
  nomadVisa: NomadVisaDetails;
}

interface NomadVisaIncomeCompareRowProps {
  readonly selected: VisaCountry[];
  readonly count: number;
}

export function NomadVisaIncomeCompareRow({ selected, count }: NomadVisaIncomeCompareRowProps) {
  const { t } = useTranslation();
  return (
    <Row label={t("nomadVisasPage.table.income", "Income Req.")}>
      {selected.map((c) => {
        const inc = c.nomadVisa.incomeRequirement;
        return (
          <Cell key={c.code} count={count}>
            {inc.monthly !== null ? (
              <>
                <span className={VALUE_MONO}>
                  {inc.currency} {inc.monthly.toLocaleString()}
                </span>
                <span className="ml-[3px] text-[13px] text-dim">/{t("countryPage.visa.mo")}</span>
              </>
            ) : null}
            {inc.monthly === null && inc.annual !== null ? (
              <>
                <span className={VALUE_MONO}>
                  {inc.currency} {inc.annual.toLocaleString()}
                </span>
                <span className="ml-[3px] text-[13px] text-dim">/{t("countryPage.visa.yr")}</span>
              </>
            ) : null}
            {inc.monthly === null && inc.annual === null ? (
              <span className={`${VALUE_MONO} text-[#44CC66]`}>
                {t("countryPage.visa.noMinimum", "None")}
              </span>
            ) : null}
          </Cell>
        );
      })}
    </Row>
  );
}
