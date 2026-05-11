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
        className="w-full px-3 py-2.5 focus:outline-none"
        style={{
          backgroundColor: "#141416",
          border: "none",
          borderBottom: "1px solid #252525",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
        }}
      />
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {countries.map((c) => (
          <button
            key={c.code}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
            onClick={() => onSelect(c.code)}
          >
            <img
              src={c.flagUrl}
              alt={c.name}
              className="rounded-full object-cover"
              style={{ width: "24px", height: "24px" }}
            />
            <span
              className="flex-1 truncate"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E8E9EB" }}
            >
              {c.name}
            </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#808080" }}>
              {c.regionLabel}
            </span>
            {c.trailing}
          </button>
        ))}
        {countries.length === 0 && (
          <div
            className="px-3 py-4 text-center"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#808080" }}
          >
            {emptyLabel}
          </div>
        )}
      </div>
    </>
  );

  if (position) {
    return (
      <div
        className="z-50 rounded-lg overflow-hidden w-[320px]"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          backgroundColor: "#1A1A1C",
          border: "1px solid #2A2A2A",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className="z-20 mt-1 rounded-lg overflow-hidden w-full md:w-[320px]"
      style={{
        backgroundColor: "#1A1A1C",
        border: "1px solid #2A2A2A",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {inner}
    </div>
  );
}
