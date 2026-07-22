export const THEME_STORAGE_KEY = "finapp:theme";

export const THEME_COLORS = {
  light: "#7C3AED",
  dark: "#070B17",
} as const;

export type Theme = keyof typeof THEME_COLORS;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}
