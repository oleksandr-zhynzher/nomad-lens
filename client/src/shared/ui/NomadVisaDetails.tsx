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
    <div className="mt-6">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-2 bg-transparent border-none cursor-pointer ${expanded ? "mb-3" : "mb-0"}`}
      >
        <h3 className="text-[11px] font-semibold tracking-[1.5px] uppercase text-dim">
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
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary">
                {t("countryPage.visa.visaName", "Visa Name")}
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted mt-0.5">{visa.visaName}</p>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary inline-flex items-center gap-1">
                <Clock size={12} className="inline" />
                {t("countryPage.visa.duration", "Duration")}
              </span>
              <span className="font-mono text-xs font-semibold text-white">
                {visa.duration.initial} mo
              </span>
            </div>
            {visa.duration.maxExtension > 0 && (
              <p className="font-mono text-[10px] text-dim mt-0.5">
                +{visa.duration.maxExtension} mo extension
              </p>
            )}
          </div>

          {/* Cost */}
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary inline-flex items-center gap-1">
                <DollarSign size={12} className="inline" />
                {t("countryPage.visa.cost", "Cost")}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${visa.cost.amount === 0 ? "text-success" : "text-white"}`}
              >
                {visa.cost.amount === 0
                  ? t("countryPage.visa.free", "Free")
                  : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Income */}
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary inline-flex items-center gap-1">
                <TrendingUp size={12} className="inline" />
                {t("countryPage.visa.income", "Income")}
              </span>
              {visa.incomeRequirement.monthly ? (
                <span className="font-mono text-[11px] font-semibold text-white">
                  {visa.incomeRequirement.currency}{" "}
                  {visa.incomeRequirement.monthly.toLocaleString()}/mo
                </span>
              ) : visa.incomeRequirement.annual ? (
                <span className="font-mono text-[10px] font-semibold text-white">
                  {visa.incomeRequirement.currency} {visa.incomeRequirement.annual.toLocaleString()}
                  /yr
                </span>
              ) : (
                <span className="font-mono text-[11px] font-semibold text-success">
                  {t("countryPage.visa.noMinimum", "None")}
                </span>
              )}
            </div>
          </div>

          {/* Tax Status */}
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary inline-flex items-center gap-1">
                <Shield size={12} className="inline" />
                {t("countryPage.visa.tax", "Tax")}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold"
                style={{
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
          <div className="flex flex-col gap-1 p-3 rounded bg-surface-2">
            <span className="text-xs font-semibold text-tertiary mb-1">
              {t("countryPage.visa.officialInfo", "Official Information")}
            </span>
            <a
              href={visa.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] text-accent no-underline break-all"
            >
              {t("countryPage.visa.visitWebsite", "Visit Website →")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
