# next-app-bookclub — 完了レポート

このドキュメントはリリース可否の判断材料として、テストカバレッジと canonical guard
の結果をまとめる。数値はリポジトリ共通スクリプト `scripts/update-coverage-report.mjs`
で再計測する。手動編集で上書きしてよいのは「備考」セクションのみ。

## テストカバレッジ

最終計測日: NOT_YET_MEASURED

| 指標 | カバレッジ | 備考 |
|---|---|---|
| Line | NOT_YET_MEASURED | vitest --coverage の `lines.pct` |
| Branch | NOT_YET_MEASURED | vitest --coverage の `branches.pct` |
| Function | NOT_YET_MEASURED | vitest --coverage の `functions.pct` |

**再計測コマンド**: プロジェクトルートで
```
node scripts/update-coverage-report.mjs next-app-bookclub
```
を実行する。上のテーブルと最終計測日が自動更新される。初回は
`npm install --save-dev @vitest/coverage-v8` で coverage プロバイダを入れること
（未インストール時は NOT_YET_MEASURED のまま据え置き、guard は shape のみ検証する）。

## Canonical guard の通過状況

このアプリが配線されている guard は CI (`canonical-guards.yml`) で自動検証される。
全アプリ共通の guard は README を参照。アプリ固有の逸脱は次の「備考」に記す。

## 備考

（該当なし）
