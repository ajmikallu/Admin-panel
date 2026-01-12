import type {
  UseFormRegister,
  RegisterOptions,
  FieldError,
  Control,
} from "react-hook-form";
export interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  validation?: RegisterOptions;
  disabled?: boolean;
  value?: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  placeholder: string;
  options: readonly Option[];
  control: Control<any>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}
