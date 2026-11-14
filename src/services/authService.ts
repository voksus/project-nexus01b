import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../db.ts";
import { createHttpError } from "../errors/HttpError.ts";
import type {
  LoginBody,
  PublicUser,
  RegisterBody,
} from "../schemas/authSchemas.ts";
import {
  type AuthTokens,
  hashToken,
  signAuthTokens,
  verifyRefreshToken,
} from "../utils/tokens.ts";

const SALT_ROUNDS = 10;

// Compared when the user is missing, so timing doesn't reveal registered emails
const dummyPasswordHash = bcrypt.hash(randomUUID(), SALT_ROUNDS);

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

type DbClient = typeof prisma | Prisma.TransactionClient;

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

const createSession = async (
  db: DbClient,
  user: PublicUser,
): Promise<AuthTokens> => {
  const tokens = signAuthTokens(user);
  await db.refreshToken.create({
    data: {
      token: hashToken(tokens.refreshToken.token),
      userId: user.id,
      expiresAt: tokens.refreshToken.expiresAt,
    },
  });
  return tokens;
};

export const register = async ({
  name,
  email,
  password,
}: RegisterBody): Promise<AuthResult> => {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw createHttpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // A concurrent duplicate fails with P2002, which errorHandler maps to 409
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: passwordHash },
      select: publicUserSelect,
    });
    const tokens = await createSession(tx, user);
    return { user, tokens };
  });
};

export const login = async ({
  email,
  password,
}: LoginBody): Promise<AuthResult> => {
  const found = await prisma.user.findUnique({
    where: { email },
    select: { ...publicUserSelect, password: true },
  });
  const passwordMatches = await bcrypt.compare(
    password,
    found?.password ?? (await dummyPasswordHash),
  );
  if (!found || !passwordMatches) {
    throw createHttpError(401, "Invalid credentials");
  }

  const { password: _passwordHash, ...user } = found;

  // Drop this user's expired sessions
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id, expiresAt: { lte: new Date() } },
  });

  const tokens = await createSession(prisma, user);
  return { user, tokens };
};

export const refresh = async (
  refreshToken: string | undefined,
): Promise<AuthResult> => {
  if (!refreshToken) {
    throw createHttpError(401, "Refresh token is missing");
  }
  const userId = verifyRefreshToken(refreshToken);
  if (!userId) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  return prisma.$transaction(async (tx) => {
    // Atomic claim: only one concurrent request with this token gets count 1
    const { count } = await tx.refreshToken.deleteMany({
      where: {
        token: hashToken(refreshToken),
        userId,
        expiresAt: { gt: new Date() },
      },
    });
    if (count !== 1) {
      throw createHttpError(401, "Invalid or expired refresh token");
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) {
      throw createHttpError(401, "Invalid or expired refresh token");
    }

    const tokens = await createSession(tx, user);
    return { user, tokens };
  });
};

export const logout = async (
  refreshToken: string | undefined,
): Promise<void> => {
  if (!refreshToken) {
    return;
  }
  // No JWT verification: an expired token must still remove its session
  await prisma.refreshToken.deleteMany({
    where: { token: hashToken(refreshToken) },
  });
};
