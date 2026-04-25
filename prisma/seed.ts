import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedDev } from "./seeds/dev";
import { seedProd } from "./seeds/prod";

type SeedMode = "dev" | "prod";

function parseModeArg(argv: string[]): SeedMode | undefined {
  for (const arg of argv) {
    if (arg.startsWith("--mode=")) {
      const value = arg.slice("--mode=".length);
      if (value === "dev" || value === "prod") return value;
      throw new Error(
        `Invalid --mode value: "${value}". Expected "dev" or "prod".`
      );
    }
  }
  return undefined;
}

function resolveMode(): SeedMode {
  const fromArg = parseModeArg(process.argv.slice(2));
  if (fromArg) return fromArg;

  const fromEnv = process.env.SEED_MODE;
  if (fromEnv) {
    if (fromEnv === "dev" || fromEnv === "prod") return fromEnv;
    throw new Error(
      `Invalid SEED_MODE: "${fromEnv}". Expected "dev" or "prod".`
    );
  }

  // Failsafe: implicit invocation (e.g. `prisma migrate deploy`) defaults to prod.
  // Explicit dev mode requires --mode=dev or SEED_MODE=dev.
  return process.env.NODE_ENV === "development" ? "dev" : "prod";
}

async function main(): Promise<void> {
  const mode = resolveMode();

  if (process.env.NODE_ENV === "production" && mode === "dev") {
    throw new Error(
      "Refusing to run dev seed when NODE_ENV=production. " +
        "Unset NODE_ENV or use --mode=prod."
    );
  }

  const prisma = new PrismaClient();
  console.log(
    `[seed] mode=${mode} NODE_ENV=${process.env.NODE_ENV ?? "(unset)"}`
  );

  try {
    if (mode === "dev") {
      await seedDev(prisma);
    } else {
      await seedProd(prisma);
    }
    console.log(`[seed] done (${mode})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
