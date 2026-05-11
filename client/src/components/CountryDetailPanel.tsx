import { createPortal } from "react-dom";
import { X, Plane, User, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { RankedCountry } from "../utils/types";
import { TOURISM_GROUPS, CATEGORY_LABELS } from "../utils/types";
import { scoreColourClass, tourismScoreColourClass } from "../utils/colorClasses";
import { computeTourismScore } from "../utils/tourismScoring";
import { TOURISM_COLORS } from "../utils/tourismColors";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import { NomadVisaDetails } from "../shared/ui/NomadVisaDetails";

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
      <div className="w-full md:w-auto md:h-full flex flex-col overflow-hidden max-w-full h-screen bg-surface">
        {/* Mobile drag handle */}
        <div className="flex md:hidden justify-center pt-2 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#444444]" />
        </div>

        {/* Desktop width constraint wrapper */}
        <div className="flex flex-col flex-1 overflow-hidden md:w-[480px]">
          {/* Header: Rank | Country | Score */}
          <div className="flex items-center px-5 pt-5 pb-4 shrink-0 gap-3 bg-surface-2 border-b border-surface-4">
            {/* Rank */}
            <span className="text-sm font-medium text-accent leading-none whitespace-nowrap">
              #{rank}
            </span>

            {/* Flag + Name + Region */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={c.flagUrl}
                alt={t("a11y.flagAlt", "{{country}} flag", {
                  country: locC.name,
                })}
                className="object-cover shrink-0 w-9 h-6 rounded-[4px]"
                loading="eager"
              />
              <div className="flex items-baseline gap-2 min-w-0">
                <h2 className="text-white font-bold leading-[1.2] whitespace-nowrap [font-family:Oswald,_sans-serif]">
                  {locC.name}
                </h2>
                <span className="text-xs text-muted">{t(`regions.${regionKey(c.region)}`)}</span>
              </div>
            </div>

            {/* Score */}
            <span
              className={`font-bold leading-none whitespace-nowrap [font-family:Oswald,_sans-serif] ${scoreColourClass(finalScore, "text")}`}
            >
              {finalScore.toFixed(1)}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center transition-colors w-8 h-8 bg-border rounded text-muted"
              aria-label={t("a11y.closePanel", "Close panel")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Badge Row */}
          <div className="flex items-center gap-2 px-5 py-3 shrink-0 bg-surface">
            {c.hasNomadVisa && (
              <Link
                to={`${langPrefix}/country/${c.code.toLowerCase()}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-[10px] font-medium text-white no-underline"
              >
                <Plane size={11} /> {t("countryDetail.nomadVisa")}
              </Link>
            )}
          </div>

          {/* Breakdown section */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="text-[11px] font-semibold tracking-[1.5px] uppercase text-dim mb-3">
              {t("countryDetail.scoreBreakdown")}
            </h3>
            <ScoreBreakdown country={c} />

            {/* Tourism Scores Section */}
            {(() => {
              const tScore = computeTourismScore(c);
              if (tScore == null) return null;
              return (
                <div className="mt-6">
                  <h3 className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#6B9E6B] mb-3">
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
                          <div className="text-[9px] font-semibold tracking-[1px] uppercase text-[#666] mb-1.5">
                            {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {visibleKeys.map((key) => {
                              const val = c.scores[key]!.value!;
                              const color = TOURISM_COLORS[key] ?? "#888";
                              return (
                                <div key={key} className="flex items-center gap-2 h-[22px]">
                                  <span className="text-[11px] text-muted w-[130px] shrink-0">
                                    {t(`tourism.metrics.${key}`, CATEGORY_LABELS[key])}
                                  </span>
                                  <div className="flex-1 h-[6px] rounded-[3px] bg-surface-4 overflow-hidden">
                                    <div
                                      className="h-full rounded-[3px] w-[var(--bw)] bg-[var(--bc)]"
                                      style={
                                        { "--bw": `${val}%`, "--bc": color } as React.CSSProperties
                                      }
                                    />
                                  </div>
                                  <span className="font-mono text-[11px] font-semibold text-on-surface w-[28px] text-right shrink-0">
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
            {c.nomadVisa && (
              <NomadVisaDetails
                visa={c.nomadVisa}
                expanded={visaExpanded}
                onToggle={() => setVisaExpanded(!visaExpanded)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 shrink-0 flex flex-col gap-2 border-t border-border">
            <button
              onClick={() => {
                onViewInList();
                onClose();
              }}
              className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors h-10 bg-transparent border border-border rounded-md text-[13px] font-medium text-accent-dim"
            >
              <List size={14} />
              {t("countryDetail.viewInList")}
            </button>
            <Link
              to={`${langPrefix}/country/${c.code.toLowerCase()}`}
              onClick={onClose}
              className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors h-10 bg-transparent border border-border rounded-md text-[13px] font-medium text-accent-dim no-underline"
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
