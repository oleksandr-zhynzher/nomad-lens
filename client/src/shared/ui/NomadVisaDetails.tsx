import { ChevronDown, ChevronUp, Clock, DollarSign, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails as NomadVisaDetailsType } from "../../utils/types";
import { TAX_STATUS_COLORS } from "../../utils/visaConstants";

interface NomadVisaDetailsProps {
  visa: NomadVisaDetailsType;
  expanded: boolean;
  onToggle: () => void;
}

export function NomadVisaDetails({ visa, expanded, onToggle }: NomadVisaDetailsProps) {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: "24px" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: expanded ? "12px" : "0",
        }}
      >
        <h3
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          {t("countryDetail.nomadVisaDetails", "Digital Nomad Visa")}
        </h3>
        {expanded ? (
          <ChevronUp size={16} color="#8A8A8A" />
        ) : (
          <ChevronDown size={16} color="#8A8A8A" />
        )}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Visa Name */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                {t("countryPage.visa.visaName", "Visa Name")}
              </span>
            </div>
            <p
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "11px",
                color: "#9E9E9E",
                marginTop: "2px",
              }}
            >
              {visa.visaName}
            </p>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                <Clock
                  size={12}
                  style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}
                />
                {t("countryPage.visa.duration", "Duration")}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                {visa.duration.initial} mo
              </span>
            </div>
            {visa.duration.maxExtension > 0 && (
              <p
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "10px",
                  color: "#8A8A8A",
                  marginTop: "2px",
                }}
              >
                +{visa.duration.maxExtension} mo extension
              </p>
            )}
          </div>

          {/* Cost */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                <DollarSign
                  size={12}
                  style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}
                />
                {t("countryPage.visa.cost", "Cost")}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: visa.cost.amount === 0 ? "#44CC66" : "#FFFFFF",
                }}
              >
                {visa.cost.amount === 0
                  ? t("countryPage.visa.free", "Free")
                  : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Income */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                <TrendingUp
                  size={12}
                  style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}
                />
                {t("countryPage.visa.income", "Income")}
              </span>
              {visa.incomeRequirement.monthly ? (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {visa.incomeRequirement.currency}{" "}
                  {visa.incomeRequirement.monthly.toLocaleString()}/mo
                </span>
              ) : visa.incomeRequirement.annual ? (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {visa.incomeRequirement.currency} {visa.incomeRequirement.annual.toLocaleString()}
                  /yr
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#44CC66",
                  }}
                >
                  {t("countryPage.visa.noMinimum", "None")}
                </span>
              )}
            </div>
          </div>

          {/* Tax Status */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                <Shield
                  size={12}
                  style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}
                />
                {t("countryPage.visa.tax", "Tax")}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  backgroundColor: (
                    TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard
                  ).bg,
                  color: (TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard).text,
                }}
              >
                {visa.tax.status === "exempt"
                  ? t("countryPage.taxExemptLabel")
                  : visa.tax.status === "special"
                    ? t("countryPage.specialTaxLabel")
                    : t("countryPage.standardTaxLabel")}
              </span>
            </div>
          </div>

          {/* Official Link */}
          <div className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: "#222222" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#CCCCCC",
                marginBottom: "4px",
              }}
            >
              {t("countryPage.visa.officialInfo", "Official Information")}
            </span>
            <a
              href={visa.officialUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "10px",
                color: "var(--color-accent)",
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {t("countryPage.visa.visitWebsite", "Visit Website →")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
