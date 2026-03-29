import type { CategoryKey, WeightMap } from "../utils/types";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { defaultWeights, weightPercent } from "../utils/scoring";

interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
}

function WeightSlider({ categoryKey, value, onChange, weights }: WeightSliderProps) {
  const label = CATEGORY_LABELS[categoryKey];
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const pct = weightPercent(categoryKey, weights);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="text-xs font-mono text-sky-400 w-10 text-right">{pct}</span>
      </div>
      <p className="text-xs text-slate-500 leading-tight mb-1">{description}</p>
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
    <aside className="flex flex-col gap-5 bg-slate-800 border border-slate-700 rounded-2xl p-5 h-fit sticky top-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">
          Score Weights
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-slate-500 -mt-3">
        Drag sliders to prioritize what matters to you. Rankings update instantly.
      </p>

      <div className="flex flex-col gap-4">
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

      <div className="pt-2 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Percentages shown are relative shares of all active weights.
        </p>
      </div>
    </aside>
  );
}

export { defaultWeights };
