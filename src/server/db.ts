import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL non configurata");
}

const globalForPrisma = globalThis as typeof globalThis & {
  __casaHubPrisma?: PrismaClient;
  __casaHubPrismaUrl?: string;
};

const adapter = new PrismaPg({ connectionString });
const reusableClient =
  globalForPrisma.__casaHubPrismaUrl === connectionString
    ? globalForPrisma.__casaHubPrisma
    : undefined;

if (globalForPrisma.__casaHubPrisma && !reusableClient) {
  void globalForPrisma.__casaHubPrisma.$disconnect();
}

export const db =
  reusableClient ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__casaHubPrisma = db;
  globalForPrisma.__casaHubPrismaUrl = connectionString;
}
