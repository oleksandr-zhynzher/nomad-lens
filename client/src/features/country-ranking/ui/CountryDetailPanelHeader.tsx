import type { CountryData } from "@core/models";
import { regionKey, scoreColourClass } from "@core/utils";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CountryDetailPanelHeaderProps {
  readonly rank: number;
  readonly finalScore: number;
  readonly c: CountryData;
  readonly locC: { readonly name: string };
  readonly onClose: () => void;
}

export function CountryDetailPanelHeader({
  rank,
  finalScore,
  c,
  locC,
  onClose,
}: CountryDetailPanelHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-surface-4 bg-surface-2 px-5 pt-5 pb-4">
      <span className="text-sm leading-none font-medium whitespace-nowrap text-accent">
        #{rank}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={c.flagUrl}
          alt={t("a11y.flagAlt", "{{country}} flag", { country: locC.name })}
          className="h-6 w-9 shrink-0 rounded-[4px] object-cover"
          loading="eager"
        />
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="[font-family:Oswald,_sans-serif] leading-[1.2] font-semibold whitespace-nowrap text-white">
            {locC.name}
          </h2>
          <span className="text-xs text-muted">{t(`regions.${regionKey(c.region)}`)}</span>
        </div>
      </div>

      <span
        className={`[font-family:Oswald,_sans-serif] leading-none font-bold whitespace-nowrap ${scoreColourClass(finalScore, "text")}`}
      >
        {finalScore.toFixed(1)}
      </span>

      <button
        onClick={onClose}
        className="flex size-8 shrink-0 items-center justify-center rounded bg-border text-muted transition-colors"
        aria-label={t("a11y.closePanel", "Close panel")}
      >
        <X size={18} />
      </button>
    </div>
  );
}
