import { useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { ResponsiveSidePanelLayout } from "@core/ui/layout";
import { useLangPrefix } from "@core/hooks";
import { useCountries } from "@core/hooks";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { localizeCountry } from "@core/utils";
import { BudgetSidebar } from "./BudgetSidebar";
import { BudgetHeroSection } from "./BudgetHeroSection";
import { BudgetStickyBar } from "./BudgetStickyBar";
import { BudgetResultsList } from "./BudgetResultsList";

function toggleCodeInSet(prev: Set<string>, code: string): Set<string> {
  const next = new Set(prev);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  return next;
}

export function BudgetMatcherPage() {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const { countries, loading } = useCountries();
  const bs = useBudgetState();
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const toggleSelect = (code: string) => {
    setSelectedCodes((prev) => toggleCodeInSet(prev, code));
  };
  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  };
  const handleCompare = () => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=budget&c=${[...selectedCodes].join(",")}`);
  };
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    lifestyle: false,
    categories: false,
  });
  const [copied, setCopied] = useState(false);
  const toggle = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const matches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );
  const query = search.trim().toLowerCase();
  const filteredMatches =
    query !== ""
      ? matches.filter((m) =>
          localizeCountry(m.country, i18n.language).name.toLowerCase().includes(query),
        )
      : matches;

  const sidebarContent = (
    <BudgetSidebar
      bs={bs}
      langPrefix={langPrefix}
      collapsed={collapsed}
      toggle={toggle}
      budgetPct={((bs.budget - 300) / 9700) * 100}
      copied={copied}
      setCopied={setCopied}
    />
  );

  return (
    <Layout>
      <ResponsiveSidePanelLayout
        sidebar={sidebarContent}
        mobileSheet={{
          open: mobileParamsOpen,
          title: t("budget.eyebrow", "BUDGET MATCHER"),
          closeLabel: t("a11y.closeParameters", "Close parameters"),
          onClose: () => {
            setMobileParamsOpen(false);
          },
          children: sidebarContent,
        }}
        mobileFab={{
          label: t("mobileSheet.parameters", "Parameters"),
          ariaLabel: t("a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => {
            setMobileParamsOpen(true);
          },
        }}
      >
        <div className="px-4 md:px-6">
          <BudgetHeroSection
            matchesCount={matches.length}
            budget={bs.budget}
            langPrefix={langPrefix}
          />
          <BudgetStickyBar
            searchInputRef={searchInputRef}
            search={search}
            onSearch={setSearch}
            compareMode={compareMode}
            selectedCodes={selectedCodes}
            onEnterCompareMode={() => {
              setCompareMode(true);
            }}
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
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}
