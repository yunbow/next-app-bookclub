# ローカル環境構築手順

本プロジェクト（BookClub / Next.js + Prisma + SQLite）をローカルで動かすための手順をまとめます。

## 前提

| 項目 | バージョン / 推奨 |
| --- | --- |
| Node.js | 20.x 以上（動作確認: v22.14.0） |
| npm | 10.x 以上（動作確認: 10.9.2） |
| OS | Windows / macOS / Linux |
| Git | 任意の最近のバージョン |

> SQLite を使用するため、別途 DB サーバーのセットアップは不要です。

## 1. リポジトリの取得

```bash
git clone <repository-url>
cd next-app-bookclub
```

## 2. 依存パッケージのインストール

```bash
npm install
```

`postinstall` フックで以下が自動実行されます。

- `node scripts/fix-date-fns-types.js`
- `prisma generate`（Prisma Client の生成）

## 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
# Windows (bash)
cp .env.example .env
```

最低限、ローカルで動かすために必要な値は以下のとおりです。

| 変数 | 用途 | ローカル例 |
| --- | --- | --- |
| `DATABASE_URL` | Prisma が参照する DB URL | `file:./dev.db` |
| `NEXTAUTH_SECRET` | NextAuth のセッション暗号化キー | 任意のランダム文字列 |
| `NEXTAUTH_URL` | NextAuth のコールバック URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | アプリの公開 URL | `http://localhost:3000` |

`NEXTAUTH_SECRET` は次のコマンドで生成できます。

```bash
openssl rand -base64 32
```

### 任意の環境変数

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth ログインを使う場合
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth ログインを使う場合
- `SMTP_*` — メール送信機能を使う場合（パスワードリセット等）
- `GOOGLE_BOOKS_API_KEY` — Google Books API のレート制限を緩和したい場合
- `CRON_SECRET` — スケジュール処理 API を保護するキー

## 4. データベースのセットアップ

開発用 SQLite DB を作成し、マイグレーションを適用します。

```bash
npm run db:migrate:dev
```

実行すると `prisma/dev.db` が作成され、すべてのマイグレーションが適用されます。

状態を確認したい場合は次のコマンドを使います。

```bash
npm run db:migrate:status
```

> Prisma Studio で DB の中身を確認したい場合は `npx prisma studio`。

## 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて表示されれば成功です。

## 6. 動作確認用のコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run lint` | ESLint を実行 |
| `npm run format` | Prettier で整形 |
| `npm run format:check` | Prettier の差分チェックのみ |
| `npm run test` | Vitest（watch モード） |
| `npm run test:run` | Vitest を 1 回だけ実行 |
| `npm run test:coverage` | カバレッジ付きでテスト実行 |
| `npm run test:e2e` | Playwright で e2e テスト |
| `npm run build` | プロダクションビルド |
| `npm start` | ビルド済みアプリの起動 |

### Playwright の初回セットアップ

E2E テストを実行する前にブラウザバイナリを取得します。

```bash
npx playwright install
```

E2E テストは `npm run dev` で起動するサーバーを使用します（`playwright.config.ts` の `webServer` 設定により自動起動）。

## 7. よく使う Prisma 操作

| 操作 | コマンド |
| --- | --- |
| マイグレーションを新規作成 | `npx prisma migrate dev --name <name>` |
| Prisma Client を再生成 | `npx prisma generate` |
| DB をリセット（破壊的） | `npx prisma migrate reset` |
| GUI で DB を確認 | `npx prisma studio` |

## 8. トラブルシューティング

### `prisma generate` が失敗する

`node_modules/.prisma` が壊れている可能性があります。次を試してください。

```bash
rm -rf node_modules package-lock.json
npm install
```

### `DATABASE_URL` 関連のエラー

`.env` が読み込めていないか、パスが不正な可能性があります。`DATABASE_URL="file:./dev.db"` のようにプロジェクトルート相対の指定になっているか確認してください。

### Vitest が Playwright のテストを拾ってしまう

`vitest.config.ts` の `exclude` に `tests/e2e/**` が含まれているか確認してください。Vitest は `tests/` 直下のテストを実行し、Playwright のテストは Playwright 側で実行する構成です。

### ポート 3000 が既に使われている

```bash
# 別ポートで起動
PORT=3001 npm run dev
```

## 9. ディレクトリ構成（抜粋）

```
.
├── prisma/              # Prisma スキーマとマイグレーション、dev.db
├── public/              # 静的アセット
├── scripts/             # 補助スクリプト
├── src/
│   ├── app/             # Next.js App Router
│   ├── features/        # 機能別モジュール（schema/server/components 等）
│   ├── lib/             # 共通ライブラリ（auth, prisma, actions など）
│   └── tests/           # Vitest 用テスト（unit / integration）
├── tests/
│   └── e2e/             # Playwright e2e テスト
├── docs/                # プロジェクトドキュメント
├── .env.example         # 環境変数サンプル
└── package.json
```
