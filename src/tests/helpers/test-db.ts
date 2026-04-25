import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | undefined;

export function getTestPrisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
}

export async function setup() {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

export async function truncateAll(prisma: PrismaClient) {
  const tables: { tablename: string }[] =
    await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  await prisma.$transaction(
    tables
      .filter((t) => !t.tablename.startsWith("_prisma"))
      .map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t.tablename}" RESTART IDENTITY CASCADE`)),
  );
}
