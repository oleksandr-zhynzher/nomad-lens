import type { NomadVisaDetails as NomadVisaDetailsType } from "@core/models";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NomadVisaInfoGrid } from "./NomadVisaInfoGrid";

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
        type="button"
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
      {expanded ? <NomadVisaInfoGrid visa={visa} /> : null}
    </div>
  );
}
