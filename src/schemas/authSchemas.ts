import { registry } from "../openapi.ts";
import { z } from "../utils/zod.ts";

const BCRYPT_MAX_BYTES = 72;

// Normalized like prisma/seed.ts so email lookups match
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address").max(255))
  // .pipe() hides the format from the OpenAPI generator
  .openapi({ format: "email", maxLength: 255, example: "user@example.com" });

export const RegisterBodySchema = registry.register(
  "RegisterRequest",
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255)
      .openapi({ example: "John Doe" }),
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(BCRYPT_MAX_BYTES)
      // bcrypt ignores bytes beyond 72; non-ASCII chars take 2-4 bytes
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= BCRYPT_MAX_BYTES,
        `Password must be at most ${BCRYPT_MAX_BYTES} bytes`,
      )
      .openapi({ example: "secret123" }),
  }),
);

export const LoginBodySchema = registry.register(
  "LoginRequest",
  z.object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "Password is required")
      .openapi({ example: "secret123" }),
  }),
);

export const AuthUserSchema = registry.register(
  "AuthUser",
  z.object({
    id: z.string().openapi({ example: "4b1f8a52-8d3e-4c52-9f3a-6f1d2b7c9e10" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().openapi({ example: "user@example.com" }),
    avatar: z.string().nullable().openapi({ example: null }),
  }),
);

export const AuthResponseSchema = registry.register(
  "AuthResponse",
  z.object({
    user: AuthUserSchema,
    accessToken: z.string().openapi({
      description:
        "JWT access token (also set as an httpOnly cookie). Use it for Swagger Bearer Auth.",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
  }),
);

export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type PublicUser = z.infer<typeof AuthUserSchema>;
