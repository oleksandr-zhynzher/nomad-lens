import { createPortal } from "react-dom";
import type { RankedCountry } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface CountryDetailPanelProps {
  country: RankedCountry;
  onClose: () => void;
  onViewInList: () => void;
}

export function CountryDetailPanel({
  country,
  onClose,
  onViewInList,
}: CountryDetailPanelProps) {
  const { country: c, finalScore, rank } = country;

  return createPortal(
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-slate-950/40" />

      {/* Drawer */}
      <div
        className="w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-5 pt-5 pb-4 border-b border-slate-800 shrink-0">
          <img
            src={c.flagUrl}
            alt={`${c.name} flag`}
            className="w-14 h-9 object-cover rounded shrink-0 mt-0.5"
            loading="eager"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-100 truncate">
                {c.name}
              </h2>
              <span className="text-xs font-mono bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                #{rank}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{c.region}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${scoreColour(finalScore)}`}>
                {finalScore.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ScoreBreakdown country={c} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={() => { onViewInList(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors text-sm font-medium text-white"
          >
            View in list
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
