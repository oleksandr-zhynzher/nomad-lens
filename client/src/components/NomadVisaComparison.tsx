import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import {
  CirclePlus,
  X,
  Plane,
  Clock,
  Banknote,
  Wallet,
  Receipt,
  FileCheck,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  computeClimateScore,
  computeScore,
  scoreColour,
} from "../utils/scoring";
import { localizeCountry, regionKey } from "../utils/localize";
import type {
  ClimatePreferences,
  CountryData,
  WeightMap,
} from "../utils/types";

const SLOT_COLORS = [
  "#8F5A3C",
  "#5B8FA8",
  "#6B9E6B",
  "#B07CC6",
  "#E07C4F",
  "#4EA8B0",
  "#C75D8E",
  "#7B9E3C",
  "#D4A04A",
  "#6889C7",
  "#A66BBF",
  "#4CAF8B",
] as const;

function getSlotColor(index: number) {
  return SLOT_COLORS[index % SLOT_COLORS.length];
}

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

const VISA_COMPARISON_COLUMN_WIDTH = "200px";
const VISA_COMPARISON_COLUMN_GAP = "16px";

interface Props {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
  budgetMatches: BudgetMatch[];
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
}

type VisaField =
  | "visaName"
  | "overallScore"
  | "monthlyBudget"
  | "duration"
  | "maxExtension"
  | "renewable"
  | "cost"
  | "income"
  | "taxStatus"
  | "online"
  | "processingTime"
  | "benefits";

const VISA_FIELDS: { key: VisaField; icon: typeof Clock }[] = [
  { key: "visaName", icon: FileCheck },
  { key: "duration", icon: Clock },
  { key: "maxExtension", icon: Clock },
  { key: "renewable", icon: CheckCircle2 },
  { key: "cost", icon: Banknote },
  { key: "income", icon: Wallet },
  { key: "taxStatus", icon: Receipt },
  { key: "online", icon: Globe },
  { key: "processingTime", icon: FileCheck },
  { key: "overallScore", icon: FileCheck },
  { key: "monthlyBudget", icon: Wallet },
  { key: "benefits", icon: Plane },
];

