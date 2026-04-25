# BookClub - 読書管理アプリ

本の管理、読書記録、レビュー共有、読書会まで。あなたの読書ライフをサポートするアプリケーションです。

## 主な機能

- 📚 本の管理（ISBN検索、Google Books API連携）
- 📖 読書記録（ステータス管理、読書日数記録）
- ✍️ レビュー機能（Markdown対応、コメント、リアクション）
- 📅 読書会管理（イベント作成、参加管理）
- 📊 読書統計（月間・年間の読書量グラフ）
- 👥 ソーシャル機能（フォロー、タイムライン）
- 🔔 通知機能
- 🌙 ダークモード対応

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **認証**: NextAuth.js v5
- **データベース**: Prisma + SQLite (開発環境)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI
- **フォーム**: React Hook Form + Zod
- **状態管理**: TanStack Query

## セットアップ

### 1. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 2. 環境変数の設定

\`.env.example\`を\`.env\`にコピーして、必要な値を設定してください。

\`\`\`bash
cp .env.example .env
\`\`\`

### 3. データベースのセットアップ

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## スクリプト

- \`npm run dev\` - 開発サーバーを起動
- \`npm run build\` - 本番用ビルド
- \`npm run start\` - 本番サーバーを起動
- \`npm run lint\` - ESLintでコードをチェック
- \`npm run format\` - Prettierでコードをフォーマット
- \`npm run test\` - テストを実行

## プロジェクト構造

\`\`\`
src/
├── app/              # Next.js App Router
├── components/       # 共通コンポーネント
├── features/         # 機能別コンポーネント
├── lib/              # ユーティリティ、設定
└── types/            # 型定義
\`\`\`

## ライセンス

MIT
