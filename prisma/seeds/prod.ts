import type { PrismaClient } from "@prisma/client";
import { seedCommon } from "./common";

export async function seedProd(prisma: PrismaClient): Promise<void> {
  await seedCommon(prisma);
}
