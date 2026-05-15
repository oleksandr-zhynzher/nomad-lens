import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { ComposableMap, Geographies, ZoomableGroup, Sphere, Graticule } from "react-simple-maps";
import type { RankedCountry } from "@core/models";
import { MapGeographies } from "./MapGeographies";
import { MapZoomControls, MapLegend } from "./MapControls";

interface GeoObject {
  id?: unknown;
  properties: Record<string, unknown>;
}

interface MapComposableViewProps {
  readonly scoreByAlpha2: Map<string, RankedCountry>;
  readonly selectedCode: string | null;
  readonly worldTopology: object;
  readonly legendItems: Array<{ color: string; label: string; range: string }>;
  readonly onToggleWeights?: () => void;
  readonly showWeights?: boolean;
  readonly onMouseEnter: (geo: GeoObject, e: React.MouseEvent) => void;
  readonly onMouseLeave: () => void;
  readonly onClick: (geo: GeoObject) => void;
  readonly setGeoLoading: Dispatch<SetStateAction<boolean>>;
  readonly geoLoading: boolean;
}

export function MapComposableView({
  scoreByAlpha2,
  selectedCode,
  worldTopology,
  legendItems,
  onToggleWeights,
  showWeights,
  onMouseEnter,
  onMouseLeave,
  onClick,
  setGeoLoading,
  geoLoading,
}: MapComposableViewProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  return (
    <>
      {geoLoading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#2A2A2A] border-t-accent-dim" />
        </div>
      ) : null}
      <MapZoomControls
        zoom={zoom}
        onZoomIn={() => {
          setZoom((z) => Math.min(z * 1.5, 12));
        }}
        onZoomOut={() => {
          setZoom((z) => Math.max(z / 1.5, 1));
        }}
        onToggleWeights={onToggleWeights}
        showWeights={showWeights}
      />
      <MapLegend items={legendItems} scoreLabel={t("map.score")} />
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={900}
        height={460}
        className="h-auto w-full bg-[#0A0A0F]"
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={(pos: unknown) => {
            const p = pos as { coordinates: [number, number]; zoom: number };
            setCenter(p.coordinates);
            setZoom(p.zoom);
          }}
        >
          <Sphere fill="#0A0A0F" stroke="#1A1A1A" strokeWidth={0.5} />
          <Graticule stroke="#1A1A1A" strokeWidth={0.3} />
          <Geographies geography={worldTopology}>
            {({ geographies }) => (
              <MapGeographies
                geographies={geographies}
                geoLoading={geoLoading}
                selectedCode={selectedCode}
                zoom={zoom}
                scoreByAlpha2={scoreByAlpha2}
                handleMouseEnter={onMouseEnter}
                handleMouseLeave={onMouseLeave}
                handleClick={onClick}
                setGeoLoading={setGeoLoading}
              />
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </>
  );
}
