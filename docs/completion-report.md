# next-app-bookclub — 完了レポート

このドキュメントはリリース可否の判断材料として、テストカバレッジと canonical guard
の結果をまとめる。数値はリポジトリ共通スクリプト `scripts/update-coverage-report.mjs`
で再計測する。手動編集で上書きしてよいのは「備考」セクションのみ。

## テストカバレッジ

最終計測日: 2026-05-09

| 指標 | カバレッジ | 備考 |
|---|---|---|
| Line | 62.94% | vitest --coverage の `lines.pct` |
| Branch | 42.77% | vitest --coverage の `branches.pct` |
| Function | 65.38% | vitest --coverage の `functions.pct` |

**再計測コマンド**: プロジェクトルートで
```
node scripts/update-coverage-report.mjs next-app-bookclub
```
を実行する。上のテーブルと最終計測日が自動更新される。初回は
`npm install --save-dev @vitest/coverage-v8` で coverage プロバイダを入れること
（未インストール時は NOT_YET_MEASURED のまま据え置き、guard は shape のみ検証する）。

### ファイル別内訳（2026-05-09 時点）

| ファイル | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| features/book/server/book-actions.ts | 90.62% | 66.66% | 100% | 96.55% |
| features/event/schema/event-schema.ts | 100% | 50% | 100% | 100% |
| features/event/server/event-actions.ts | 44.30% | 38.88% | 50% | 47.94% |
| features/reading-goal/schema/goal-schema.ts | 100% | 75% | 100% | 100% |
| features/review/server/review-actions.ts | 53.01% | 36.36% | 60% | 53.84% |
| lib/logger.ts | 28.57% | 40% | 16.66% | 28.57% |
| lib/subscription.ts | 71.42% | 25% | 50% | 71.42% |
| lib/action-helpers.ts | 39.28% | 37.5% | 50% | 39.28% |
| lib/env.ts | 84.61% | 53.84% | 100% | 84.61% |

テストスイート: 7 ファイル / 61 テスト全パス

## Canonical guard の通過状況

このアプリが配線されている guard は CI (`canonical-guards.yml`) で自動検証される。
全アプリ共通の guard は README を参照。アプリ固有の逸脱は次の「備考」に記す。

## 備考

（該当なし）
