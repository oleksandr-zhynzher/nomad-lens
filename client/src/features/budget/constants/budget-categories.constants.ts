import { Bus, HeartPulse, House, Laptop, ShoppingCart, UtensilsCrossed, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const CATEGORY_ACCENT_CLASSES: Record<string, { border: string; text: string }> = {
  housing: { border: "border-[#8F5A3C]", text: "text-[#8F5A3C]" },
  groceries: { border: "border-[#6B9E6B]", text: "text-[#6B9E6B]" },
  dining: { border: "border-[#C2956A]", text: "text-[#C2956A]" },
  transport: { border: "border-[#5B8FA8]", text: "text-[#5B8FA8]" },
  utilities: { border: "border-[#7A9B6B]", text: "text-[#7A9B6B]" },
  coworking: { border: "border-[#8B7BAD]", text: "text-[#8B7BAD]" },
  healthInsurance: { border: "border-[#C07A9B]", text: "text-[#C07A9B]" },
};

export const CATEGORY_ROWS: Array<Array<[IconType, string]>> = [
  [
    [House, "housing"],
    [ShoppingCart, "groceries"],
  ],
  [
    [UtensilsCrossed, "dining"],
    [Bus, "transport"],
  ],
  [
    [Zap, "utilities"],
    [Laptop, "coworking"],
  ],
  [[HeartPulse, "healthInsurance"]],
];
