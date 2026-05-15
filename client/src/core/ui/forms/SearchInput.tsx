import { Search, X } from "lucide-react";
import type { ReactNode, Ref } from "react";

interface SearchInputProps {
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly clearLabel?: string;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly after?: ReactNode;
}

export function SearchInput({
  name,
  value,
  onValueChange,
  placeholder,
  clearLabel = "Clear search",
  inputRef,
  after,
}: SearchInputProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dim"
        size={16}
        aria-hidden
      />
      <input
        ref={inputRef}
        name={name}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
        className="h-10 w-full rounded-md border border-surface bg-[#161616] pr-9 pl-9 text-sm text-white focus:outline-none"
      />
      {value !== "" ? (
        <button
          type="button"
          onClick={() => {
            onValueChange("");
          }}
          className="absolute top-1/2 right-3 flex h-[22px] w-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary"
          aria-label={clearLabel}
        >
          <X size={13} aria-hidden />
        </button>
      ) : (
        (after ?? null)
      )}
    </div>
  );
}
