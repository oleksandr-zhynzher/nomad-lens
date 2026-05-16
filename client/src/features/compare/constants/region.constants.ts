import type { CategoryKey } from "@core/models";
import { Castle, Lamp, Mountain, Sun, Tent, Waves } from "lucide-react";

export const REGION_COLORS: Partial<Record<string, string>> = {
  Africa: "#FF6B6B",
  Americas: "#4ECDC4",
  Asia: "#FFE66D",
  Europe: "#6C5CE7",
  "Middle East": "#FD79A8",
  Oceania: "#00CEC9",
};

export const REGION_ICONS: Partial<Record<string, typeof Sun>> = {
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
