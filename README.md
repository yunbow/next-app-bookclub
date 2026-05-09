# BookClub

読書記録・レビュー・読書イベント・グループでの交流を 1 つにまとめた Web アプリケーションです。Next.js (App Router) + Prisma + PostgreSQL を中心に、認証・サブスクリプション・ゲーミフィケーション・通知・統計など読書まわりの機能を備えています。

## 主な機能

- 📚 **書籍管理** — 読みたい / 読書中 / 読了 のステータス管理、ISBN 登録、Google Books からの検索
- ✍️ **レビュー & リアクション** — 公開／非公開の切替、下書き・予約投稿、コメント、いいね等のリアクション
- 📅 **読書イベント** — オンライン / オフラインのイベント主催、定員管理、参加申請
- 🎯 **読書目標 & 進捗** — 年次／月次／ジャンル別目標、ページ単位の進捗、読書セッション
- ✨ **ハイライト** — 本からの引用を保存・共有
- 👥 **グループ** — 読書仲間とのグループ運営
- 💳 **サブスクリプション** — Free / Basic / Premium プランの管理（Stripe 決済）
- 🏆 **ゲーミフィケーション** — XP / レベル / バッジ / 連続記録（ストリーク）
- 🔔 **通知 & タイムライン** — 参加・コメント等の活動通知
- 🔐 **認証** — Email/Password、Google、GitHub（NextAuth.js v5）

## 技術スタック

| カテゴリ | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS 4 / Radix UI / shadcn/ui 形式コンポーネント |
| データベース | PostgreSQL + Prisma 6 |
| 認証 | NextAuth.js v5 |
| 決済 | Stripe |
| バリデーション | Zod 4 |
| フォーム | React Hook Form |
| データ取得 | TanStack Query |
| ユニット / 統合テスト | Vitest + Testing Library + msw |
| E2E テスト | Playwright |
| ロガー | Pino |

## クイックスタート

```bash
# 1. 依存をインストール
npm install

# 2. 環境変数を準備
cp .env.example .env
# NEXTAUTH_SECRET を生成して .env に設定
openssl rand -base64 48

# 3. Docker コンテナを起動（PostgreSQL / MinIO / stripe-mock）
docker compose up -d

# 4. DB を初期化
npm run db:migrate:dev

# 5. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

詳しいセットアップ手順、トラブルシューティングは [`docs/usages/local-setup.md`](./docs/usages/local-setup.md) を参照してください。

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm start` | ビルド済みアプリ起動 |
| `npm run lint` | ESLint 実行 |
| `npm run format` | Prettier 整形 |
| `npm run format:check` | Prettier チェックのみ |
| `npm run test` | Vitest（watch モード） |
| `npm run test:unit` | ユニットテストを 1 回実行 |
| `npm run test:integration` | 統合テストを 1 回実行 |
| `npm run test:run` | 全テストを 1 回実行 |
| `npm run test:coverage` | カバレッジ付きでテスト |
| `npm run test:e2e` | Playwright で E2E テスト |
| `npm run db:migrate:dev` | 開発用マイグレーション適用 |
| `npm run db:migrate:deploy` | 本番マイグレーション適用 |
| `npm run db:migrate:status` | マイグレーション状態確認 |
| `npm run db:seed:dev` | 開発用シードデータ投入 |
| `npm run db:seed:prod` | 本番用シードデータ投入 |
| `npm run upload:static` | 静的画像を R2 / MinIO へアップロード |
| `npm run analyze` | バンドル解析 |

## ディレクトリ構成

```
.
├── prisma/              # Prisma スキーマ・マイグレーション・シード
├── public/              # 静的アセット
├── scripts/             # 補助スクリプト
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # 認証画面
│   │   ├── (protected)/ # ログイン必須画面
│   │   ├── (public)/    # 公開画面
│   │   └── api/         # Route Handlers
│   ├── components/      # 共通 UI コンポーネント
│   ├── features/        # 機能別モジュール（schema / server / components）
│   ├── lib/             # 共通ライブラリ（auth / prisma / subscription など）
│   └── tests/           # Vitest 用テスト（unit / integration）
├── tests/
│   └── e2e/             # Playwright E2E テスト
├── docs/                # プロジェクトドキュメント
├── docker-compose.yml   # PostgreSQL + MinIO + stripe-mock
├── Dockerfile
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

## テスト

```bash
# Vitest（unit / integration）
npm run test:run

# Playwright（E2E）
npx playwright install   # 初回のみ
npm run test:e2e
```

Vitest は `src/tests/` および `tests/unit/` を対象とし、Playwright の E2E テスト（`tests/e2e/`）は除外しています。

## ドキュメント

- [ローカル環境構築手順](./docs/usages/local-setup.md)
- [完了報告](./docs/completion-report.md)
- [AI DEV OS ガイドライン](./docs/ai-dev-os/)

## ライセンス

[MIT License](./LICENSE) — Copyright (c) 2026 yunbow
