import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.ts";
import type { AuthTokens } from "./tokens.ts";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

// Vercel rewrites make /api/* same-origin, so sameSite "lax" is enough
const baseCookieOptions = (path: string): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path,
});

const accessCookieOptions = baseCookieOptions("/api");
// Refresh token is sent only to /api/auth/*, not with every API request
const refreshCookieOptions = baseCookieOptions("/api/auth");

export const setAuthCookies = (res: Response, tokens: AuthTokens): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken.token, {
    ...accessCookieOptions,
    expires: tokens.accessToken.expiresAt,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken.token, {
    ...refreshCookieOptions,
    expires: tokens.refreshToken.expiresAt,
  });
};

// Options must match the ones used when setting, or the browser keeps the cookie
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshCookieOptions);
};

export const getRefreshTokenCookie = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof value === "string" && value !== "" ? value : undefined;
};
