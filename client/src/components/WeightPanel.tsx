import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { CategoryKey, WeightMap } from "../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { defaultWeights, weightPercent } from "../utils/scoring";
import { Tooltip } from "./Tooltip";

interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
}

function WeightSlider({ categoryKey, value, onChange, weights }: WeightSliderProps) {
  const label = CATEGORY_LABELS[categoryKey];
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const source = CATEGORY_DATA_SOURCES[categoryKey];
  const pct = weightPercent(categoryKey, weights);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          <Tooltip
            content={
              <>
                <p className="font-medium text-slate-100 mb-1">{label}</p>
                <p className="text-slate-400 mb-2">{description}</p>
                <p className="text-slate-500 border-t border-slate-700 pt-1.5">
                  <span className="text-slate-600">Source: </span>{source}
                </p>
              </>
            }
          >
            <InformationCircleIcon className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors cursor-default" />
          </Tooltip>
        </div>
        <span className="text-xs font-mono text-sky-400 w-10 text-right">{pct}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(categoryKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-sky-400 cursor-pointer"
        aria-label={`${label} weight`}
      />
    </div>
  );
}

interface WeightPanelProps {
  weights: WeightMap;
  onChange: (key: CategoryKey, value: number) => void;
  onReset: () => void;
}

export function WeightPanel({ weights, onChange, onReset }: WeightPanelProps) {
  return (
    <aside className="flex flex-col bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden sticky top-14 h-[calc(100vh-3.5rem-1.5rem)]">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">Score Weights</h2>
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Drag sliders to prioritize what matters to you. Rankings update instantly.
        </p>
      </div>

      {/* Scrollable sliders */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="flex flex-col gap-4 py-1">
          {CATEGORY_KEYS.map((key) => (
            <WeightSlider
              key={key}
              categoryKey={key}
              value={weights[key]}
              onChange={onChange}
              weights={weights}
            />
          ))}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Percentages shown are relative shares of all active weights.
        </p>
      </div>
    </aside>
  );
}

export { defaultWeights };

