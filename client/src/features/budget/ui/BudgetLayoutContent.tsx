import { localizeCountry } from "@core/utils";
import type { useBudgetMatcher, useBudgetState } from "@features/budget/hooks";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BudgetHeroSection } from "./BudgetHeroSection";
import { BudgetResultsList } from "./BudgetResultsList";
import { BudgetStickyBar } from "./BudgetStickyBar";

type BudgetMatches = ReturnType<typeof useBudgetMatcher>;
type BudgetState = ReturnType<typeof useBudgetState>;

interface BudgetLayoutContentProps {
  readonly matches: BudgetMatches;
  readonly bs: BudgetState;
  readonly langPrefix: string;
  readonly loading: boolean;
  readonly lang: string;
}

export function BudgetLayoutContent({
  matches,
  bs,
  langPrefix,
  loading,
  lang,
}: BudgetLayoutContentProps) {
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toggleSelect = (code: string) =>
    setSelectedCodes((prev) => {
      const n = new Set(prev);
      if (n.has(code)) {
        n.delete(code);
      } else {
        n.add(code);
      }
      return n;
    });
  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  };
  const handleCompare = () => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=budget&c=${[...selectedCodes].join(",")}`);
  };
  const query = search.trim().toLowerCase();
  const filteredMatches =
    query !== ""
      ? matches.filter((m) => localizeCountry(m.country, lang).name.toLowerCase().includes(query))
      : matches;
  return (
    <div className="px-4 md:px-6">
      <BudgetHeroSection matchesCount={matches.length} budget={bs.budget} langPrefix={langPrefix} />
      <BudgetStickyBar
        searchInputRef={searchInputRef}
        search={search}
        onSearch={setSearch}
        compareMode={compareMode}
        selectedCodes={selectedCodes}
        onEnterCompareMode={() => setCompareMode(true)}
        onExitCompareMode={exitCompareMode}
        onCompare={handleCompare}
        langPrefix={langPrefix}
      />
      <BudgetResultsList
        loading={loading}
        matchesTotal={matches.length}
        filteredMatches={filteredMatches}
        compareMode={compareMode}
        selectedCodes={selectedCodes}
        expandedCode={expandedCode}
        toggleSelect={toggleSelect}
        setExpandedCode={setExpandedCode}
        budget={bs.budget}
      />
    </div>
  );
}
