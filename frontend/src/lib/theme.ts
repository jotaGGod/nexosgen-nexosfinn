export const THEME_STORAGE_KEY = "nexosgen-financehub:theme";

export const THEME_COLORS = {
  light: "#FCFCFD",
  dark: "#050505",
} as const;

export type Theme = keyof typeof THEME_COLORS;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}
