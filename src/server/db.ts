import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __casaHubPrisma?: PrismaClient;
  __casaHubPrismaUrl?: string;
};

let client: PrismaClient | undefined;

function getClient() {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL non configurata");
  }

  const reusableClient =
    globalForPrisma.__casaHubPrismaUrl === connectionString
      ? globalForPrisma.__casaHubPrisma
      : undefined;

  if (globalForPrisma.__casaHubPrisma && !reusableClient) {
    void globalForPrisma.__casaHubPrisma.$disconnect();
  }

  client =
    reusableClient ??
    new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__casaHubPrisma = client;
    globalForPrisma.__casaHubPrismaUrl = connectionString;
  }

  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const prisma = getClient();
    const value = Reflect.get(prisma, property, prisma);

    return typeof value === "function" ? value.bind(prisma) : value;
  },
});
