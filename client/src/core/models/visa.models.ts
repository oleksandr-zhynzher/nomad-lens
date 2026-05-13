export interface NomadVisaDuration {
  initial: number;
  maxExtension: number;
  renewable: boolean;
}

export interface NomadVisaCost {
  currency: string;
  amount: number;
  notes: string;
}

export interface NomadVisaIncomeRequirement {
  currency: string;
  monthly: number | null;
  annual: number | null;
  notes: string;
}

export interface NomadVisaTax {
  status: "exempt" | "standard" | "special";
  rate: number | null;
  notes: string;
}

export interface NomadVisaEligibility {
  minAge: number;
  requirements: string[];
}

export interface NomadVisaApplicationProcess {
  online: boolean;
  processingTime: string;
  documents: string[];
}

export interface NomadVisaLocalization {
  benefits?: string[];
  eligibility?: { requirements?: string[] };
  applicationProcess?: { processingTime?: string; documents?: string[] };
  tax?: { notes?: string };
  cost?: { notes?: string };
  incomeRequirement?: { notes?: string };
}

export interface NomadVisaDetails {
  code: string;
  visaName: string;
  officialUrl: string;
  duration: NomadVisaDuration;
  cost: NomadVisaCost;
  incomeRequirement: NomadVisaIncomeRequirement;
  tax: NomadVisaTax;
  eligibility: NomadVisaEligibility;
  benefits: string[];
  applicationProcess: NomadVisaApplicationProcess;
  lastUpdated: string;
  i18n?: { ru?: NomadVisaLocalization; ua?: NomadVisaLocalization };
}
