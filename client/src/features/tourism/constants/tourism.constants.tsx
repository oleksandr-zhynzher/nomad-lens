import {
  Bed,
  Bus,
  Mountain,
  Music,
  Plane,
  Shield,
  Smile,
  Sun,
  Theater,
  TreePine,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import type React from "react";

// Icon component references for each tourism metric (used in TourismComparison table header)
export const TOURISM_ICONS: Record<string, typeof Shield> = {
  tourismSafety: Shield,
  culturalAttractions: Theater,
  naturalAttractions: TreePine,
  accommodationCost: Bed,
  foodAndDining: UtensilsCrossed,
  seasonalAppeal: Sun,
  transportCost: Bus,
  travelAccessibility: Plane,
  tourismInfrastructure: Wifi,
  localFriendliness: Smile,
};

// Fallback English labels for tourism metrics (i18n keys take precedence at render time)
export const TOURISM_LABELS: Record<string, string> = {
  tourismSafety: "Tourism Safety",
  culturalAttractions: "Cultural Attractions",
  naturalAttractions: "Natural Attractions",
  accommodationCost: "Accommodation Cost",
  foodAndDining: "Food & Dining",
  seasonalAppeal: "Seasonal Appeal",
  transportCost: "Transport Cost",
  travelAccessibility: "Travel Accessibility",
  tourismInfrastructure: "Tourism Infrastructure",
  localFriendliness: "Local Friendliness",
};

export const TOURISM_COMPARISON_COLUMN_WIDTH = "112px";

// Pre-rendered icon elements for the TourismWeightPanel group headers
export const TOURISM_GROUP_ICONS: Record<string, React.ReactElement> = {
  safetyPeople: <Shield size={16} color="#6B9E6B" />,
  sightseeingNature: <Mountain size={16} color="#5B8FA8" />,
  activitiesLifestyle: <Music size={16} color="#8B5CF6" />,
};
