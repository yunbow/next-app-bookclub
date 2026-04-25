"use client";

import { createCookieContext } from "@/lib/utils/create-cookie-context";
import { COOKIE_NAMES } from "@/lib/constants/cookies";
import {
  type ColorVisionMode,
  DEFAULT_COLOR_VISION_MODE,
  SUPPORTED_COLOR_VISION_MODES,
} from "./types";

// ColorVision Context を作成
const { Context, Provider, useValue: useColorVisionValue } = createCookieContext<ColorVisionMode>({
  cookieName: COOKIE_NAMES.COLOR_VISION,
  defaultValue: DEFAULT_COLOR_VISION_MODE,
  supportedValues: SUPPORTED_COLOR_VISION_MODES,
  validator: (value): value is ColorVisionMode =>
    SUPPORTED_COLOR_VISION_MODES.includes(value as ColorVisionMode),
  applyEffect: (mode) => {
    // モードをHTMLに適用
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-color-vision", mode);
    }
  },
});

export const ColorVisionContext = Context;
export const ColorVisionProvider = Provider;

// カスタムフックで期待されるプロパティ名にマッピング
export function useColorVision() {
  const { value: colorVisionMode, setValue: setColorVisionMode } = useColorVisionValue();
  return { colorVisionMode, setColorVisionMode };
}
