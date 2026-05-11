import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import { Plane, CheckCircle2, XCircle } from "lucide-react";
import { computeScore, scoreColour } from "../utils/scoring";
import { applyClimate } from "../utils/scoring";
import { localizeCountry, regionKey } from "../utils/localize";
import type { ClimatePreferences, CountryData, WeightMap } from "../utils/types";
import { useSyncScroll } from "../shared/hooks/useSyncScroll";
import { useComparisonSelection } from "../shared/hooks/useComparisonSelection";
import { ComparisonSlotCard } from "../shared/ui/comparison/ComparisonSlotCard";
import { ComparisonAddButton } from "../shared/ui/comparison/ComparisonAddButton";
import { CountryPickerDropdown } from "../shared/ui/comparison/CountryPickerDropdown";
import { ComparisonTableHeader } from "../shared/ui/comparison/ComparisonTableHeader";
import { ComparisonRowShell } from "../shared/ui/comparison/ComparisonRowShell";
import {
  TAX_STATUS_COLORS,
  VISA_FIELDS,
  VISA_COMPARISON_COLUMN_WIDTH,
  VISA_COMPARISON_COLUMN_GAP,
} from "../utils/visaConstants";
import type { VisaField } from "../utils/visaConstants";

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
        return (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#E8E9EB",
            }}
          >
            {visa.visaName}
          </span>
        );
      case "overallScore": {
        const overallScore = computeScore(applyClimate(slot.country, climatePrefs), weights);
        return (
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: scoreColour(overallScore),
            }}
          >
            {overallScore.toFixed(1)}
          </span>
        );
      }
      case "monthlyBudget": {
        const monthlyBudget = budgetMatchByCode.get(slot.country.code)?.monthlyCost;
        return (
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: monthlyBudget != null ? "#E8E9EB" : "#757575",
            }}
          >
            {monthlyBudget != null ? `$${monthlyBudget.toLocaleString()}` : "—"}
          </span>
        );
      }
      case "duration":
        return (
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: visa.duration.initial >= 12 ? "#44CC66" : "#DDAA44",
            }}
          >
            {visa.duration.initial}
            <span style={{ fontSize: "12px", color: "#8A8A8A", marginLeft: 2 }}>
              {t("countryPage.visa.months")}
            </span>
          </span>
        );
      case "maxExtension":
        return (
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: visa.duration.maxExtension > 0 ? "#5B8FA8" : "#757575",
            }}
          >
            {visa.duration.maxExtension > 0 ? (
              <>
                +{visa.duration.maxExtension}
                <span style={{ fontSize: "12px", color: "#8A8A8A", marginLeft: 2 }}>
                  {t("countryPage.visa.months")}
                </span>
              </>
            ) : (
              "—"
            )}
          </span>
        );
      case "renewable":
        return visa.duration.renewable ? (
          <CheckCircle2 size={20} style={{ color: "#44CC66" }} />
        ) : (
          <XCircle size={20} style={{ color: "#808080" }} />
        );
      case "cost":
        return (
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: visa.cost.amount === 0 ? "#44CC66" : "#E8E9EB",
            }}
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
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#44CC66",
              }}
            >
              {t("countryPage.visa.noMinimum")}
            </span>
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
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: "#E8E9EB",
            }}
          >
            {cur}
            {monthly ? monthly.toLocaleString() : annual?.toLocaleString()}
            <span style={{ fontSize: "12px", color: "#8A8A8A", marginLeft: 2 }}>
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
                className="px-2.5 py-1 rounded-full"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {label}
              </span>
              {visa.tax.rate != null && (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: colors.text,
                  }}
                >
                  {visa.tax.rate}%
                </span>
              )}
            </div>
            {taxNotes && (
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#8A8A8A",
                  lineHeight: 1.4,
                  textAlign: "center",
                  maxWidth: "260px",
                }}
              >
                {taxNotes}
              </span>
            )}
          </div>
        );
      }
      case "online":
        return visa.applicationProcess.online ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={16} style={{ color: "#44CC66" }} />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#44CC66",
              }}
            >
              {t("compare.online")}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <XCircle size={16} style={{ color: "#9E9E9E" }} />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#9E9E9E",
              }}
            >
              {t("compare.inPerson")}
            </span>
          </div>
        );
      case "processingTime":
        return (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#E8E9EB",
            }}
          >
            {loc?.applicationProcess?.processingTime ?? visa.applicationProcess.processingTime}
          </span>
        );
      case "benefits": {
        const items = loc?.benefits ?? visa.benefits;
        return (
          <div className="flex flex-col gap-1">
            {items.map((b, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#9E9E9E",
                  lineHeight: 1.3,
                }}
              >
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
      <div
        className="grid grid-cols-3 gap-3 pb-2 md:flex md:items-stretch md:overflow-x-auto"
        style={{ scrollbarWidth: "thin" }}
      >
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
              nameSuffix={
                <Plane
                  size={13}
                  style={{
                    color: "var(--color-accent)",
                    flexShrink: 0,
                  }}
                />
              }
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#9E9E9E",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
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
          trailing: <Plane size={14} style={{ color: "var(--color-accent)" }} />,
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
          <div style={{ height: "1px", backgroundColor: "#1C1C1C" }} />

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
          <div ref={bodyRef} style={{ overflowX: "auto" }}>
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
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: VISA_COMPARISON_COLUMN_WIDTH }}
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
