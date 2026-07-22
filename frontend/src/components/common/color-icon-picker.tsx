"use client";

import { Label } from "@/components/ui/label";
import { colorOptions, iconOptions, resolveIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ColorIconPickerProps {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
}

/**
 * Seleção de cor e ícone.
 *
 * Uma paleta fechada mantém as telas visualmente coerentes — cores livres
 * quebrariam a leitura dos gráficos, onde a cor da categoria é o identificador.
 */
export function ColorIconPicker({ color, icon, onColorChange, onIconChange }: ColorIconPickerProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onColorChange(option)}
              aria-label={`Cor ${option}`}
              aria-pressed={color.toUpperCase() === option.toUpperCase()}
              className={cn(
                "size-8 rounded-lg transition-transform hover:scale-105",
                color.toUpperCase() === option.toUpperCase() &&
                  "ring-2 ring-white/70 ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: option }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ícone</Label>
        <div className="grid grid-cols-8 gap-2">
          {iconOptions.map((option) => {
            const Icon = resolveIcon(option);
            const selected = icon === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onIconChange(option)}
                aria-label={`Ícone ${option}`}
                aria-pressed={selected}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border transition-colors",
                  selected
                    ? "border-transparent text-white"
                    : "border-border text-muted-foreground hover:bg-secondary",
                )}
                style={selected ? { backgroundColor: color } : undefined}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
