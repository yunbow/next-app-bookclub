export type FontSize = "small" | "medium" | "large";

export const FONT_SIZE_COOKIE_NAME = "font-size";
export const DEFAULT_FONT_SIZE: FontSize = "medium";
export const SUPPORTED_FONT_SIZES: readonly FontSize[] = ["small", "medium", "large"] as const;

// Tailwind CSS classes for each font size
export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

// Root font size values (applied to html element)
export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};
