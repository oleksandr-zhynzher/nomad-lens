import { useCountries, useLangPrefix } from "@core/hooks";
import type { CountryData, NomadVisaDetails } from "@core/models";
import { Layout } from "@core/ui/layout";
import {
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  setCompareCountryCodesParam,
} from "@features/compare/utils";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { NomadVisaCompareHeader } from "./NomadVisaCompareHeader";
import { NomadVisaCompareRows } from "./NomadVisaCompareRows";

type VisaCountry = CountryData & { nomadVisa: NomadVisaDetails };

export function NomadVisaComparePage() {
  const { t, i18n } = useTranslation();
  const { countries, loading } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;

  const validVisaCodes = useMemo(
    () => new Set(countries.filter((c) => Boolean(c.nomadVisa)).map((c) => c.code.toUpperCase())),
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

  const selected = useMemo<VisaCountry[]>(
    () =>
      codes
        .map((code) => countries.find((c) => c.code === code))
        .filter((c): c is VisaCountry => !!c && !!c.nomadVisa),
    [countries, codes],
  );

  const count = selected.length;

  function renderContent() {
    if (loading)
      return <div className="py-16 text-center text-dim">{t("loading", "Loading…")}</div>;
    if (count < 2)
      return (
        <div className="px-4 py-16 text-center text-dim">
          {t(
            "nomadVisasPage.noCountriesSelected",
            "No countries selected. Go back and pick at least 2.",
          )}
        </div>
      );
    return (
      <div className="overflow-hidden rounded-lg border border-[#1E1E1E]">
        <NomadVisaCompareHeader
          langPrefix={langPrefix}
          lang={lang}
          selected={selected}
          count={count}
        />
        <NomadVisaCompareRows selected={selected} count={count} />
      </div>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[1100px] px-4 py-8 pb-16">{renderContent()}</div>
    </Layout>
  );
}
