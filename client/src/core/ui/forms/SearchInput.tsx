import { Search, X } from "lucide-react";
import type { ReactNode, Ref } from "react";

interface SearchInputProps {
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly ariaLabel?: string;
  readonly placeholder?: string;
  readonly clearLabel?: string;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly after?: ReactNode;
}

export function SearchInput({
  name,
  value,
  onValueChange,
  ariaLabel,
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
        aria-label={ariaLabel ?? placeholder ?? name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
        className="focus-visible:ring-offset-background h-10 w-full rounded-md border border-surface bg-[#161616] pr-9 pl-9 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      />
      {value !== "" ? (
        <button
          type="button"
          onClick={() => {
            onValueChange("");
          }}
          className="focus-visible:ring-offset-background absolute top-1/2 right-3 flex size-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
