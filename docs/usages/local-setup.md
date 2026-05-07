# ローカル環境構築手順

## 前提

| 項目 | バージョン / 推奨 |
| --- | --- |
| Node.js | 20.x 以上（動作確認: v22.14.0） |
| npm | 10.x 以上（動作確認: 10.9.2） |
| Docker Desktop | 最新推奨（`docker version` が通る状態） |
| Git | 任意の最近のバージョン |

## セットアップ手順

### 1. リポジトリの取得

```bash
git clone <repository-url>
cd next-app-bookclub
```

### 2. 依存パッケージのインストール

```bash
npm install
```

`postinstall` フックで `prisma generate`（Prisma Client の生成）が自動実行されます。

### 3. 環境変数の設定

```bash
cp .env.example .env
```

最低限必要な変数は以下のとおりです。

| 変数 | 用途 | ローカル例 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgresql://app:app@localhost:54322/app?schema=public` |
| `NEXTAUTH_SECRET` | セッション暗号化キー（32 文字以上） | `openssl rand -base64 48` で生成 |
| `NEXTAUTH_URL` | NextAuth コールバック URL | `http://localhost:3000` |

```bash
# NEXTAUTH_SECRET の生成例
openssl rand -base64 48
```

その他のオプション変数は `.env.example` のコメントを参照してください。

### 4. Docker コンテナの起動

PostgreSQL（DB）・MinIO（画像ストレージ）・stripe-mock（Stripe API モック）をまとめて起動します。

```bash
docker compose up -d
```

起動確認：

```bash
docker compose ps
```

`STATUS` 列が `Up (healthy)` になれば OK です。初回はイメージ pull に 1〜2 分かかります。

### 5. データベースのセットアップ

```bash
npm run db:migrate:dev
```

テーブルが作成され、すべてのマイグレーションが適用されます。

### 6. テストデータの投入（任意）

```bash
npm run db:seed:dev
```

ユーザー / 書籍 / レビュー / コメントが投入されます。シードは冪等なので何度実行しても重複しません。

投入後は以下のアカウントでログインできます。

| Email | Password |
| --- | --- |
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

### 7. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスして表示されれば完了です。

---

## 画像ストレージ（MinIO）

`docker compose up -d` で MinIO が起動し、バケット `bookclub` が自動作成されます。`.env.example` のデフォルト値がそのまま使えます。

| 項目 | 値 |
| --- | --- |
| S3 API エンドポイント | `http://localhost:9000` |
| Web コンソール | `http://localhost:9001` |
| ユーザー / パスワード | `minioadmin` / `minioadmin` |
| バケット名 | `bookclub` |

本番では Cloudflare R2 を使用します。`.env.example` の R2 セクションのコメントを外して設定してください。

---

## Stripe 決済（stripe-mock）

`docker compose up -d` で [stripe/stripe-mock](https://github.com/stripe/stripe-mock) が起動し、Stripe API をローカルでモックします。

| 項目 | 値 |
| --- | --- |
| HTTP エンドポイント | `http://localhost:12111` |
| 認証 | 任意の `sk_test_*` キー（モックは検証しない） |

`.env.example` に記載のモック値 (`sk_test_mock_bookclub_local` 等) をそのまま `.env` にコピーすれば、**実際の Stripe アカウントなしで** 決済フローの開発が可能です。

### Webhook のローカルテスト

Webhook イベントのテストには [Stripe CLI](https://stripe.com/docs/stripe-cli) を使用します。

```bash
# Stripe CLI をインストール (初回のみ)
# macOS: brew install stripe/stripe-cli/stripe
# Windows: https://github.com/stripe/stripe-cli/releases

# stripe-mock に対して listen し、ローカルアプリに転送
stripe listen \
  --api-base http://localhost:12111 \
  --forward-to http://localhost:3000/api/stripe/webhook
```

`stripe listen` を起動すると表示される `whsec_...` を `.env` の `STRIPE_WEBHOOK_SECRET` に設定してください。

```bash
# イベントを手動で発火してテスト
stripe trigger checkout.session.completed \
  --api-base http://localhost:12111
```

### 本番 / Stripe テストモードへの切り替え

`.env` を以下のように変更します。

```bash
# STRIPE_MOCK_HOST と STRIPE_MOCK_PORT をコメントアウト（または削除）
# STRIPE_MOCK_HOST=localhost
# STRIPE_MOCK_PORT=12111

# 本物の Stripe キーを設定
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_BASIC_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxxxxx
```

---

## よく使うコマンド

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

E2E テストを初めて実行する前にブラウザバイナリを取得します。

```bash
npx playwright install
```

---

## Prisma 操作

| 操作 | コマンド |
| --- | --- |
| マイグレーションを新規作成 | `npx prisma migrate dev --name <name>` |
| マイグレーション状態の確認 | `npm run db:migrate:status` |
| Prisma Client を再生成 | `npx prisma generate` |
| DB をリセット（破壊的） | `npx prisma migrate reset` |
| GUI で DB を確認 | `npx prisma studio` |
| psql に直接接続 | `docker compose exec db psql -U app -d app` |

---

## Docker コンテナのライフサイクル

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止（データ保持） | `docker compose stop` | 次回 `start` で即復帰 |
| 再開 | `docker compose start` | |
| コンテナ削除（ボリューム保持） | `docker compose down` | |
| **完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f db` | |

DB が壊れた場合のリセット手順：

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

---

## トラブルシューティング

### `npm install` 後に `prisma generate` が失敗する

`node_modules/.prisma` が壊れている可能性があります。

```bash
rm -rf node_modules package-lock.json
npm install
```

### `P1001: Can't reach database server`

コンテナがまだ `healthy` になっていないか、`.env` の `DATABASE_URL` のポートが `docker-compose.yml` と一致していない可能性があります。`docker compose ps` でステータスを確認してください。

### `port is already allocated`

同じポートを使う別のサービスが動いています。

```bash
# 使用中のプロセスを確認（macOS / Linux）
lsof -i :54322
lsof -i :9000
```

### ポート 3000 が使われている

```bash
PORT=3001 npm run dev
```

### Vitest が Playwright のテストを拾ってしまう

`vitest.config.ts` の `exclude` に `tests/e2e/**` が含まれているか確認してください。

---

## ディレクトリ構成（抜粋）

```
.
├── prisma/              # Prisma スキーマ・マイグレーション・シード
├── public/              # 静的アセット
├── scripts/             # 補助スクリプト
├── src/
│   ├── app/             # Next.js App Router
│   ├── features/        # 機能別モジュール（schema / server / components）
│   ├── lib/             # 共通ライブラリ（auth / prisma / storage など）
│   └── tests/           # Vitest 用テスト（unit / integration）
├── tests/
│   └── e2e/             # Playwright e2e テスト
├── docs/                # プロジェクトドキュメント
├── docker-compose.yml   # PostgreSQL + MinIO + stripe-mock
├── .env.example         # 環境変数サンプル
└── package.json
```
