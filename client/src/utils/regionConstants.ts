import { Sun, Mountain, Tent, Castle, Lamp, Waves } from "lucide-react";
import type { CategoryKey } from "./types";

export const REGION_COLORS: Record<string, string> = {
  Africa: "#FF6B6B",
  Americas: "#4ECDC4",
  Asia: "#FFE66D",
  Europe: "#6C5CE7",
  "Middle East": "#FD79A8",
  Oceania: "#00CEC9",
};

export const REGION_ICONS: Record<string, typeof Sun> = {
  Africa: Sun,
  Americas: Mountain,
  Asia: Tent,
  Europe: Castle,
  "Middle East": Lamp,
  Oceania: Waves,
};

export const REGION_COLUMN_WIDTH = "108px";

export interface RegionStats {
  name: string;
  count: number;
  color: string;
  overall: number;
  categories: Record<CategoryKey, { avg: number | null; count: number }>;
}
