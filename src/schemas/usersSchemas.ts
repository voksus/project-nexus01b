import { createPaginatedSchema, registry } from "../openapi.ts";
import { z } from "../utils/zod.ts";
import { createPositiveIntegerQuerySchema, IdSchema } from "./commonSchemas.ts";

export const UserIdParamsSchema = z.object({
  id: IdSchema.openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
});

export const UsersPaginationQuerySchema = z.object({
  page: createPositiveIntegerQuerySchema(1).openapi({ example: 1 }),
  limit: createPositiveIntegerQuerySchema(5, 100).openapi({ example: 5 }),
});

export const UserRecipePreviewSchema = registry.register(
  "UserRecipePreview",
  z.object({
    id: z.string().openapi({ example: "clx9876543210fedcba" }),
    title: z.string().openapi({ example: "Borscht" }),
    thumb: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/demo/image/upload/borscht.jpg",
    }),
  }),
);

export const UserCardSchema = registry.register(
  "UserCard",
  z.object({
    id: z.string().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "Olena Kovalenko" }),
    avatar: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    }),
    recipesCount: z.number().int().openapi({ example: 12 }),
    isFollowing: z.boolean().openapi({ example: true }),
    recipes: z.array(UserRecipePreviewSchema),
  }),
);

export const PaginatedUserCardsSchema = createPaginatedSchema(
  UserCardSchema,
  "PaginatedUserCards",
);

export const CurrentUserResponseSchema = registry.register(
  "CurrentUserResponse",
  z.object({
    id: z.string().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "Olena Kovalenko" }),
    email: z.email().openapi({ example: "olena@example.com" }),
    avatar: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    }),
    recipesCount: z.number().int().openapi({ example: 12 }),
    favoritesCount: z.number().int().openapi({ example: 8 }),
    followersCount: z.number().int().openapi({ example: 34 }),
    followingCount: z.number().int().openapi({ example: 19 }),
  }),
);

export const UserByIdResponseSchema = registry.register(
  "UserByIdResponse",
  z.object({
    id: z.string().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "Olena Kovalenko" }),
    email: z.email().openapi({ example: "olena@example.com" }),
    avatar: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    }),
    recipesCount: z.number().int().openapi({ example: 12 }),
    followersCount: z.number().int().openapi({ example: 34 }),
    isFollowing: z.boolean().openapi({ example: true }),
  }),
);

export const AvatarResponseSchema = registry.register(
  "AvatarResponse",
  z.object({
    avatar: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/demo/image/upload/new-avatar.jpg",
    }),
  }),
);
