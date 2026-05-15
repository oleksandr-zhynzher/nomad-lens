import type React from "react";
import { ChevronDown, ChevronUp, Clock, DollarSign, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TAX_STATUS_COLORS } from "@core/constants";
import type { NomadVisaDetails as NomadVisaDetailsType } from "@core/models";
import { getTaxStatusLabel } from "./nomad-visas.utils";

interface NomadVisaDetailsProps {
  readonly visa: NomadVisaDetailsType;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}

export function NomadVisaDetails({ visa, expanded, onToggle }: NomadVisaDetailsProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-6">
      <button
        onClick={onToggle}
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-2 ${expanded ? "mb-3" : "mb-0"}`}
      >
        <h3 className="text-[11px] font-semibold tracking-[1.5px] text-dim uppercase">
          {t("countryDetail.nomadVisaDetails", "Digital Nomad Visa")}
        </h3>
        {expanded ? (
          <ChevronUp size={16} color="#8A8A8A" />
        ) : (
          <ChevronDown size={16} color="#8A8A8A" />
        )}
      </button>

      {expanded ? (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {/* Visa Name */}
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary">
                {t("countryPage.visa.visaName", "Visa Name")}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{visa.visaName}</p>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
                <Clock size={12} className="inline" />
                {t("countryPage.visa.duration", "Duration")}
              </span>
              <span className="font-mono text-xs font-semibold text-white">
                {visa.duration.initial} mo
              </span>
            </div>
            {visa.duration.maxExtension > 0 ? (
              <p className="mt-0.5 font-mono text-[10px] text-dim">
                +{visa.duration.maxExtension} mo extension
              </p>
            ) : null}
          </div>

          {/* Cost */}
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
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
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
                <TrendingUp size={12} className="inline" />
                {t("countryPage.visa.income", "Income")}
              </span>
              {visa.incomeRequirement.monthly !== null ? (
                <span className="font-mono text-[11px] font-semibold text-white">
                  {visa.incomeRequirement.currency}{" "}
                  {visa.incomeRequirement.monthly.toLocaleString()}/mo
                </span>
              ) : null}
              {visa.incomeRequirement.monthly === null && visa.incomeRequirement.annual !== null ? (
                <span className="font-mono text-[10px] font-semibold text-white">
                  {visa.incomeRequirement.currency} {visa.incomeRequirement.annual.toLocaleString()}
                  /yr
                </span>
              ) : null}
              {visa.incomeRequirement.monthly === null && visa.incomeRequirement.annual === null ? (
                <span className="font-mono text-[11px] font-semibold text-success">
                  {t("countryPage.visa.noMinimum", "None")}
                </span>
              ) : null}
            </div>
          </div>

          {/* Tax Status */}
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
                <Shield size={12} className="inline" />
                {t("countryPage.visa.tax", "Tax")}
              </span>
              <span
                className="inline-flex items-center rounded-full bg-[var(--tax-bg)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--tax-c)]"
                style={
                  {
                    "--tax-bg": (TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard)
                      .bg,
                    "--tax-c": (TAX_STATUS_COLORS[visa.tax.status] ?? TAX_STATUS_COLORS.standard)
                      .text,
                  } as React.CSSProperties
                }
              >
                {getTaxStatusLabel(visa.tax.status, t)}
              </span>
            </div>
          </div>

          {/* Official Link */}
          <div className="flex flex-col gap-1 rounded bg-surface-2 p-3">
            <span className="mb-1 text-xs font-semibold text-tertiary">
              {t("countryPage.visa.officialInfo", "Official Information")}
            </span>
            <a
              href={visa.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] break-all text-accent no-underline"
            >
              {t("countryPage.visa.visitWebsite", "Visit Website →")}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
