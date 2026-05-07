export const PLAN_FEATURES = {
  free: {
    name: "Free",
    nameJa: "フリー",
    price: 0,
    description: "基本機能を無料で利用",
    features: [
      "読書記録・管理",
      "クラブ・グループ参加（3件まで）",
      "レビュー投稿（公開のみ）",
      "ハイライト・引用（10件まで）",
    ],
  },
  basic: {
    name: "Basic",
    nameJa: "ベーシック",
    price: 500,
    description: "より多くの機能を活用",
    features: [
      "フリープランのすべて",
      "クラブ・グループ参加（無制限）",
      "レビュー下書き保存",
      "ハイライト・引用（50件まで）",
      "グループ作成",
    ],
  },
  premium: {
    name: "Premium",
    nameJa: "プレミアム",
    price: 1500,
    description: "すべての機能をフル活用",
    features: [
      "ベーシックプランのすべて",
      "レビュー予約投稿",
      "データエクスポート（JSON/Markdown）",
      "ハイライト・引用（無制限）",
      "限定バッジ",
      "優先サポート",
    ],
  },
} as const;

export type PlanType = keyof typeof PLAN_FEATURES;
