import { expect, vi, type Mock } from "vitest";
import type { Session } from "next-auth";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message?: string; fieldErrors?: Record<string, string[]> } };

export function expectSuccess<T>(
  result: ActionResult<T>,
): asserts result is { success: true; data: T } {
  expect(result.success).toBe(true);
  if (!result.success)
    throw new Error(`Expected success, got ${JSON.stringify(result)}`);
}

export function expectFailure(result: ActionResult<unknown>, code: string) {
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Expected failure");
  expect(result.error.code).toBe(code);
}

export function mockSession(overrides?: Partial<Session["user"]>): Session {
  return {
    user: {
      id: "user-test-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      ...overrides,
    },
    expires: new Date(Date.now() + 86_400_000).toISOString(),
  };
}

export function mockAuth(authMock: Mock, session: Session | null = mockSession()) {
  authMock.mockResolvedValue(session);
}
