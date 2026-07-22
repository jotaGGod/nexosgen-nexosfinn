export const THEME_STORAGE_KEY = "finapp:theme";

export const THEME_COLORS = {
  light: "#F8FAFC",
  dark: "#070C17",
} as const;

export type Theme = keyof typeof THEME_COLORS;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}
