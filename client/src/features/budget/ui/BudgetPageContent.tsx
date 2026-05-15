import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout, ResponsiveSidePanelLayout } from "@core/ui/layout";
import type { useBudgetState, useBudgetMatcher } from "@features/budget/hooks";
import { BudgetSidebar } from "./BudgetSidebar";
import { BudgetLayoutContent } from "./BudgetLayoutContent";

type BudgetMatches = ReturnType<typeof useBudgetMatcher>;
type BudgetState = ReturnType<typeof useBudgetState>;

interface BudgetPageContentProps {
  readonly loading: boolean;
  readonly matches: BudgetMatches;
  readonly bs: BudgetState;
  readonly langPrefix: string;
  readonly lang: string;
}

export function BudgetPageContent({
  loading,
  matches,
  bs,
  langPrefix,
  lang,
}: BudgetPageContentProps) {
  const { t } = useTranslation();
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    lifestyle: false,
    categories: false,
  });
  const [copied, setCopied] = useState(false);
  const toggle = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
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
          onClose: () => setMobileParamsOpen(false),
          children: sidebarContent,
        }}
        mobileFab={{
          label: t("mobileSheet.parameters", "Parameters"),
          ariaLabel: t("a11y.openParameters", "Open parameters"),
          icon: <SlidersHorizontal size={18} aria-hidden />,
          onClick: () => setMobileParamsOpen(true),
        }}
      >
        <BudgetLayoutContent
          matches={matches}
          bs={bs}
          langPrefix={langPrefix}
          loading={loading}
          lang={lang}
        />
      </ResponsiveSidePanelLayout>
    </Layout>
  );
}
