/**
 * Cookie Context ファクトリー
 * Cookie操作を伴うContextを簡単に作成するためのユーティリティ
 */

"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { setCookie, getTypedCookie } from "./cookie-manager";

export type CookieContextConfig<T> = {
  /** Cookie名 */
  cookieName: string;
  /** デフォルト値 */
  defaultValue: T;
  /** サポートされる値のリスト */
  supportedValues: readonly T[];
  /** 値のバリデーター */
  validator: (value: unknown) => value is T;
  /** 値が変更されたときの副作用（オプション） */
  applyEffect?: (value: T) => void;
  /** Cookie有効期限（日数、デフォルト: 365） */
  maxAgeDays?: number;
};

export type CookieContextValue<T> = {
  value: T;
  setValue: (value: T) => void;
};

/**
 * Cookie Context を作成
 */
export function createCookieContext<T extends string>(
  config: CookieContextConfig<T>
) {
  const {
    cookieName,
    defaultValue,
    supportedValues,
    validator,
    applyEffect,
    maxAgeDays = 365,
  } = config;

  // Context作成
  const Context = createContext<CookieContextValue<T> | undefined>(undefined);

  // useSyncExternalStore用のグローバル状態
  let currentValue: T = defaultValue;
  const listeners = new Set<() => void>();

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): T {
    return currentValue;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function setValueInternal(value: T) {
    if (supportedValues.includes(value)) {
      currentValue = value;
      setCookie(cookieName, value, { maxAgeDays });
      applyEffect?.(value);
      listeners.forEach((listener) => listener());
    }
  }

  // Provider コンポーネント
  function Provider({ children }: { children: ReactNode }) {
    const syncedValue = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

    // 初期化: Cookieから値を読み込み
    useEffect(() => {
      const savedValue = getTypedCookie(cookieName, validator, defaultValue);
      if (savedValue !== currentValue) {
        setValueInternal(savedValue);
      }
      // 初回のみ副作用を適用
      applyEffect?.(savedValue);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setValue = useCallback((value: T) => {
      setValueInternal(value);
    }, []);

    // Context値をメモ化して不要な再レンダリングを防止
    const contextValue = useMemo(
      () => ({ value: syncedValue, setValue }),
      [syncedValue, setValue]
    );

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  }

  // カスタムフック
  function useValue(): CookieContextValue<T> {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(
        `use${cookieName} must be used within a ${cookieName} Provider`
      );
    }
    return context;
  }

  return {
    Context,
    Provider,
    useValue,
  };
}
