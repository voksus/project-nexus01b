import { createHash, randomUUID } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";

export interface AuthUser {
  id: string;
  email: string;
}

export interface SignedToken {
  token: string;
  expiresAt: Date;
}

export interface AuthTokens {
  accessToken: SignedToken;
  refreshToken: SignedToken;
}

const ALGORITHM = "HS256";
const SECONDS_PER_DAY = 24 * 60 * 60;

const signToken = (
  payload: Record<string, unknown>,
  subject: string,
  expiresIn: NonNullable<SignOptions["expiresIn"]>,
): SignedToken => {
  const token = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject,
    expiresIn,
  });
  // expiresAt comes from the JWT, so cookie, DB row and token expire together
  const { exp } = jwt.decode(token) as JwtPayload & { exp: number };
  return { token, expiresAt: new Date(exp * 1000) };
};

export const signAccessToken = (user: AuthUser): SignedToken =>
  signToken(
    { type: "access", email: user.email },
    user.id,
    env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  );

export const signRefreshToken = (userId: string): SignedToken =>
  // jti keeps tokens unique within the same second (token is @unique)
  signToken(
    { type: "refresh", jti: randomUUID() },
    userId,
    env.REFRESH_TOKEN_EXPIRES_DAYS * SECONDS_PER_DAY,
  );

export const signAuthTokens = (user: AuthUser): AuthTokens => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user.id),
});

// Returns the user ID, or null if the token is invalid or expired
export const verifyRefreshToken = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: [ALGORITHM],
    });
    if (
      typeof payload === "string" ||
      payload.type !== "refresh" ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
};

// Refresh tokens are stored in the DB as SHA-256 hashes
export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");
