import type { CompareMode } from "@features/compare/utils";

export const SORTABLE_COMPARE_MODES = new Set<CompareMode>(["countries", "budget", "tourism"]);
export const SHOW_WEIGHTS_MODES = new Set<CompareMode>(["budget", "tourism"]);
