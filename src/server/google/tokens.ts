import "server-only";

import { auth } from "@/server/auth/auth";
import { db } from "@/server/db";
import { GOOGLE_PROVIDER_ID, parseGoogleScopes } from "@/server/google/constants";
import { GoogleIntegrationError } from "@/server/google/errors";

export async function getGoogleAccount(userId: string) {
  return db.account.findFirst({
    where: { userId, providerId: GOOGLE_PROVIDER_ID },
    select: { id: true, accountId: true, scope: true, refreshToken: true },
  });
}

export async function requireGoogleScope(userId: string, requiredScope: string) {
  const account = await getGoogleAccount(userId);
  if (!account) throw new GoogleIntegrationError("GOOGLE_ACCOUNT_NOT_LINKED");
  if (!parseGoogleScopes(account.scope).has(requiredScope)) throw new GoogleIntegrationError("GOOGLE_SCOPE_MISSING");
  if (!account.refreshToken) throw new GoogleIntegrationError("GOOGLE_REFRESH_TOKEN_MISSING");
  return account;
}

export async function getGoogleAccessToken(userId: string, requiredScope: string) {
  const account = await requireGoogleScope(userId, requiredScope);
  try {
    const token = await auth.api.getAccessToken({
      body: { providerId: GOOGLE_PROVIDER_ID, accountId: account.accountId, userId },
    });
    if (!token.accessToken || !token.scopes.includes(requiredScope)) {
      throw new GoogleIntegrationError("GOOGLE_SCOPE_MISSING");
    }
    return token.accessToken;
  } catch (error) {
    if (error instanceof GoogleIntegrationError) throw error;
    throw new GoogleIntegrationError("GOOGLE_REAUTH_REQUIRED");
  }
}
