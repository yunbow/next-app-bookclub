import { test, expect } from "@playwright/test";

test.describe("Book Creation", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理（実際の認証フローに合わせて調整）
    await page.goto("/login");
    // TODO: ログイン処理を実装
  });

  test("should create a new book", async ({ page }) => {
    await page.goto("/books/new");

    // フォーム入力
    await page.fill('input[id="title"]', "Test Book");
    await page.fill('input[id="author"]', "Test Author");
    await page.fill('input[id="publisher"]', "Test Publisher");
    await page.fill('input[id="publishedYear"]', "2024");
    await page.fill('textarea[id="description"]', "Test description");

    // 送信
    await page.click('button[type="submit"]');

    // リダイレクト確認
    await expect(page).toHaveURL(/\/books\/[a-zA-Z0-9-]+/);

    // 成功メッセージ確認
    await expect(page.locator("text=書籍を登録しました")).toBeVisible();
  });

  test("should show validation errors", async ({ page }) => {
    await page.goto("/books/new");

    // タイトルなしで送信
    await page.click('button[type="submit"]');

    // エラーメッセージ確認
    await expect(page.locator("text=タイトルは必須です")).toBeVisible();
  });

  test("should update reading status", async ({ page }) => {
    // 既存の書籍ページに移動
    await page.goto("/books");
    await page.click("a:has-text('Test Book')").first();

    // ステータス変更
    await page.click("button:has-text('ステータスを設定')");
    await page.click("text=読書中");

    // 成功メッセージ確認
    await expect(page.locator("text=読書ステータスを更新しました")).toBeVisible();
  });
});
