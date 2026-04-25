import { test, expect } from "@playwright/test";

test.describe("Review Creation", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto("/login");
    // TODO: ログイン処理を実装
  });

  test("should create a new review", async ({ page }) => {
    // 書籍詳細ページに移動
    await page.goto("/books");
    await page.click("a:has-text('Test Book')").first();

    // レビューを書くボタンをクリック
    await page.click("button:has-text('レビューを書く')");

    // フォーム入力
    await page.click("button:has-text('⭐')").nth(4); // 5つ星
    await page.fill('textarea[id="content"]', "This is a great book!");

    // 送信
    await page.click('button[type="submit"]');

    // リダイレクト確認
    await expect(page).toHaveURL(/\/reviews\/[a-zA-Z0-9-]+/);

    // 成功メッセージ確認
    await expect(page.locator("text=レビューを投稿しました")).toBeVisible();
  });

  test("should add reaction to review", async ({ page }) => {
    // レビュー詳細ページに移動
    await page.goto("/reviews");
    await page.click("a").first();

    // いいねボタンをクリック
    await page.click("button:has-text('👍')");

    // カウントが増えることを確認
    await expect(page.locator("button:has-text('👍')")).toContainText("1");
  });

  test("should show validation errors", async ({ page }) => {
    await page.goto("/books");
    await page.click("a:has-text('Test Book')").first();
    await page.click("button:has-text('レビューを書く')");

    // 内容なしで送信
    await page.click('button[type="submit"]');

    // エラーメッセージ確認
    await expect(page.locator("text=レビュー内容は必須です")).toBeVisible();
  });
});
