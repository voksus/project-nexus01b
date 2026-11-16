import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { ErrorResponseSchema, registry } from "../openapi.ts";
import {
  AuthResponseSchema,
  LoginBodySchema,
  RegisterBodySchema,
} from "../schemas/authSchemas.ts";

const TAG = "Auth";

const refreshTokenCookie = registry.registerComponent(
  "securitySchemes",
  "refreshTokenCookie",
  {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
    description:
      "HTTP-only cookie containing the JWT Refresh Token (path /api/auth). Set automatically by register/login/refresh.",
  },
);

const setCookieHeaders = (description: string): ResponseConfig["headers"] => ({
  "Set-Cookie": {
    description,
    schema: { type: "string" },
  },
});

const setAuthCookiesHeaders = setCookieHeaders(
  "`accessToken` (httpOnly, path=/api, 15 min) and `refreshToken` (httpOnly, path=/api/auth, 7 days); SameSite=Lax, Secure in production.",
);

const errorResponse = (description: string): ResponseConfig => ({
  description,
  content: { "application/json": { schema: ErrorResponseSchema } },
});

const authResponse = (description: string): ResponseConfig => ({
  description,
  headers: setAuthCookiesHeaders,
  content: { "application/json": { schema: AuthResponseSchema } },
});

const validationError = errorResponse("Request body validation failed");

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: [TAG],
  summary: "Register a new user",
  description:
    "Creates a user (email is trimmed and lowercased, password is hashed with bcrypt) and logs them in: sets the `accessToken` and `refreshToken` cookies and returns the user and the access token.",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: RegisterBodySchema } },
    },
  },
  responses: {
    201: authResponse("User created and logged in"),
    400: validationError,
    409: errorResponse("Email already in use"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: [TAG],
  summary: "Log in",
  description:
    "Checks email and password, starts a new session (the refresh token is stored in the DB as a SHA-256 hash), sets the cookies and returns the access token.",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: LoginBodySchema } },
    },
  },
  responses: {
    200: authResponse("Logged in"),
    400: validationError,
    401: errorResponse("Wrong password or unknown email (Invalid credentials)"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: [TAG],
  summary: "Refresh the token pair (refresh token rotation)",
  description:
    "Reads `refreshToken` from the cookie and checks the JWT signature, the session in the DB and its expiry. The old refresh token is invalidated, a new token pair is issued and the cookies are updated.",
  security: [{ [refreshTokenCookie.name]: [] }],
  responses: {
    200: authResponse("Tokens refreshed"),
    401: errorResponse(
      "Refresh token is missing, invalid, expired or already used",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: [TAG],
  summary: "Log out",
  description:
    "Deletes the current session (by the `refreshToken` cookie, if present) and clears both cookies. Always returns 204, even without a token or with an expired one.",
  security: [{ [refreshTokenCookie.name]: [] }, {}],
  responses: {
    204: {
      description: "Logged out, cookies cleared",
      headers: setCookieHeaders(
        "Clears the `accessToken` and `refreshToken` cookies",
      ),
    },
  },
});
