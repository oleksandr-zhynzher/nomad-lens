import { useLangPrefix } from "@core/hooks";
import type { RankedCountry } from "@core/models";
import { ScoreBreakdown } from "@core/ui/indicator";
import { useLocalizedCountry } from "@core/utils";
import { NomadVisaDetails } from "@features/nomad-visas/ui";
import { Plane } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CountryDetailPanelFooter } from "./CountryDetailPanelFooter";
import { CountryDetailPanelHeader } from "./CountryDetailPanelHeader";
import { CountryDetailTourismScores } from "./CountryDetailTourismScores";

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
      <button
        type="button"
        aria-label={t("countryDetails.close", "Close country details")}
        className="flex-1 bg-black/60"
        onClick={onClose}
      />

      <div className="flex h-screen w-full max-w-full flex-col overflow-hidden bg-surface md:h-full md:w-auto">
        <div className="flex shrink-0 justify-center pt-2 pb-1 md:hidden">
          <div className="h-1 w-9 rounded-full bg-[#444444]" />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden md:w-[480px]">
          <CountryDetailPanelHeader
            rank={rank}
            finalScore={finalScore}
            c={c}
            locC={locC}
            onClose={onClose}
          />

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

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[1.5px] text-dim uppercase">
              {t("countryDetail.scoreBreakdown")}
            </h3>
            <ScoreBreakdown country={c} />
            <CountryDetailTourismScores c={c} />
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

          <CountryDetailPanelFooter
            langPrefix={langPrefix}
            countryCode={c.code.toLowerCase()}
            onClose={onClose}
            onViewInList={onViewInList}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
