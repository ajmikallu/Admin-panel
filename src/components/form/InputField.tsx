import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import type { InputFieldProps } from "./types";

const InputField = ({
  name,
  label,
  placeholder,
  type = "text",
  register,
  error,
  validation,
  disabled,
  value,
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        id={name}
        {...register(name, validation)}
        disabled={disabled}
        className={cn("form-input", {
          "cursor-not-allowed opacity-50": disabled,
        })}
        value={value}
      />
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
};

export default InputField;
