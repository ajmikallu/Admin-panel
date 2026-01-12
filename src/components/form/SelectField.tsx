import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SelectFieldProps } from "./types";

const NONE_VALUE = "__none__";

const SelectField = ({
  name,
  label,
  placeholder,
  options,
  control,
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) => {
  // 🔒 Safety check (optional but recommended)
  if (options.some((o) => o.value === "")) {
    throw new Error("SelectField options must not contain empty string values");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? NONE_VALUE}
            onValueChange={(value) =>
              field.onChange(value === NONE_VALUE ? null : value)
            }
            disabled={disabled}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value={NONE_VALUE}>No Parent</SelectItem>

                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default SelectField;
