import type React from "react";

interface PickerCountry {
  code: string;
  flagUrl: string;
  name: string;
  regionLabel: string;
  trailing?: React.ReactNode;
}

interface CountryPickerDropdownProps {
  readonly open: boolean;
  readonly countries: PickerCountry[];
  readonly query: string;
  readonly onQueryChange: (q: string) => void;
  readonly onSelect: (code: string) => void;
  readonly position?: { top: number; left: number };
  readonly inputName: string;
  readonly searchPlaceholder: string;
  readonly emptyLabel: string;
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
}: CountryPickerDropdownProps) {
  if (!open) return null;

  const inner = (
    <>
      <input
        name={inputName}
        type="text"
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
        }}
        className="w-full border-b border-[#252525] bg-surface-3 px-3 py-2.5 text-[13px] text-white focus:outline-none"
      />
      <div className="max-h-[320px] overflow-y-auto">
        {countries.map((c) => (
          <button
            key={c.code}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            onClick={() => {
              onSelect(c.code);
            }}
          >
            <img src={c.flagUrl} alt={c.name} className="h-6 w-6 rounded-full object-cover" />
            <span className="flex-1 truncate text-[13px] text-on-surface">{c.name}</span>
            <span className="text-[11px] text-dimmer">{c.regionLabel}</span>
            {c.trailing}
          </button>
        ))}
        {countries.length === 0 ? (
          <div className="px-3 py-4 text-center text-[13px] text-dimmer">{emptyLabel}</div>
        ) : null}
      </div>
    </>
  );

  if (position) {
    return (
      <div
        className="fixed top-[var(--tt)] left-[var(--tl)] z-50 w-[320px] overflow-hidden rounded-lg border border-surface-4 bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{ "--tt": `${position.top}px`, "--tl": `${position.left}px` } as React.CSSProperties}
      >
        {inner}
      </div>
    );
  }

  return (
    <div className="z-20 mt-1 w-full overflow-hidden rounded-lg border border-surface-4 bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:w-[320px]">
      {inner}
    </div>
  );
}
