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

## 5. テストデータ（シード）の投入

ローカルですぐに動作確認できるよう、ユーザー / 書籍 / レビュー / コメントを投入するシードを用意しています。

### 5.1 シードの起動方法

| コマンド | 内容 |
| --- | --- |
| `npm run db:seed` | 引数なし。`NODE_ENV=development` なら dev、それ以外（未設定 / `production`）なら prod として実行（フェイルセーフ） |
| `npm run db:seed:dev` | 明示的に dev モード（ユーザー・書籍・レビュー等を投入） |
| `npm run db:seed:prod` | 明示的に prod モード（マスタのみ投入） |
| `npx prisma db seed` | Prisma 標準連携。`package.json` の `prisma.seed` 経由で同じスクリプトを実行 |

> 安全装置: `NODE_ENV=production` で `--mode=dev` または `SEED_MODE=dev` を指定した場合は起動時にエラーで停止します。

### 5.2 シード構成

| ファイル | 役割 |
| --- | --- |
| `prisma/seed.ts` | エントリーポイント。`--mode=` 引数 → `SEED_MODE` 環境変数 → `NODE_ENV` の優先順でモードを解決 |
| `prisma/seeds/common.ts` | 両モード共通のマスタ（ジャンル等） |
| `prisma/seeds/prod.ts` | 本番用（マスタのみ） |
| `prisma/seeds/dev.ts` | 開発用（ユーザー 2 名 / 書籍 / レビュー / コメント / UserBook） |

シードはすべて upsert または「存在チェック → 作成」で書かれているため、何度実行しても冪等です。

### 5.3 開発用ログイン情報

`db:seed:dev` 実行後、以下のアカウントでログインできます。

| Email | Password |
| --- | --- |
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

それぞれが書籍 1 冊ずつをレビュー投稿し、相互にコメント / `UserBook`（読書ステータス）も登録済みです。ログイン直後にダッシュボードや書評一覧で動作確認できます。

## 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて表示されれば成功です。

## 7. 動作確認用のコマンド

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

## 8. よく使う Prisma 操作

| 操作 | コマンド |
| --- | --- |
| マイグレーションを新規作成 | `npx prisma migrate dev --name <name>` |
| Prisma Client を再生成 | `npx prisma generate` |
| DB をリセット（破壊的） | `npx prisma migrate reset` |
| GUI で DB を確認 | `npx prisma studio` |

## 9. トラブルシューティング

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

## 10. ディレクトリ構成（抜粋）

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

---

## PostgreSQL 構築・運用手順

このプロジェクトは独立した PostgreSQL コンテナを `docker-compose.yml` で持つ設計です。本プロジェクトの DB は **ホスト側ポート `54322`** で公開されます (他の `next-app-*` プロジェクトとは衝突しないよう個別に割り当て済み)。

### 前提

- **Docker Desktop** が起動していること (`docker version` が通る)
- `.env` に `DATABASE_URL` が入っていること
- `npm install` 完了

### 1. PostgreSQL コンテナを起動

プロジェクトのルートで:

```powershell
docker compose up -d
```

- `-d` でバックグラウンド起動
- 初回はイメージ pull で 1〜2 分かかる
- 2 回目以降は数秒で立ち上がる

起動確認:

```powershell
docker compose ps
```

`STATUS` 列が `Up (healthy)` になっていれば OK (compose の healthcheck で `pg_isready` を見ている)。`(starting)` の間は接続失敗するので、healthy になるまで数秒待つ。

### 2. マイグレーション適用

スキーマを DB に反映 (初回 = テーブル作成、2 回目以降 = 差分適用):

```powershell
npm run db:migrate:dev
```

新しい migration を生成したいときは `--name` を渡す:

```powershell
npm run db:migrate:dev -- --name <name>
```

CI / 本番系では対話処理を伴わない deploy 系を使う:

```powershell
npm run db:migrate:deploy
```

### 3. SEED 投入 (任意)

開発用テストデータを投入:

```powershell
npm run db:seed:dev
```

冪等なので何度実行しても重複しません。

### 4. アプリ起動

```powershell
npm run dev
```

`http://localhost:3000` にアクセスして動作確認。

### 5. データ確認・操作

GUI で中身を見たい場合:

```powershell
npm run prisma:studio
```

`http://localhost:5555` で Prisma Studio が開きます。

CLI で直接 psql に入りたい場合:

```powershell
docker compose exec db psql -U app -d app
```

### ライフサイクル運用

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止 (データ保持) | `docker compose stop` | 次回 `start` で即復帰 |
| 再開 | `docker compose start` | |
| 完全停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **DB を完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f db` | エラー調査時 |

ハマったときの定番リセット手順:

```powershell
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

### 複数プロジェクトを同時に起動する場合

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも 54321〜54342 で固有割当なので衝突しません。

すべて起動するとメモリ消費が積み上がるので、使わないものは `docker compose stop` しておくのが無難です。

全プロジェクトの DB を一覧:

```powershell
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

### トラブルシューティング

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| `port is already allocated` | 該当ポートが他のサービスで使用中 | `docker compose down`、または `netstat -ano \| Select-String "54322"` で犯人を特定 |
| `P1001: Can't reach database server` | コンテナがまだ healthy でない、もしくは `.env` の `DATABASE_URL` のポートと `docker-compose.yml` の publish ポートが不一致 | healthcheck 完了を待つ / `.env` を確認 |
| マイグレーションが破綻 | dev 環境で発生する典型 | `docker compose down -v` で DB をリセットしてから `npm run db:migrate:dev` |
