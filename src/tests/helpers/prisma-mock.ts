import { vi } from "vitest";

const METHODS = [
  "findUnique",
  "findFirst",
  "findMany",
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
] as const;

type Model = Record<(typeof METHODS)[number], ReturnType<typeof vi.fn>>;

export function createPrismaMock<TModels extends string>(
  modelNames: readonly TModels[],
): Record<TModels, Model> & {
  $transaction: ReturnType<typeof vi.fn>;
  $queryRaw: ReturnType<typeof vi.fn>;
  $executeRaw: ReturnType<typeof vi.fn>;
} {
  const result = Object.fromEntries(
    modelNames.map((name) => [
      name,
      Object.fromEntries(METHODS.map((m) => [m, vi.fn()])),
    ]),
  ) as Record<TModels, Model>;
  return {
    ...result,
    $transaction: vi.fn(async (cb) =>
      typeof cb === "function" ? cb(result) : Promise.all(cb),
    ),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };
}
