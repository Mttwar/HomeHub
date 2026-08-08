import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL non configurata");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const seedAuth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
});

async function ensureUser(name: string, email: string, password: string) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  await seedAuth.api.signUpEmail({ body: { name, email, password } });
  const created = await db.user.findUnique({ where: { email } });
  if (!created) throw new Error(`Impossibile creare l'utente ${email}`);
  return created;
}

async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const tenantPassword = process.env.SEED_TENANT_PASSWORD;
  if (!ownerPassword || !tenantPassword) throw new Error("Configura SEED_OWNER_PASSWORD e SEED_TENANT_PASSWORD (minimo 12 caratteri)");

  const owner = await ensureUser("Matteo Guerra", "matteo@casahub.local", ownerPassword);
  const tenant = await ensureUser("Giulia Bianchi", "giulia@casahub.local", tenantPassword);
  const apartment = await db.apartment.findFirst({ where: { addressLine: "Via Garibaldi, 24", city: "Roma" } }) ?? await db.apartment.create({ data: { name: "Casa Garibaldi", addressLine: "Via Garibaldi, 24", city: "Roma", postalCode: "00100" } });

  await db.apartmentMembership.upsert({ where: { apartmentId_userId: { apartmentId: apartment.id, userId: owner.id } }, update: { role: "OWNER", status: "ACTIVE" }, create: { apartmentId: apartment.id, userId: owner.id, role: "OWNER" } });
  await db.apartmentMembership.upsert({ where: { apartmentId_userId: { apartmentId: apartment.id, userId: tenant.id } }, update: { role: "TENANT", status: "ACTIVE" }, create: { apartmentId: apartment.id, userId: tenant.id, role: "TENANT" } });
}

main().then(() => db.$disconnect()).catch(async (error) => { console.error(error); await db.$disconnect(); process.exit(1); });
