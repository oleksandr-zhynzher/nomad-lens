import type { CountryData, NomadVisaDetails } from "@core/models";
import { localizeCountry } from "@core/utils";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type VisaCountry = CountryData & { nomadVisa: NomadVisaDetails };

interface NomadVisaCompareHeaderProps {
  readonly langPrefix: string;
  readonly lang: string;
  readonly selected: VisaCountry[];
  readonly count: number;
}

export function NomadVisaCompareHeader({
  langPrefix,
  lang,
  selected,
  count,
}: NomadVisaCompareHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      <Link
        to={`${langPrefix}/nomad-visas`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-dim no-underline"
      >
        <ArrowLeft size={14} />
        {t("nomadVisasPage.backToVisas", "Back to Nomad")}
      </Link>
      <h1 className="mb-8 font-display text-[28px] font-semibold tracking-[1px] text-white uppercase">
        {t("nomadVisasPage.compareTitle", "Nomad Visa Comparison")}
      </h1>
      <div className="grid grid-cols-[160px_1fr] border-b-2 border-[#2A2A2A] bg-[#111113]">
        <div className="p-4" />
        <div className="flex">
          {selected.map((c) => {
            const loc = localizeCountry(c, lang);
            return (
              <div
                key={c.code}
                className="flex min-w-0 shrink-0 grow-0 items-center gap-2.5 border-l border-[#1E1E1E] p-4"
                style={{ flex: `0 0 ${100 / count}%` }}
              >
                <img
                  src={c.flagUrl}
                  alt={loc.name}
                  className="h-[19px] w-7 shrink-0 rounded-[3px] object-cover"
                />
                <span className="overflow-hidden text-[15px] font-semibold text-ellipsis whitespace-nowrap text-white">
                  {loc.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
