import type React from "react";
import { REGION_ICONS } from "@features/compare/constants";

export interface RegionIconProps {
  readonly name: string;
  readonly active: boolean;
  readonly color: string;
}

export function RegionIcon({ name, active, color }: RegionIconProps) {
  const Icon = REGION_ICONS[name];
  if (Icon == null) return null;
  return (
    <Icon
      size={20}
      style={{ "--ic": active ? color : "#808080" } as React.CSSProperties}
      className="text-[var(--ic)]"
    />
  );
}
