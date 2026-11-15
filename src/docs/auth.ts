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

const validationError = errorResponse(
  "Помилка валідації тіла запиту (Validation error)",
);

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: [TAG],
  summary: "Реєстрація нового користувача",
  description:
    "Створює користувача (email нормалізується: trim + lowercase, пароль хешується bcrypt) і одразу виконує логін: встановлює cookies `accessToken` і `refreshToken` та повертає дані користувача й access token.",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: RegisterBodySchema } },
    },
  },
  responses: {
    201: authResponse("Користувача створено, сесію відкрито"),
    400: validationError,
    409: errorResponse("Email вже використовується (Email already in use)"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: [TAG],
  summary: "Вхід користувача",
  description:
    "Перевіряє email і пароль, створює нову сесію (refresh token зберігається в БД у вигляді SHA-256 хешу), встановлює cookies і повертає access token.",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: LoginBodySchema } },
    },
  },
  responses: {
    200: authResponse("Успішний вхід"),
    400: validationError,
    401: errorResponse(
      "Невірний email або пароль, або користувача не існує (Invalid credentials)",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: [TAG],
  summary: "Оновлення пари токенів (ротація refresh token)",
  description:
    "Читає `refreshToken` з cookie, перевіряє підпис JWT, наявність сесії в БД і термін дії. Старий refresh token стає недійсним, видається нова пара токенів і оновлюються cookies.",
  security: [{ [refreshTokenCookie.name]: [] }],
  responses: {
    200: authResponse("Токени оновлено"),
    401: errorResponse(
      "Refresh token відсутній, невалідний, протермінований або вже використаний",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: [TAG],
  summary: "Вихід користувача",
  description:
    "Видаляє поточну сесію (за cookie `refreshToken`, якщо вона є) та очищує обидві cookies. Завжди повертає 204 — навіть без токена або з протермінованим токеном.",
  security: [{ [refreshTokenCookie.name]: [] }, {}],
  responses: {
    204: {
      description: "Сесію завершено, cookies очищено",
      headers: setCookieHeaders(
        "Очищення cookies `accessToken` і `refreshToken`",
      ),
    },
  },
});
