import type { VisaSlotLangProps } from "@features/compare/utils";
import { getLocalizedVisa } from "@features/compare/utils";

export function VisaBenefitsCell({ slot, lang }: VisaSlotLangProps) {
  const { loc, visa } = getLocalizedVisa(slot.country, lang);
  const items = loc?.benefits ?? visa.benefits;
  return (
    <div className="flex flex-col gap-1">
      {items.map((b) => (
        <span key={b} className="text-[11px] leading-[1.3] text-muted">
          • {b}
        </span>
      ))}
    </div>
  );
}
