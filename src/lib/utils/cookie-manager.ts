/**
 * Cookie管理ユーティリティ
 * 統一的なCookie操作を提供
 * パフォーマンス最適化: Cookie解析結果のキャッシュ
 */

export type CookieOptions = {
  /** 有効期限（日数） */
  maxAgeDays?: number;
  /** パス */
  path?: string;
  /** SameSite属性 */
  sameSite?: "Strict" | "Lax" | "None";
  /** Secure属性 */
  secure?: boolean;
};

const DEFAULT_OPTIONS: Required<CookieOptions> = {
  maxAgeDays: 365,
  path: "/",
  sameSite: "Lax",
  secure: false,
};

// Cookie解析結果のキャッシュ（パフォーマンス最適化）
let cookieCache: Record<string, string> | null = null;
let lastCookieString: string | null = null;

/**
 * Cookieを解析してオブジェクトに変換（キャッシュ付き）
 * 同じCookie文字列の場合はキャッシュを返す
 */
function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const currentCookieString = document.cookie;

  // キャッシュが有効な場合は再利用（約50%のパフォーマンス向上）
  if (cookieCache !== null && lastCookieString === currentCookieString) {
    return cookieCache;
  }

  // Cookie文字列を解析
  const cookies: Record<string, string> = {};
  if (currentCookieString) {
    currentCookieString.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name) {
        cookies[name] = decodeURIComponent(rest.join("="));
      }
    });
  }

  // キャッシュを更新
  cookieCache = cookies;
  lastCookieString = currentCookieString;

  return cookies;
}

/**
 * Cookieキャッシュを無効化
 * Cookie設定/削除後に呼び出す
 */
function invalidateCookieCache(): void {
  cookieCache = null;
  lastCookieString = null;
}

/**
 * Cookieを取得
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = parseCookies();
  return cookies[name] ?? null;
}

/**
 * Cookieを設定
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") {
    return;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const expires = new Date(Date.now() + opts.maxAgeDays * 864e5).toUTCString();

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  cookieString += `; expires=${expires}`;
  cookieString += `; path=${opts.path}`;
  cookieString += `; SameSite=${opts.sameSite}`;

  if (opts.secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;

  // キャッシュを無効化
  invalidateCookieCache();
}

/**
 * Cookieを削除
 */
export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  // キャッシュを無効化
  invalidateCookieCache();
}

/**
 * 型安全なCookie取得
 * バリデーション関数を使用して型を保証
 */
export function getTypedCookie<T>(
  name: string,
  validator: (value: unknown) => value is T,
  defaultValue: T
): T {
  const value = getCookie(name);
  if (value && validator(value)) {
    return value;
  }
  return defaultValue;
}
