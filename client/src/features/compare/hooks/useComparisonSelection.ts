import { useEffect, useRef, useState } from "react";
import { localizeCountry } from "@core/utils";
import { getComparisonSlotColor } from "@features/compare/constants";
import type { CountryData } from "@core/models";

interface UseComparisonSelectionOptions {
  allCandidates: CountryData[];
  selectedCodes: string[];
  onSelectedCodesChange: (codes: string[]) => void;
  lang: string;
  onSelectionCount?: (count: number) => void;
}

interface SelectedSlot {
  country: CountryData;
  color: string;
  index: number;
}

interface UseComparisonSelectionResult {
  selectedSlots: SelectedSlot[];
  handleAdd: (code: string) => void;
  handleRemove: (index: number) => void;
  filteredCandidates: CountryData[];
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownPos: { top: number; left: number } | null;
  setDropdownPos: React.Dispatch<React.SetStateAction<{ top: number; left: number } | null>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  addBtnRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  bodyRef: React.RefObject<HTMLDivElement | null>;
}

export function useComparisonSelection({
  allCandidates,
  selectedCodes,
  onSelectedCodesChange,
  lang,
  onSelectionCount,
}: UseComparisonSelectionOptions): UseComparisonSelectionResult {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");
  const addBtnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const selectedSlots = selectedCodes
    .map((code, i) => {
      const country = allCandidates.find((c) => c.code === code);
      return country ? { country, color: getComparisonSlotColor(i), index: i } : null;
    })
    .filter(Boolean) as SelectedSlot[];

  const handleRemove = (index: number) => {
    onSelectedCodesChange(selectedCodes.filter((_, i) => i !== index));
  };

  const handleAdd = (code: string) => {
    onSelectedCodesChange([...selectedCodes, code]);
    setDropdownOpen(false);
    setQuery("");
  };

  useEffect(() => {
    onSelectionCount?.(selectedCodes.length);
  }, [selectedCodes.length, onSelectionCount]);

  const filteredCandidates = allCandidates
    .filter(
      (c) =>
        !selectedCodes.includes(c.code) &&
        localizeCountry(c, lang).name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => localizeCountry(a, lang).name.localeCompare(localizeCountry(b, lang).name));

  return {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates,
    dropdownOpen,
    setDropdownOpen,
    dropdownPos,
    setDropdownPos,
    query,
    setQuery,
    addBtnRef,
    headerRef,
    bodyRef,
  };
}
