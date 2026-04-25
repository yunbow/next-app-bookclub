import { test, expect } from "@playwright/test";

test.describe("Event Creation", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto("/login");
    // TODO: ログイン処理を実装
  });

  test("should create a new event", async ({ page }) => {
    await page.goto("/clubs/new");

    // フォーム入力
    await page.fill('input[id="title"]', "Monthly Book Club");
    await page.fill('textarea[id="description"]', "Let's discuss our favorite books");
    await page.fill('input[id="eventDate"]', "2024-12-31T19:00");
    await page.fill('input[id="location"]', "Tokyo Community Center");
    await page.fill('input[id="maxParticipants"]', "20");

    // 送信
    await page.click('button[type="submit"]');

    // リダイレクト確認
    await expect(page).toHaveURL(/\/clubs\/[a-zA-Z0-9-]+/);

    // 成功メッセージ確認
    await expect(page.locator("text=イベントを作成しました")).toBeVisible();
  });

  test("should participate in event", async ({ page }) => {
    // イベント一覧ページに移動
    await page.goto("/clubs");
    await page.locator("a").first().click();

    // 参加ボタンをクリック
    await page.click("button:has-text('参加する')");

    // 成功メッセージ確認
    await expect(page.locator("text=参加登録しました")).toBeVisible();

    // 参加予定バッジが表示されることを確認
    await expect(page.locator("text=参加予定")).toBeVisible();
  });

  test("should cancel participation", async ({ page }) => {
    await page.goto("/clubs");
    await page.locator("a").first().click();

    // 参加
    await page.click("button:has-text('参加する')");
    await expect(page.locator("text=参加予定")).toBeVisible();

    // キャンセル
    await page.click("button:has-text('参加をキャンセル')");

    // 成功メッセージ確認
    await expect(page.locator("text=参加をキャンセルしました")).toBeVisible();
  });

  test("should show validation errors", async ({ page }) => {
    await page.goto("/clubs/new");

    // タイトルなしで送信
    await page.click('button[type="submit"]');

    // エラーメッセージ確認
    await expect(page.locator("text=タイトルは必須です")).toBeVisible();
  });
});
