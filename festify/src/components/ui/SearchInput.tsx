"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  label = "Search",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="absolute left-0 top-1/2 -translate-y-1/2 text-smoke"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "h-11 w-full border-0 border-b border-line bg-transparent pl-7 pr-8",
          "text-[15px] text-paper placeholder:text-smoke",
          "focus:border-paper focus:outline-none transition-colors"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-smoke transition-colors hover:text-paper"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
