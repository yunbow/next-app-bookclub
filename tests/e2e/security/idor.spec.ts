import { test, expect } from "@playwright/test";

test.describe("IDOR Protection", () => {
  test("should prevent unauthorized book deletion", async ({ page }) => {
    // User A でログイン
    await page.goto("/login");
    // TODO: User A のログイン処理

    // User B の書籍IDを直接指定して削除を試みる
    const response = await page.request.post("/api/books/user-b-book-id/delete");

    // 403 Forbidden が返されることを確認
    expect(response.status()).toBe(403);
  });

  test("should prevent unauthorized review editing", async ({ page }) => {
    // User A でログイン
    await page.goto("/login");
    // TODO: User A のログイン処理

    // User B のレビューIDを直接指定して編集を試みる
    const response = await page.request.put("/api/reviews/user-b-review-id", {
      data: {
        content: "Hacked content",
        rating: 1,
      },
    });

    // 403 Forbidden が返されることを確認
    expect(response.status()).toBe(403);
  });

  test("should prevent unauthorized event deletion", async ({ page }) => {
    // User A でログイン
    await page.goto("/login");
    // TODO: User A のログイン処理

    // User B のイベントIDを直接指定して削除を試みる
    const response = await page.request.delete("/api/events/user-b-event-id");

    // 403 Forbidden が返されることを確認
    expect(response.status()).toBe(403);
  });

  test("should allow access to own resources", async ({ page }) => {
    // User A でログイン
    await page.goto("/login");
    // TODO: User A のログイン処理

    // 自分の書籍を削除
    const response = await page.request.post("/api/books/user-a-book-id/delete");

    // 200 OK が返されることを確認
    expect(response.status()).toBe(200);
  });

  test("should prevent viewing private reviews", async ({ page }) => {
    // User A でログイン
    await page.goto("/login");
    // TODO: User A のログイン処理

    // User B の非公開レビューにアクセスを試みる
    await page.goto("/reviews/user-b-private-review-id");

    // 404 Not Found ページが表示されることを確認
    await expect(page.locator("text=Not Found")).toBeVisible();
  });
});
