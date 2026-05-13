import { createPortal } from "react-dom";
import { X, Plane, User, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLangPrefix } from "@core/hooks";
import type { RankedCountry } from "@core/models";
import { TOURISM_GROUPS, CATEGORY_LABELS } from "@core/models";
import { scoreColourClass, tourismScoreColourClass } from "@core/utils";
import { TOURISM_COLORS } from "@features/tourism/constants";
import { computeTourismScore } from "@features/tourism/utils";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { useLocalizedCountry, regionKey } from "@core/utils";
import { NomadVisaDetails } from "@features/nomad-visas/ui";

interface CountryDetailPanelProps {
  country: RankedCountry;
  onClose: () => void;
  onViewInList: () => void;
}

export function CountryDetailPanel({ country, onClose, onViewInList }: CountryDetailPanelProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { country: c, finalScore, rank } = country;
  const [visaExpanded, setVisaExpanded] = useState(true);
  const locC = useLocalizedCountry(c);

  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col md:flex-row">
      {/* Backdrop — on desktop fills left side, on mobile fills top */}
      <button
        type="button"
        aria-label={t("countryDetails.close", "Close country details")}
        className="flex-1 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer — right panel on desktop, bottom sheet on mobile */}
      <div className="flex h-screen w-full max-w-full flex-col overflow-hidden bg-surface md:h-full md:w-auto">
        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pt-2 pb-1 md:hidden">
          <div className="h-1 w-9 rounded-full bg-[#444444]" />
        </div>

        {/* Desktop width constraint wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden md:w-[480px]">
          {/* Header: Rank | Country | Score */}
          <div className="flex shrink-0 items-center gap-3 border-b border-surface-4 bg-surface-2 px-5 pt-5 pb-4">
            {/* Rank */}
            <span className="text-sm leading-none font-medium whitespace-nowrap text-accent">
              #{rank}
            </span>

            {/* Flag + Name + Region */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img
                src={c.flagUrl}
                alt={t("a11y.flagAlt", "{{country}} flag", {
                  country: locC.name,
                })}
                className="h-6 w-9 shrink-0 rounded-[4px] object-cover"
                loading="eager"
              />
              <div className="flex min-w-0 items-baseline gap-2">
                <h2 className="[font-family:Oswald,_sans-serif] leading-[1.2] font-bold whitespace-nowrap text-white">
                  {locC.name}
                </h2>
                <span className="text-xs text-muted">{t(`regions.${regionKey(c.region)}`)}</span>
              </div>
            </div>

            {/* Score */}
            <span
              className={`[font-family:Oswald,_sans-serif] leading-none font-bold whitespace-nowrap ${scoreColourClass(finalScore, "text")}`}
            >
              {finalScore.toFixed(1)}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-border text-muted transition-colors"
              aria-label={t("a11y.closePanel", "Close panel")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Badge Row */}
          <div className="flex shrink-0 items-center gap-2 bg-surface px-5 py-3">
            {c.hasNomadVisa ? (
              <Link
                to={`${langPrefix}/country/${c.code.toLowerCase()}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[10px] font-medium text-white no-underline"
              >
                <Plane size={11} /> {t("countryDetail.nomadVisa")}
              </Link>
            ) : null}
          </div>

          {/* Breakdown section */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[1.5px] text-dim uppercase">
              {t("countryDetail.scoreBreakdown")}
            </h3>
            <ScoreBreakdown country={c} />

            {/* Tourism Scores Section */}
            {(() => {
              const tScore = computeTourismScore(c);
              if (tScore == null) return null;
              return (
                <div className="mt-6">
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[1.5px] text-[#6B9E6B] uppercase">
                    {t("countryDetail.tourismScores", "Tourism Score")}
                    <span
                      className={`ml-2 font-mono text-[13px] font-bold ${tourismScoreColourClass(tScore, "text")}`}
                    >
                      {tScore.toFixed(1)}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {TOURISM_GROUPS.map((group) => {
                      const visibleKeys = group.keys.filter((k) => c.scores[k]?.value != null);
                      if (visibleKeys.length === 0) return null;
                      return (
                        <div key={group.labelKey}>
                          <div className="mb-1.5 text-[9px] font-semibold tracking-[1px] text-[#666] uppercase">
                            {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {visibleKeys.map((key) => {
                              const val = c.scores[key].value!;
                              const color = TOURISM_COLORS[key] ?? "#888";
                              return (
                                <div key={key} className="flex h-[22px] items-center gap-2">
                                  <span className="w-[130px] shrink-0 text-[11px] text-muted">
                                    {t(`tourism.metrics.${key}`, CATEGORY_LABELS[key])}
                                  </span>
                                  <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-surface-4">
                                    <div
                                      className="h-full w-[var(--bw)] rounded-[3px] bg-[var(--bc)]"
                                      style={
                                        { "--bw": `${val}%`, "--bc": color } as React.CSSProperties
                                      }
                                    />
                                  </div>
                                  <span className="w-[28px] shrink-0 text-right font-mono text-[11px] font-semibold text-on-surface">
                                    {val.toFixed(0)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Nomad Visa Section */}
            {c.nomadVisa ? (
              <NomadVisaDetails
                visa={c.nomadVisa}
                expanded={visaExpanded}
                onToggle={() => {
                  setVisaExpanded(!visaExpanded);
                }}
              />
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-border px-5 py-4">
            <button
              onClick={() => {
                onViewInList();
                onClose();
              }}
              className="interactive-cta-link flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim transition-colors"
            >
              <List size={14} />
              {t("countryDetail.viewInList")}
            </button>
            <Link
              to={`${langPrefix}/country/${c.code.toLowerCase()}`}
              onClick={onClose}
              className="interactive-cta-link flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent text-[13px] font-medium text-accent-dim no-underline transition-colors"
            >
              <User size={14} />
              {t("countryPage.viewProfile", "View Country Details")}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
