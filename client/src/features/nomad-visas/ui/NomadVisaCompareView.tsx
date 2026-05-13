import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Layout } from "@core/ui/layout";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import {
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  setCompareCountryCodesParam,
} from "@features/compare/utils";
import { localizeCountry } from "@core/utils";
import type { CountryData, NomadVisaDetails } from "@core/models";

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

type VisaCountry = CountryData & { nomadVisa: NomadVisaDetails };

const LABEL_STYLE = "text-[11px] font-semibold tracking-[0.8px] uppercase text-dimmest";
const VALUE_MONO = "font-mono text-sm font-semibold text-white";
const VALUE_TEXT = "text-[13px] text-tertiary";

function Row({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-stretch border-b border-[#1A1A1A]">
      <div className={`${LABEL_STYLE} flex shrink-0 items-center bg-[#111113] px-4 py-3.5`}>
        {label}
      </div>
      <div className="flex overflow-hidden">{children}</div>
    </div>
  );
}

function Cell({ children, count }: { readonly children: React.ReactNode; readonly count: number }) {
  return (
    <div
      className="flex min-w-0 shrink-0 grow-0 items-center border-l border-[#1A1A1A] px-4 py-3.5"
      style={{ flex: `0 0 ${100 / count}%` }}
    >
      {children}
    </div>
  );
}

export function NomadVisaComparePage() {
  const { t, i18n } = useTranslation();
  const { countries, loading } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;

  const validVisaCodes = useMemo(
    () =>
      new Set(
        countries
          .filter((country) => Boolean(country.nomadVisa))
          .map((country) => country.code.toUpperCase()),
      ),
    [countries],
  );
  const rawCodes = useMemo(() => getRawCompareCountryCodes(searchParams), [searchParams]);
  const codes = useMemo(
    () => parseCompareCountryCodes(searchParams, validVisaCodes),
    [searchParams, validVisaCodes],
  );

  useEffect(() => {
    if (countries.length === 0) return;
    if (rawCodes.join(",") === codes.join(",")) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        setCompareCountryCodesParam(next, codes);
        return next;
      },
      { replace: true },
    );
  }, [codes, countries.length, rawCodes, setSearchParams]);

  const selected = useMemo<VisaCountry[]>(() => {
    return codes
      .map((code) => countries.find((c) => c.code === code))
      .filter((c): c is VisaCountry => !!c && !!c.nomadVisa);
  }, [countries, codes]);

  const count = selected.length;

  return (
    <Layout>
      <div className="mx-auto max-w-[1100px] px-4 py-8 pb-16">
        {/* Back link */}
        <Link
          to={`${langPrefix}/nomad-visas`}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-dim no-underline"
        >
          <ArrowLeft size={14} />
          {t("nomadVisasPage.backToVisas", "Back to Nomad")}
        </Link>

        <h1 className="mb-8 font-display text-[28px] font-bold tracking-[1px] text-white uppercase">
          {t("nomadVisasPage.compareTitle", "Nomad Visa Comparison")}
        </h1>

        {loading ? (
          <div className="py-16 text-center text-dim">{t("loading", "Loading…")}</div>
        ) : count < 2 ? (
          <div className="px-4 py-16 text-center text-dim">
            {t(
              "nomadVisasPage.noCountriesSelected",
              "No countries selected. Go back and pick at least 2.",
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#1E1E1E]">
            {/* Country header row */}
            <div className="grid grid-cols-[160px_1fr] border-b-2 border-[#2A2A2A] bg-[#111113]">
              <div className="p-4" />
              <div className="flex">
                {selected.map((c) => {
                  const loc = localizeCountry(c, lang);
                  return (
                    <div
                      key={c.code}
                      className="flex min-w-0 shrink-0 grow-0 items-center gap-2.5 border-l border-[#1E1E1E] p-4"
                      style={{ flex: `0 0 ${100 / count}%` }}
                    >
                      <img
                        src={c.flagUrl}
                        alt={loc.name}
                        className="h-[19px] w-7 shrink-0 rounded-[3px] object-cover"
                      />
                      <span className="overflow-hidden text-[15px] font-semibold text-ellipsis whitespace-nowrap text-white">
                        {loc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visa name */}
            <Row label={t("nomadVisasPage.table.visaName", "Visa Name")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span className={VALUE_TEXT}>{c.nomadVisa.visaName}</span>
                </Cell>
              ))}
            </Row>

            {/* Duration */}
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

            {/* Cost */}
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

            {/* Income requirement */}
            <Row label={t("nomadVisasPage.table.income", "Income Req.")}>
              {selected.map((c) => {
                const inc = c.nomadVisa.incomeRequirement;
                return (
                  <Cell key={c.code} count={count}>
                    {inc.monthly != null ? (
                      <>
                        <span className={VALUE_MONO}>
                          {inc.currency} {inc.monthly.toLocaleString()}
                        </span>
                        <span className="ml-[3px] text-[13px] text-dim">
                          /{t("countryPage.visa.mo")}
                        </span>
                      </>
                    ) : inc.annual != null ? (
                      <>
                        <span className={VALUE_MONO}>
                          {inc.currency} {inc.annual.toLocaleString()}
                        </span>
                        <span className="ml-[3px] text-[13px] text-dim">
                          /{t("countryPage.visa.yr")}
                        </span>
                      </>
                    ) : (
                      <span className={`${VALUE_MONO} text-[#44CC66]`}>
                        {t("countryPage.visa.noMinimum", "None")}
                      </span>
                    )}
                  </Cell>
                );
              })}
            </Row>

            {/* Tax status */}
            <Row label={t("nomadVisasPage.table.tax", "Tax Status")}>
              {selected.map((c) => {
                const taxColors =
                  TAX_STATUS_COLORS[c.nomadVisa.tax.status] ?? TAX_STATUS_COLORS.standard;
                return (
                  <Cell key={c.code} count={count}>
                    <span
                      className="rounded-full bg-[var(--tax-bg)] px-2.5 py-[3px] font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--tax-text)]"
                      style={
                        {
                          "--tax-bg": taxColors.bg,
                          "--tax-text": taxColors.text,
                        } as React.CSSProperties
                      }
                    >
                      {c.nomadVisa.tax.status === "exempt"
                        ? t("countryPage.taxExemptLabel")
                        : c.nomadVisa.tax.status === "special"
                          ? t("countryPage.specialTaxLabel")
                          : t("countryPage.standardTaxLabel")}
                    </span>
                  </Cell>
                );
              })}
            </Row>

            {/* Tax rate */}
            <Row label={t("nomadVisaComparePage.taxRate", "Tax Rate")}>
              {selected.map((c) => (
                <Cell key={c.code} count={count}>
                  <span className={VALUE_MONO}>
                    {c.nomadVisa.tax.rate == null ? "—" : `${c.nomadVisa.tax.rate}%`}
                  </span>
                </Cell>
              ))}
            </Row>

            {/* Renewable */}
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

            {/* Online application */}
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

            {/* Processing time */}
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

            {/* Official link */}
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
          </div>
        )}
      </div>
    </Layout>
  );
}
