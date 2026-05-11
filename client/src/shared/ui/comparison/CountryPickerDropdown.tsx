import React from "react";

interface PickerCountry {
  code: string;
  flagUrl: string;
  name: string;
  regionLabel: string;
  trailing?: React.ReactNode;
}

interface Props {
  open: boolean;
  countries: PickerCountry[];
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (code: string) => void;
  position?: { top: number; left: number };
  inputName: string;
  searchPlaceholder: string;
  emptyLabel: string;
}

export function CountryPickerDropdown({
  open,
  countries,
  query,
  onQueryChange,
  onSelect,
  position,
  inputName,
  searchPlaceholder,
  emptyLabel,
}: Props) {
  if (!open) return null;

  const inner = (
    <>
      <input
        name={inputName}
        type="text"
        autoFocus
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full px-3 py-2.5 focus:outline-none bg-surface-3 border-b border-[#252525] text-white text-[13px]"
      />
      <div className="max-h-[320px] overflow-y-auto">
        {countries.map((c) => (
          <button
            key={c.code}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
            onClick={() => onSelect(c.code)}
          >
            <img src={c.flagUrl} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
            <span className="flex-1 truncate text-[13px] text-on-surface">{c.name}</span>
            <span className="text-[11px] text-dimmer">{c.regionLabel}</span>
            {c.trailing}
          </button>
        ))}
        {countries.length === 0 && (
          <div className="px-3 py-4 text-center text-[13px] text-dimmer">{emptyLabel}</div>
        )}
      </div>
    </>
  );

  if (position) {
    return (
      <div
        className="fixed z-50 rounded-lg overflow-hidden w-[320px] bg-surface border border-surface-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] top-[var(--tt)] left-[var(--tl)]"
        style={{ "--tt": `${position.top}px`, "--tl": `${position.left}px` } as React.CSSProperties}
      >
        {inner}
      </div>
    );
  }

  return (
    <div className="z-20 mt-1 rounded-lg overflow-hidden w-full md:w-[320px] bg-surface border border-surface-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {inner}
    </div>
  );
}
