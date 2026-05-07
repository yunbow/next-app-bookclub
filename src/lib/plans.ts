export const PLAN_FEATURES = {
  free: {
    name: "Free",
    nameJa: "フリー",
    price: 0,
    description: "基本機能を無料で利用",
    features: ["読書記録", "クラブ参加（3件まで）", "レビュー投稿"],
  },
  basic: {
    name: "Basic",
    nameJa: "ベーシック",
    price: 500,
    description: "より多くの機能を利用可能",
    features: ["読書記録", "クラブ参加（無制限）", "レビュー投稿", "読書統計"],
  },
  premium: {
    name: "Premium",
    nameJa: "プレミアム",
    price: 1500,
    description: "すべての機能をフル活用",
    features: [
      "読書記録",
      "クラブ参加（無制限）",
      "レビュー投稿",
      "読書統計",
      "優先サポート",
      "限定バッジ",
    ],
  },
} as const;

export type PlanType = keyof typeof PLAN_FEATURES;
