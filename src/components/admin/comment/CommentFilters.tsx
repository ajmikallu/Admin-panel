import { Button } from "@/components/ui/button";
import type { FilterType } from "@/types/comment.types";

const FILTER_OPTIONS: FilterType[] = [
  "pending",
  "approved",
  "rejected",
  "spam",
  "all",
];

type CommentFiltersProps = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  disabled?: boolean;
};

export function CommentFilters({
  filter,
  onFilterChange,
  disabled = false,
}: CommentFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
      {FILTER_OPTIONS.map((f) => (
        <Button
          key={f}
          variant={filter === f ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(f)}
          className="text-xs sm:text-sm"
          disabled={disabled}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Button>
      ))}
    </div>
  );
}

