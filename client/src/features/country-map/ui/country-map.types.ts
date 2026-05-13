import type { RankedCountry } from "@core/models";

export interface WorldMapProps {
  readonly ranked: RankedCountry[];
  readonly onCountryClick: (iso2: string) => void;
  readonly onToggleWeights?: () => void;
  readonly showWeights?: boolean;
}

export interface HoverInfo {
  name: string;
  score: number | null;
  x: number;
  y: number;
}
