"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | undefined;
  onChange: (value: number) => void;
}

/**
 * Campo monetário com prefixo "R$".
 *
 * Mantém o texto digitado em estado próprio para que a vírgula decimal
 * brasileira funcione enquanto o formulário continua recebendo um número.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [text, setText] = React.useState(() => (value ? String(value).replace(".", ",") : ""));

    // Sincroniza quando o valor muda por fora (abrir o formulário em edição).
    React.useEffect(() => {
      setText(value ? String(value).replace(".", ",") : "");
    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value.replace(/[^\d.,]/g, "");
      setText(raw);

      const normalized = raw.replace(/\./g, "").replace(",", ".");
      const parsed = Number.parseFloat(normalized);
      onChange(Number.isNaN(parsed) ? 0 : parsed);
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          inputMode="decimal"
          placeholder="0,00"
          value={text}
          onChange={handleChange}
          className={cn("pl-9 tabular-nums", className)}
          {...props}
        />
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";
