import { useTranslation } from "react-i18next";
import type { CompareMode } from "@features/compare/utils";
import { MobileSheet } from "@core/ui";
import type { useWeightState } from "@features/country-ranking/hooks";
import type { useTourismWeightState } from "@features/tourism/hooks";
import type { useBudgetState } from "@features/budget/hooks";
import { CompareModeToggle } from "./CompareModeToggle";
import { CompareActionBar } from "./CompareActionBar";
import { CompareParametersPanel } from "./CompareParametersPanel";

interface CompareActionSectionProps {
  readonly compareMode: CompareMode;
  readonly onCompareMode: (mode: CompareMode) => void;
  readonly showWeights: boolean;
  readonly onToggleWeights: () => void;
  readonly showSortAction: boolean;
  readonly sortFeedbackActive: boolean;
  readonly sortButtonLabel: string;
  readonly sortButtonIconClassName: string;
  readonly onSortByScore: () => void;
  readonly copied: boolean;
  readonly onShare: () => void;
  readonly actionGridClassName: string;
  readonly mobileParamsOpen: boolean;
  readonly onMobileParamsClose: () => void;
  readonly rankingState: ReturnType<typeof useWeightState>;
  readonly tourismState: ReturnType<typeof useTourismWeightState>;
  readonly budgetState: ReturnType<typeof useBudgetState>;
}

export function CompareActionSection({
  compareMode,
  onCompareMode,
  showWeights,
  onToggleWeights,
  showSortAction,
  sortFeedbackActive,
  sortButtonLabel,
  sortButtonIconClassName,
  onSortByScore,
  copied,
  onShare,
  actionGridClassName,
  mobileParamsOpen,
  onMobileParamsClose,
  rankingState,
  tourismState,
  budgetState,
}: CompareActionSectionProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-4 flex flex-col items-start gap-3 sm:sticky sm:top-14 sm:z-20 sm:-mx-4 md:mb-6 sm:flex-row sm:items-center md:gap-4 sm:border-b sm:border-[#1C1C1C] sm:bg-[#0F1114] sm:px-4 sm:py-2">
        <CompareModeToggle compareMode={compareMode} onCompareMode={onCompareMode} />
        <CompareActionBar
          showWeights={showWeights}
          onToggleWeights={onToggleWeights}
          showSortAction={showSortAction}
          sortFeedbackActive={sortFeedbackActive}
          sortButtonLabel={sortButtonLabel}
          sortButtonIconClassName={sortButtonIconClassName}
          onSortByScore={onSortByScore}
          copied={copied}
          onShare={onShare}
          actionGridClassName={actionGridClassName}
        />
      </div>
      <MobileSheet
        open={mobileParamsOpen}
        title={t("compare.parameters")}
        closeLabel={t("a11y.closeParameters", "Close parameters")}
        onClose={onMobileParamsClose}
      >
        <div className="flex-1 overflow-y-auto">
          <CompareParametersPanel
            compareMode={compareMode}
            rankingState={rankingState}
            tourismState={tourismState}
            budgetState={budgetState}
            onShare={onShare}
            mobile
          />
        </div>
      </MobileSheet>
    </>
  );
}
