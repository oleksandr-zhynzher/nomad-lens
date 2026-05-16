import {
  FileCheck,
  Banknote,
  Wallet,
  Receipt,
  Globe,
  CheckCircle2,
  Plane,
  Clock,
} from "lucide-react";
import type { NomadVisaTax } from "../models/visa.models";

type TaxStatus = NomadVisaTax["status"];
interface TaxStatusColor {
  bg: string;
  text: string;
}

export const TAX_STATUS_COLORS: Record<TaxStatus, TaxStatusColor> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

export type VisaField =
  | "visaName"
  | "overallScore"
  | "monthlyBudget"
  | "duration"
  | "maxExtension"
  | "renewable"
  | "cost"
  | "income"
  | "taxStatus"
  | "online"
  | "processingTime"
  | "benefits";

export const VISA_FIELDS: Array<{ key: VisaField; icon: typeof Clock }> = [
  { key: "visaName", icon: FileCheck },
  { key: "duration", icon: Clock },
  { key: "maxExtension", icon: Clock },
  { key: "renewable", icon: CheckCircle2 },
  { key: "cost", icon: Banknote },
  { key: "income", icon: Wallet },
  { key: "taxStatus", icon: Receipt },
  { key: "online", icon: Globe },
  { key: "processingTime", icon: FileCheck },
  { key: "overallScore", icon: FileCheck },
  { key: "monthlyBudget", icon: Wallet },
  { key: "benefits", icon: Plane },
];

export const VISA_COMPARISON_COLUMN_WIDTH = "200px";
export const VISA_COMPARISON_COLUMN_GAP = "16px";
