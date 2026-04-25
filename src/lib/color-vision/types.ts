export type ColorVisionMode = "normal" | "protanopia" | "deuteranopia" | "tritanopia";

export const COLOR_VISION_COOKIE_NAME = "color-vision-mode";

export const DEFAULT_COLOR_VISION_MODE: ColorVisionMode = "normal";

export const COLOR_VISION_MODES: ColorVisionMode[] = [
  "normal",
  "protanopia",
  "deuteranopia",
  "tritanopia",
];

export const SUPPORTED_COLOR_VISION_MODES: readonly ColorVisionMode[] = [
  "normal",
  "protanopia",
  "deuteranopia",
  "tritanopia",
] as const;