export function NomadVisaComparison({
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const lang = i18n.language;
  const budgetMatchByCode = new Map(
    budgetMatches.map((match) => [match.country.code, match]),
  );

  // Sync horizontal scroll between sticky header and body
  useEffect(() => {
    const header = headerRef.current;
    const body = bodyRef.current;
    if (!header || !body) return;
    const onBody = () => {
      header.scrollLeft = body.scrollLeft;
    };
    const onHeader = () => {
      body.scrollLeft = header.scrollLeft;
    };
    body.addEventListener("scroll", onBody);
    header.addEventListener("scroll", onHeader);
    return () => {
      body.removeEventListener("scroll", onBody);
      header.removeEventListener("scroll", onHeader);
    };
  }, []);

  const visaCountries = countries.filter((c) => !!c.nomadVisa);

  const selectedCountries = selectedCodes
    .map((code, i) => {
      const country = visaCountries.find((c) => c.code === code);
      return country ? { country, color: getSlotColor(i), index: i } : null;
    })
    .filter(Boolean) as {
    country: CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };
    color: string;
    index: number;
  }[];

  const handleRemove = (index: number) => {
    onSelectedCodesChange(selectedCodes.filter((_, i) => i !== index));
  };

  const handleAdd = (code: string) => {
    onSelectedCodesChange([...selectedCodes, code]);
    setDropdownOpen(false);
    setQuery("");
  };

  const filtered = visaCountries
    .filter(
      (c) =>
        !selectedCodes.includes(c.code) &&
        localizeCountry(c, lang)
          .name.toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      localizeCountry(a, lang).name.localeCompare(
        localizeCountry(b, lang).name,
      ),
    );

  /** Localize nomad visa fields that have i18n */
  function getLocalizedVisa(country: CountryData) {
    const visa = country.nomadVisa!;
    const loc =
      lang === "ru" || lang === "ua"
        ? visa.i18n?.[lang as "ru" | "ua"]
        : undefined;
    return { visa, loc };
  }

  function applyClimate(country: CountryData): CountryData {
    if (!country.climateData) return country;

    return {
      ...country,
      scores: {
        ...country.scores,
        climate: {
          ...country.scores.climate,
          value: computeClimateScore(country.climateData, climatePrefs),
        },
      },
    };
  }

  function renderCell(
    slot: (typeof selectedCountries)[number],
    field: VisaField,
  ) {
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
        const overallScore = computeScore(applyClimate(slot.country), weights);
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
        const monthlyBudget = budgetMatchByCode.get(
          slot.country.code,
        )?.monthlyCost;
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
                <span
                  style={{ fontSize: "12px", color: "#8A8A8A", marginLeft: 2 }}
                >
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
            {loc?.applicationProcess?.processingTime ??
              visa.applicationProcess.processingTime}
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
          <div
            key={slot.country.code}
            className="min-w-0 w-full md:shrink-0 md:w-[180px]"
            onClick={() =>
              navigate(
                `${langPrefix}/country/${slot.country.code.toLowerCase()}`,
              )
            }
            style={{ cursor: "pointer" }}
          >
            <div
              className="relative rounded-lg p-4 flex flex-col items-center gap-3"
              style={{
                backgroundColor: "#1A1A1C",
                border: "1px solid #2E2E30",
                height: "100%",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(slot.index);
                }}
                className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
                style={{
                  opacity: 0.6,
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                }}
              >
                <X size={14} />
              </button>

              <img
                src={slot.country.flagUrl}
                alt={localizeCountry(slot.country, lang).name}
                className="rounded-full object-cover w-9 h-9"
              />

              <div className="flex items-center justify-center gap-1.5">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#E8E9EB",
                    textAlign: "center",
                  }}
                >
                  {localizeCountry(slot.country, lang).name}
                </span>
                <Plane
                  size={13}
                  style={{
                    color: "var(--color-accent)",
                    flexShrink: 0,
                  }}
                />
              </div>

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

              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "#9E9E9E",
                  backgroundColor: "#1C1C1C",
                  border: "1px solid #2C2C2C",
                }}
              >
                {t(`regions.${regionKey(slot.country.region)}`)}
              </span>
            </div>
          </div>
        ))}

        {/* Add button */}
        <div className="min-w-0 w-full md:shrink-0 md:w-[180px]">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-[#3A3A3A] md:min-h-[180px]"
            style={{
              backgroundColor: "#141416",
              border: "1px dashed #252525",
              cursor: "pointer",
            }}
          >
            <CirclePlus size={28} style={{ color: "#E8E9EB" }} />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#E8E9EB",
              }}
            >
              {t("compare.addCountry")}
            </span>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className="z-20 mt-1 rounded-lg overflow-hidden w-full md:w-[320px]"
          style={{
            backgroundColor: "#1A1A1C",
            border: "1px solid #2A2A2A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <input
            name="visa-comparison-search"
            type="text"
            autoFocus
            placeholder={t("compare.searchCountry")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2.5 focus:outline-none"
            style={{
              backgroundColor: "#141416",
              border: "none",
              borderBottom: "1px solid #252525",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            }}
          />
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {filtered.map((c) => (
              <button
                key={c.code}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                onClick={() => handleAdd(c.code)}
              >
                <img
                  src={c.flagUrl}
                  alt={localizeCountry(c, lang).name}
                  className="rounded-full object-cover"
                  style={{ width: "24px", height: "24px" }}
                />
                <span
                  className="flex-1 truncate"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#E8E9EB",
                  }}
                >
                  {localizeCountry(c, lang).name}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "#808080",
                  }}
                >
                  {t(`regions.${regionKey(c.region)}`)}
                </span>
                <Plane size={14} style={{ color: "var(--color-accent)" }} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div
                className="px-3 py-4 text-center"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#808080",
                }}
              >
                {t("compare.noCountriesFound")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visa comparison grid */}
      {selectedCountries.length > 0 && (
        <div className="mt-8">
          <div style={{ height: "1px", backgroundColor: "#1C1C1C" }} />

          {/* Sticky header */}
          <div
            ref={headerRef}
            className="sticky z-10"
            style={{
              top: "56px",
              overflowX: "auto",
              scrollbarWidth: "none",
              backgroundColor: "#0F1114",
            }}
          >
            <div
              className="flex items-center"
              style={{
                borderBottom: "1px solid #1C1C1C",
                padding: "14px 0",
                gap: VISA_COMPARISON_COLUMN_GAP,
              }}
            >
              <div className="w-[160px] md:w-[240px] shrink-0">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    color: "#757575",
                    textTransform: "uppercase",
                  }}
                >
                  {t("compare.visaDetail", "Visa Detail")}
                </span>
              </div>
              {selectedCountries.map((slot) => (
                <div
                  key={slot.index}
                  className="flex shrink-0 items-center justify-center gap-1.5"
                  style={{ width: VISA_COMPARISON_COLUMN_WIDTH }}
                >
                  <img
                    src={slot.country.flagUrl}
                    alt={localizeCountry(slot.country, lang).name}
                    className="rounded-full object-cover"
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span
                    className="truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      maxWidth: "150px",
                    }}
                  >
                    {localizeCountry(slot.country, lang).name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data rows */}
          <div ref={bodyRef} style={{ overflowX: "auto" }}>
            {VISA_FIELDS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center"
                style={{
                  borderBottom: "1px solid #1C1C1C",
                  padding: "16px 0",
                  gap: VISA_COMPARISON_COLUMN_GAP,
                }}
              >
                <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
                  <Icon size={16} style={{ color: "#808080" }} />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      color: "#8A8A8A",
                    }}
                  >
                    {t(`compare.visaFields.${key}`)}
                  </span>
                </div>
                {selectedCountries.map((slot) => (
                  <div
                    key={slot.index}
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: VISA_COMPARISON_COLUMN_WIDTH }}
                  >
                    {renderCell(slot, key)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
