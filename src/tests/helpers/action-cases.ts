import { describe, expect, it } from "vitest";

/**
 * Canonical "auth + Zod + permission" 3-case suite for Server Actions.
 *
 * Every mutating Server Action in the fleet must defend three entry points,
 * in this order:
 *
 *   1. **auth** — reject unauthenticated callers.
 *   2. **Zod** — reject malformed input (covered by the separate schema
 *      test files per action; not duplicated here).
 *   3. **permission** — reject authenticated callers whose input, though
 *      *schematically* valid, targets a resource they do not own (the
 *      classic IDOR vector) or requires a role they lack.
 *
 * Schema tests alone catch invalid shapes but say nothing about auth or
 * permission, and the three failure modes historically diverge in error
 * shape ("UNAUTHORIZED" vs "FORBIDDEN" vs localized strings). Without a
 * shared harness each test file re-invents the assertion text and drifts;
 * this helper fixes the shape once.
 *
 * Per-app usage example:
 *
 *   describeStandardActionCases("deleteCommentAction", {
 *     unauth: async () => {
 *       mockAuth(null);
 *       return deleteCommentAction("comment-1");
 *     },
 *     wrongUser: async () => {
 *       mockAuth({ user: { id: "user-without-role" } });
 *       return deleteAsAdminAction("comment-1");
 *     },
 *     overreach: async () => {
 *       mockAuth({ user: { id: "user-a" } });
 *       // comment belongs to user-b
 *       return deleteCommentAction("comment-owned-by-user-b");
 *     },
 *   });
 *
 * Only `unauth` is required — `wrongUser` makes sense only for actions
 * behind an explicit role gate, and `overreach` makes sense only for
 * actions that accept a resource identifier as input. Omit either when
 * the action's threat model doesn't include that failure mode.
 */

/**
 * Generic result shape returned by a Server Action. We accept both the
 * structured form (`error: { code, message }`, as in next-app-post's
 * `ApiResult`) and the flat-string form (`error: "認証が必要です"`, as in
 * older apps' `ActionResult<T>`).
 */
export type ActionResultShape =
  | { success: true; data?: unknown }
  | {
      success: false;
      error: string | { code?: string; message?: string; [k: string]: unknown };
    };

export type StandardActionCases<T extends ActionResultShape> = {
  unauth: () => Promise<T>;
  wrongUser?: () => Promise<T>;
  overreach?: () => Promise<T>;
  /** Override the default auth-failure assertion (rarely needed). */
  expectAuth?: (result: T) => void;
  /** Override the default permission-failure assertion (rarely needed). */
  expectPermission?: (result: T) => void;
};

function errorString(result: ActionResultShape): string {
  if (result.success) return "";
  const err = result.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    return `${err.code ?? ""} ${err.message ?? ""}`.trim();
  }
  return String(err);
}

/**
 * Default auth-failure assertion. Matches the `UNAUTHORIZED` code (post /
 * newer apps) or common failure strings (認証 / auth / unauthorized).
 */
export function expectAuthFailure(result: ActionResultShape): void {
  expect(result.success).toBe(false);
  expect(errorString(result)).toMatch(/UNAUTHORIZED|認証|auth|unauthorized/i);
}

/**
 * Default permission-failure assertion. Matches `FORBIDDEN` code or the
 * Japanese / English phrasings used across the fleet.
 */
export function expectPermissionFailure(result: ActionResultShape): void {
  expect(result.success).toBe(false);
  expect(errorString(result)).toMatch(
    /FORBIDDEN|権限|forbidden|not.*(author|owner|allowed)|permission/i,
  );
}

/**
 * Register the canonical 3-case suite for a Server Action.
 *
 * Why this stays a thin wrapper rather than a full test generator:
 *   - Each app's auth mocking path (`@/lib/auth` vs `@/lib/server/auth`)
 *     differs, and DB seeding couples tightly to the action under test.
 *     Centralising those in the helper would paper over real differences.
 *   - What *is* worth centralising is the **shape of the assertions**:
 *     the same "success=false + error matches code or phrase" check runs
 *     in every file, and diverging on copy here is the real drift risk.
 */
export function describeStandardActionCases<T extends ActionResultShape>(
  actionName: string,
  cases: StandardActionCases<T>,
): void {
  describe(`${actionName} — auth + zod + permission`, () => {
    const assertAuth = cases.expectAuth ?? expectAuthFailure;
    const assertPermission = cases.expectPermission ?? expectPermissionFailure;

    it("rejects unauthenticated callers with an auth error", async () => {
      const result = await cases.unauth();
      assertAuth(result);
    });

    if (cases.wrongUser) {
      it("rejects authenticated callers who lack the required role/scope", async () => {
        const result = await cases.wrongUser!();
        assertPermission(result);
      });
    }

    if (cases.overreach) {
      it("rejects IDOR attempts — input targets another user's resource", async () => {
        const result = await cases.overreach!();
        assertPermission(result);
      });
    }
  });
}
