import type { ComponentType, SVGProps } from "react";
import {
  Heart,
  Globe,
  Smile,
  Users,
  Wallet,
  Wifi,
  TrendingUp,
  Wheat,
  HeartPulse,
  GraduationCap,
  Leaf,
  CloudSun,
  ShieldCheck,
  Scale,
  MessageCircle,
  UserCheck,
  Truck,
  TreePine,
  Receipt,
  Briefcase,
  Plane,
  Stethoscope,
  Shield,
  Theater,
  Bed,
  UtensilsCrossed,
  Sun,
} from "lucide-react";

export type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const AI_INDICATOR_ROWS: Array<Array<[IconType, string]>> = [
  [
    [Users, "nomadCommunity"],
    [Globe, "visaFriendliness"],
  ],
  [
    [Wallet, "costEfficiency"],
    [Smile, "workLifeBalance"],
  ],
  [
    [Wifi, "digitalReadiness"],
    [Heart, "culturalFit"],
  ],
];

/** Rows of [Icon, translationKey] pairs — strings come from i18n */
export const INDICATOR_ICONS: Array<Array<[IconType, string]>> = [
  [
    [TrendingUp, "economy"],
    [Wallet, "affordability"],
  ],
  [
    [Wheat, "foodSecurity"],
    [HeartPulse, "healthcare"],
  ],
  [
    [GraduationCap, "education"],
    [Leaf, "environment"],
  ],
  [
    [CloudSun, "climate"],
    [ShieldCheck, "safety"],
  ],
  [
    [Wifi, "infrastructure"],
    [Smile, "happiness"],
  ],
  [
    [Users, "humanDevelopment"],
    [Scale, "governance"],
  ],
  [
    [MessageCircle, "englishProficiency"],
    [Globe, "digitalFreedom"],
  ],
  [
    [UserCheck, "personalFreedom"],
    [Truck, "logistics"],
  ],
  [
    [TreePine, "biodiversity"],
    [Heart, "socialTolerance"],
  ],
  [
    [Receipt, "taxFriendliness"],
    [Briefcase, "startupEnvironment"],
  ],
  [
    [Plane, "airConnectivity"],
    [Stethoscope, "healthcareCost"],
  ],
];

export const AI_INDICATOR_ICONS: Array<Array<[IconType, string]>> = [
  [
    [Users, "nomadCommunity"],
    [Globe, "visaFriendliness"],
  ],
  [
    [Wallet, "costEfficiency"],
    [Smile, "workLifeBalance"],
  ],
  [
    [Wifi, "digitalReadiness"],
    [Heart, "culturalFit"],
  ],
];

export const TOURISM_INDICATOR_ICONS: Array<Array<[IconType, string]>> = [
  [
    [Shield, "tourismSafety"],
    [Theater, "culturalAttractions"],
  ],
  [
    [TreePine, "naturalAttractions"],
    [Bed, "accommodationCost"],
  ],
  [
    [UtensilsCrossed, "foodAndDining"],
    [Sun, "seasonalAppeal"],
  ],
];
