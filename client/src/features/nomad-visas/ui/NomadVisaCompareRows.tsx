import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import type { CountryData, NomadVisaDetails } from "@core/models";
import { TAX_STATUS_COLORS } from "@core/constants";
import { Row, Cell, VALUE_MONO, VALUE_TEXT } from "./CompareTableParts";
import { getTaxStatusLabel } from "./nomad-visas.utils";

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
      <Row label={t("nomadVisasPage.table.tax", "Tax Status")}>
        {selected.map((c) => {
          const taxColors = TAX_STATUS_COLORS[c.nomadVisa.tax.status] ?? TAX_STATUS_COLORS.standard;
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
      <Row label={t("nomadVisaComparePage.renewable", "Renewable")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span
              className={`text-[13px] ${c.nomadVisa.duration.renewable ? "text-[#44CC66]" : "text-[#CC4444]"}`}
            >
              {c.nomadVisa.duration.renewable ? t("common.yes", "Yes") : t("common.no", "No")}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.onlineApp", "Online Application")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span
              className={`text-[13px] ${c.nomadVisa.applicationProcess.online ? "text-[#44CC66]" : "text-[#CC4444]"}`}
            >
              {c.nomadVisa.applicationProcess.online
                ? t("common.yes", "Yes")
                : t("common.no", "No")}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.processingTime", "Processing Time")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span className={VALUE_TEXT}>
              {c.nomadVisa.applicationProcess.processingTime !== ""
                ? c.nomadVisa.applicationProcess.processingTime
                : "—"}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.officialLink", "Official Link")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <a
              href={c.nomadVisa.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[5px] text-xs text-accent-dim no-underline"
            >
              <ExternalLink size={13} />
              {t("nomadVisaComparePage.viewPage", "Official page")}
            </a>
          </Cell>
        ))}
      </Row>
    </>
  );
}
