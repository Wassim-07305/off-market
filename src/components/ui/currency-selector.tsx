"use client";

import { Select } from "@/components/ui/select";
import {
  useUserCurrency,
  useUpdateDefaultCurrency,
} from "@/hooks/use-currency";
import type { SupportedCurrency } from "@/lib/utils";

const CURRENCY_OPTIONS: { value: SupportedCurrency; label: string }[] = [
  { value: "EUR", label: "\u20AC EUR" },
  { value: "USD", label: "$ USD" },
  { value: "GBP", label: "\u00A3 GBP" },
  { value: "CHF", label: "CHF" },
];

interface CurrencySelectorProps {
  /** Override value (uncontrolled by default = user's default currency) */
  value?: SupportedCurrency;
  /** Override onChange handler */
  onChange?: (currency: SupportedCurrency) => void;
  /** Show label above the select */
  label?: string;
  /** Additional class on wrapper */
  className?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  label,
  className,
  disabled,
}: CurrencySelectorProps) {
  const userCurrency = useUserCurrency();
  const updateCurrency = useUpdateDefaultCurrency();

  const currentValue = value ?? userCurrency;

  const handleChange = (val: string) => {
    const currency = val as SupportedCurrency;
    if (onChange) {
      onChange(currency);
    } else {
      updateCurrency.mutate(currency);
    }
  };

  return (
    <Select
      options={CURRENCY_OPTIONS}
      value={currentValue}
      onChange={handleChange}
      label={label}
      disabled={disabled || updateCurrency.isPending}
      className={className}
    />
  );
}
