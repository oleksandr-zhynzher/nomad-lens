import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import { Plane, CheckCircle2, XCircle } from "lucide-react";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import { localizeCountry, regionKey } from "@core/utils";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { useSyncScroll } from "@features/compare/hooks";
import { useComparisonSelection } from "@features/compare/hooks";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonSlotCard } from "./ComparisonSlotCard";
import { ComparisonTableHeader } from "./ComparisonTableHeader";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
import {
  TAX_STATUS_COLORS,
  VISA_FIELDS,
  VISA_COMPARISON_COLUMN_WIDTH,
  VISA_COMPARISON_COLUMN_GAP,
} from "@core/constants";
import type { VisaField } from "@core/constants";

interface Props {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
  budgetMatches: BudgetMatch[];
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
}

export function NomadVisaComparison({
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const lang = i18n.language;
  const budgetMatchByCode = new Map(budgetMatches.map((match) => [match.country.code, match]));

  const visaCountries = countries.filter((c) => !!c.nomadVisa);

  const {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates: filtered,
    dropdownOpen,
    setDropdownOpen,
    query,
    setQuery,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: visaCountries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
  });

  // Sync horizontal scroll between sticky header and body
  useSyncScroll(headerRef, bodyRef);

  const selectedCountries = selectedSlots.filter((s) => !!s.country.nomadVisa) as Array<{
    country: CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };
    color: string;
    index: number;
  }>;

  /** Localize nomad visa fields that have i18n */
  function getLocalizedVisa(country: CountryData) {
    const visa = country.nomadVisa!;
    const loc = lang === "ru" || lang === "ua" ? visa.i18n?.[lang as "ru" | "ua"] : undefined;
    return { visa, loc };
  }

  function renderCell(slot: (typeof selectedCountries)[number], field: VisaField) {
    const { visa, loc } = getLocalizedVisa(slot.country);

    switch (field) {
      case "visaName":
        return <span className="text-[13px] text-on-surface">{visa.visaName}</span>;
      case "overallScore": {
        const overallScore = computeScore(applyClimate(slot.country, climatePrefs), weights);
        return (
          <span
            className={`font-mono text-[20px] font-semibold ${scoreColourClass(overallScore, "text")}`}
          >
            {overallScore.toFixed(1)}
          </span>
        );
      }
      case "monthlyBudget": {
        const monthlyBudget = budgetMatchByCode.get(slot.country.code)?.monthlyCost;
        return (
          <span
            className={`font-mono text-[20px] font-semibold ${monthlyBudget != null ? "text-on-surface" : "text-dimmest"}`}
          >
            {monthlyBudget != null ? `$${monthlyBudget.toLocaleString()}` : "—"}
          </span>
        );
      }
      case "duration":
        return (
          <span
            className={`font-mono text-[20px] font-semibold ${visa.duration.initial >= 12 ? "text-success" : "text-warn"}`}
          >
            {visa.duration.initial}
            <span className="text-xs text-dim ml-[2px]">{t("countryPage.visa.months")}</span>
          </span>
        );
      case "maxExtension":
        return (
          <span
            className={`font-mono text-[20px] font-semibold ${visa.duration.maxExtension > 0 ? "text-[#5B8FA8]" : "text-dimmest"}`}
          >
            {visa.duration.maxExtension > 0 ? (
              <>
                +{visa.duration.maxExtension}
                <span className="text-xs text-dim ml-[2px]">{t("countryPage.visa.months")}</span>
              </>
            ) : (
              "—"
            )}
          </span>
        );
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
                {visa.cost.currency === "EUR"
                  ? "€"
                  : visa.cost.currency === "USD"
                    ? "$"
                    : visa.cost.currency === "GBP"
                      ? "£"
                      : visa.cost.currency}{" "}
                {visa.cost.amount.toLocaleString()}
              </>
            )}
          </span>
        );
      case "income": {
        const monthly = visa.incomeRequirement.monthly;
        const annual = visa.incomeRequirement.annual;
        if (!monthly && !annual) {
          return (
            <span className="text-[13px] text-success">{t("countryPage.visa.noMinimum")}</span>
          );
        }
        const cur =
          visa.incomeRequirement.currency === "EUR"
            ? "€"
            : visa.incomeRequirement.currency === "USD"
              ? "$"
              : visa.incomeRequirement.currency === "GBP"
                ? "£"
                : visa.incomeRequirement.currency;
        return (
          <span className="font-mono text-[20px] font-semibold text-on-surface">
            {cur}
            {monthly ? monthly.toLocaleString() : annual?.toLocaleString()}
            <span className="text-xs text-dim ml-[2px]">
              /{monthly ? t("countryPage.visa.mo") : t("countryPage.visa.yr")}
            </span>
          </span>
        );
      }
      case "taxStatus": {
        const status = visa.tax.status;
        const colors = TAX_STATUS_COLORS[status] ?? {
          bg: "#2A2A2A",
          text: "#9E9E9E",
        };
        const label =
          status === "exempt"
            ? t("countryPage.visa.taxExempt")
            : status === "special"
              ? t("countryPage.visa.taxSpecial")
              : t("countryPage.visa.taxStandard");
        const taxNotes = loc?.tax?.notes ?? visa.tax.notes;
        return (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--tax-bg)] text-[var(--tax-text)]"
                style={{ "--tax-bg": colors.bg, "--tax-text": colors.text } as React.CSSProperties}
              >
                {label}
              </span>
              {visa.tax.rate != null && (
                <span
                  className="font-mono text-[16px] font-semibold text-[var(--tax-text)]"
                  style={{ "--tax-text": colors.text } as React.CSSProperties}
                >
                  {visa.tax.rate}%
                </span>
              )}
            </div>
            {taxNotes && (
              <span className="text-[11px] text-dim leading-[1.4] text-center max-w-[260px]">
                {taxNotes}
              </span>
            )}
          </div>
        );
      }
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
      case "benefits": {
        const items = loc?.benefits ?? visa.benefits;
        return (
          <div className="flex flex-col gap-1">
            {items.map((b, i) => (
              <span key={i} className="text-[11px] text-muted leading-[1.3]">
                • {b}
              </span>
            ))}
          </div>
        );
      }
    }
  }

  return (
    <div>
      {/* Country selector — horizontal scroll */}
      <div className="grid grid-cols-3 gap-3 pb-2 md:flex md:items-stretch md:overflow-x-auto [scrollbar-width:thin]">
        {selectedCountries.map((slot) => (
          <div key={slot.country.code} className="min-w-0 w-full md:shrink-0 md:w-[180px]">
            <ComparisonSlotCard
              flagUrl={slot.country.flagUrl}
              countryName={localizeCountry(slot.country, lang).name}
              onRemove={() => handleRemove(slot.index)}
              onNavigate={() =>
                navigate(`${langPrefix}/country/${slot.country.code.toLowerCase()}`)
              }
              regionLabel={t(`regions.${regionKey(slot.country.region)}`)}
              nameSuffix={<Plane size={13} className="text-accent shrink-0" />}
            >
              <span className="text-[11px] text-muted text-center leading-[1.3]">
                {slot.country.nomadVisa.visaName}
              </span>
            </ComparisonSlotCard>
          </div>
        ))}

        {/* Add button */}
        <div className="min-w-0 w-full md:shrink-0 md:w-[180px]">
          <ComparisonAddButton
            label={t("compare.addCountry")}
            onClick={() => setDropdownOpen((p) => !p)}
          />
        </div>
      </div>

      {/* Dropdown */}
      <CountryPickerDropdown
        open={dropdownOpen}
        countries={filtered.map((c) => ({
          code: c.code,
          flagUrl: c.flagUrl,
          name: localizeCountry(c, lang).name,
          regionLabel: t(`regions.${regionKey(c.region)}`),
          trailing: <Plane size={14} className="text-accent" />,
        }))}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        inputName="visa-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />

      {/* Visa comparison grid */}
      {selectedCountries.length > 0 && (
        <div className="mt-8">
          <div className="h-px bg-[#1C1C1C]" />

          {/* Sticky header */}
          <ComparisonTableHeader
            ref={headerRef}
            label={t("compare.visaDetail", "Visa Detail")}
            columns={selectedCountries.map((slot) => ({
              key: slot.index,
              flagUrl: slot.country.flagUrl,
              name: localizeCountry(slot.country, lang).name,
              maxNameWidth: "150px",
            }))}
            columnWidth={VISA_COMPARISON_COLUMN_WIDTH}
            gap={VISA_COMPARISON_COLUMN_GAP}
          />

          {/* Data rows */}
          <div ref={bodyRef} className="overflow-x-auto">
            {VISA_FIELDS.map(({ key, icon: Icon }) => (
              <ComparisonRowShell
                key={key}
                icon={Icon}
                label={t(`compare.visaFields.${key}`)}
                gap={VISA_COMPARISON_COLUMN_GAP}
              >
                {selectedCountries.map((slot) => (
                  <div
                    key={slot.index}
                    className="flex shrink-0 items-center justify-center w-[var(--vcw)]"
                    style={{ "--vcw": VISA_COMPARISON_COLUMN_WIDTH } as React.CSSProperties}
                  >
                    {renderCell(slot, key)}
                  </div>
                ))}
              </ComparisonRowShell>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
