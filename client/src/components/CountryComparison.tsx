import { useState } from "react";
import { CirclePlus, X } from "lucide-react";
import type { CountryData, WeightMap, ClimatePreferences } from "../utils/types";
import { computeScore } from "../utils/scoring";

const SLOT_COLORS = ["#8F5A3C", "#5B8FA8", "#6B9E6B", "#B07CC6"] as const;

interface Props {
  countries: CountryData[];
  weights: WeightMap;
  climatePrefs: ClimatePreferences;
}

export function CountryComparison({ countries, weights }: Props) {
  const [selectedCodes, setSelectedCodes] = useState<(string | null)[]>([null, null, null, null]);

  const selectedCountries = selectedCodes.map((code) =>
    code ? countries.find((c) => c.code === code) ?? null : null,
  );

  const handleRemove = (index: number) => {
    setSelectedCodes((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  return (
    <div>
      {/* Country selector slots */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {selectedCodes.map((code, i) => {
          const country = selectedCountries[i];
          const color = SLOT_COLORS[i];

          if (country) {
            const score = computeScore(country, weights);
            return (
              <FilledSlot
                key={i}
                country={country}
                score={score}
                color={color}
                onRemove={() => handleRemove(i)}
              />
            );
          }

          return (
            <EmptySlot
              key={i}
              color={color}
              countries={countries}
              weights={weights}
              excludedCodes={selectedCodes.filter(Boolean) as string[]}
              onSelect={(c) => {
                setSelectedCodes((prev) => {
                  const next = [...prev];
                  next[i] = c;
                  return next;
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Filled slot ───────────────────────────────────────────────────────────── */

function FilledSlot({
  country,
  score,
  color,
  onRemove,
}: {
  country: CountryData;
  score: number;
  color: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="relative rounded-lg p-5 flex flex-col items-center gap-3"
      style={{
        backgroundColor: `${color}18`,
        border: `1px solid ${color}33`,
      }}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
        style={{ opacity: 0.5, color: "#999999", fontFamily: "Geist, sans-serif", fontSize: "11px" }}
      >
        <X size={14} />
      </button>

      {/* Flag */}
      <img
        src={country.flagUrl}
        alt={country.name}
        className="rounded-full object-cover"
        style={{ width: "48px", height: "48px" }}
      />

      {/* Name */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          color: "#E8E9EB",
          textAlign: "center",
        }}
      >
        {country.name}
      </span>

      {/* Score */}
      <div className="flex items-baseline gap-1">
        <span
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "32px",
            color,
            lineHeight: 1,
          }}
        >
          {score.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "12px",
            color: "#555555",
          }}
        >
          /100
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-1.5">
        <span
          className="px-2 py-0.5 rounded-full"
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "10px",
            color: "#999999",
            backgroundColor: "#1C1C1C",
            border: "1px solid #2C2C2C",
          }}
        >
          {country.region}
        </span>
        {country.hasNomadVisa && (
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "10px",
              color: "var(--color-accent)",
              backgroundColor: "rgba(143, 90, 60, 0.15)",
              border: "1px solid rgba(143, 90, 60, 0.3)",
            }}
          >
            Nomad Visa
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Empty slot ────────────────────────────────────────────────────────────── */

function EmptySlot({
  color,
  countries,
  weights,
  excludedCodes,
  onSelect,
}: {
  color: string;
  countries: CountryData[];
  weights: WeightMap;
  excludedCodes: string[];
  onSelect: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = countries
    .filter(
      (c) =>
        !excludedCodes.includes(c.code) &&
        c.name.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 8);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors hover:border-[#3A3A3A]"
        style={{
          backgroundColor: "#141416",
          border: "1px dashed #252525",
          minHeight: "180px",
          cursor: "pointer",
        }}
      >
        <CirclePlus size={28} style={{ color: "#444444" }} />
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "12px",
            color: "#555555",
          }}
        >
          Add Country
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-20 mt-1 rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#1A1A1C",
            border: "1px solid #2A2A2A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Search country…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            {filtered.map((c) => {
              const score = computeScore(c, weights);
              return (
                <button
                  key={c.code}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  onClick={() => {
                    onSelect(c.code);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <img
                    src={c.flagUrl}
                    alt={c.name}
                    className="rounded-full object-cover"
                    style={{ width: "24px", height: "24px" }}
                  />
                  <span
                    className="flex-1 truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      color: "#E8E9EB",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "11px",
                      color: "#555555",
                    }}
                  >
                    {c.region}
                  </span>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "13px",
                      fontWeight: 600,
                      color,
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div
                className="px-3 py-4 text-center"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#555555",
                }}
              >
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
