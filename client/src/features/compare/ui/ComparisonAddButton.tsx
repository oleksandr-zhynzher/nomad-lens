import { CirclePlus } from "lucide-react";

interface ComparisonAddButtonProps {
  readonly onClick: () => void;
  readonly label: string;
}

export function ComparisonAddButton({ onClick, label }: ComparisonAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#252525] bg-[#141416] p-4 transition-colors hover:border-[#3A3A3A] md:min-h-[180px]"
    >
      <CirclePlus size={28} className="text-on-surface" />
      <span className="text-xs text-on-surface">{label}</span>
    </button>
  );
}
