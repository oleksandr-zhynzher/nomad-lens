import { useMemo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { localizeCountry } from "@core/utils";
import { CountryDetailPanel } from "@features/country-ranking/ui";
import { geoNumericToAlpha2 } from "@features/country-map/utils";
import { MapHoverTooltip } from "./MapHoverTooltip";
import { MapComposableView } from "./MapComposableView";
import type { WorldMapProps, HoverInfo } from "./country-map.types";

interface MapInteractiveBodyProps extends WorldMapProps {
  readonly legendItems: Array<{ color: string; label: string; range: string }>;
  readonly worldTopology: object;
}

export function MapInteractiveBody({
  ranked,
  onCountryClick,
  onToggleWeights,
  showWeights,
  legendItems,
  worldTopology,
}: MapInteractiveBodyProps) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const scoreByAlpha2 = useMemo(() => new Map(ranked.map((r) => [r.country.code, r])), [ranked]);

  const handleMouseEnter = (
    geo: { id?: unknown; properties: Record<string, unknown> },
    e: MouseEvent,
  ) => {
    const alpha2 = geoNumericToAlpha2(geo);
    const r = scoreByAlpha2.get(alpha2);
    const fallbackName =
      typeof geo.properties["name"] === "string" ? geo.properties["name"] : alpha2;
    const name = r ? localizeCountry(r.country, i18n.language).name : fallbackName;
    setHover({ name, score: r?.finalScore ?? null, x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (hover) setHover((h) => h && { ...h, x: e.clientX, y: e.clientY });
  };
  const handleClick = (geo: { id?: unknown; properties: Record<string, unknown> }) => {
    const alpha2 = geoNumericToAlpha2(geo);
    if (alpha2 === "") return;
    setHover(null);
    setSelectedCode(alpha2);
  };
  const selectedCountry = selectedCode !== null ? (scoreByAlpha2.get(selectedCode) ?? null) : null;

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <MapComposableView
        scoreByAlpha2={scoreByAlpha2}
        selectedCode={selectedCode}
        worldTopology={worldTopology}
        legendItems={legendItems}
        {...(onToggleWeights !== undefined && { onToggleWeights })}
        {...(showWeights !== undefined && { showWeights })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          setHover(null);
        }}
        onClick={handleClick}
        geoLoading={geoLoading}
        setGeoLoading={setGeoLoading}
      />
      {hover ? (
        <MapHoverTooltip name={hover.name} score={hover.score} x={hover.x} y={hover.y} />
      ) : null}
      <p className="mt-2 pr-1 text-right text-[11px] text-dimmer">
        {t("map.countriesScored", { count: ranked.length })}
      </p>
      {selectedCountry ? (
        <CountryDetailPanel
          country={selectedCountry}
          onClose={() => {
            setSelectedCode(null);
          }}
          onViewInList={() => {
            onCountryClick(selectedCountry.country.code);
          }}
        />
      ) : null}
    </div>
  );
}
