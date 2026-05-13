import type React from "react";
import {
  Briefcase,
  HeartPulse,
  ShieldCheck,
  GraduationCap,
  Leaf,
  Globe,
  Sparkles,
} from "lucide-react";
import type { CategoryKey, SeasonType } from "@core/models";

export const SEASON_ROW1: { value: SeasonType | "any"; labelKey: string }[] = [
  { value: "any", labelKey: "climate.seasons.any" },
  { value: "four_seasons", labelKey: "climate.seasons.fourSeasons" },
  { value: "mild_seasons", labelKey: "climate.seasons.mild" },
];

export const SEASON_ROW2: { value: SeasonType | "any"; labelKey: string }[] = [
  { value: "tropical", labelKey: "climate.seasons.tropical" },
  { value: "arid", labelKey: "climate.seasons.arid" },
  { value: "polar", labelKey: "climate.seasons.polar" },
];

/** Logical groups for the weight panel. Order here = render order. */
export const WEIGHT_GROUPS: {
  label: string;
  labelKey: string;
  icon: React.ReactElement;
  keys: CategoryKey[];
}[] = [
  {
    label: "ECONOMIC",
    labelKey: "weights.groups.economic",
    icon: <Briefcase size={16} color="#8F5A3C" />,
    keys: ["economy", "affordability", "taxFriendliness", "startupEnvironment"],
  },
  {
    label: "HEALTH & WELLBEING",
    labelKey: "weights.groups.healthWellbeing",
    icon: <HeartPulse size={16} color="#C2956A" />,
    keys: ["healthcare", "healthcareCost", "foodSecurity", "happiness"],
  },
  {
    label: "SAFETY & FREEDOM",
    labelKey: "weights.groups.safetyFreedom",
    icon: <ShieldCheck size={16} color="#6B9E6B" />,
    keys: ["safety", "personalFreedom", "socialTolerance"],
  },
  {
    label: "EDUCATION & DEVELOPMENT",
    labelKey: "weights.groups.educationDevelopment",
    icon: <GraduationCap size={16} color="#5B8FA8" />,
    keys: ["education", "humanDevelopment"],
  },
  {
    label: "ENVIRONMENT & CLIMATE",
    labelKey: "weights.groups.environmentClimate",
    icon: <Leaf size={16} color="#7A9B6B" />,
    keys: ["climate", "environment"],
  },
  {
    label: "CONNECTIVITY",
    labelKey: "weights.groups.connectivity",
    icon: <Globe size={16} color="#8B7BAD" />,
    keys: ["infrastructure", "logistics", "airConnectivity", "englishProficiency"],
  },
  {
    label: "AI INSIGHTS",
    labelKey: "weights.groups.aiInsights",
    icon: <Sparkles size={16} color="#C084FC" />,
    keys: [
      "nomadCommunity",
      "visaFriendliness",
      "costEfficiency",
      "workLifeBalance",
      "digitalReadiness",
      "culturalFit",
    ],
  },
];
