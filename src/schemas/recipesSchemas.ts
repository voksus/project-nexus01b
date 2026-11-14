import {
  createPaginatedSchema,
  PaginationQuerySchema,
  registry,
} from "../openapi.ts";
import { z } from "../utils/zod.ts";
import { createPositiveIntegerQuerySchema, IdSchema } from "./commonSchemas.ts";

const filterSchema = z.string().trim().min(1);

export const RecipesQuerySchema = PaginationQuerySchema.extend({
  category: filterSchema.optional().openapi({
    description:
      "Category ID or exact name (case-insensitive). Omit, or use 'all' / 'всі', for all categories.",
    example: "Seafood",
  }),
  ingredient: IdSchema.optional().openapi({
    description: "Ingredient ID: an original 24-character hex ID or a UUID.",
    example: "640c2dd963a319ea671e372c",
  }),
  area: filterSchema.optional().openapi({
    description: "Area ID or exact name (case-insensitive).",
    example: "Italian",
  }),
  limit: PaginationQuerySchema.shape.limit.openapi({
    description: "Recipes per page, from 1 to 100.",
    example: 12,
  }),
});

export const PopularRecipesQuerySchema = z.object({
  limit: createPositiveIntegerQuerySchema(4, 50).openapi({
    description: "Maximum number of popular recipes, from 1 to 50.",
    example: 4,
  }),
});

export const RecipeCardSchema = registry.register(
  "RecipeCard",
  z.object({
    id: z.string().openapi({ example: "6462a8f74c3d0ddd28898098" }),
    title: z.string().openapi({ example: "Chakchouka" }),
    description: z.string().nullable(),
    thumb: z.string().nullable(),
    time: z.number().int().nullable().openapi({
      description: "Cooking time in minutes; null if not provided.",
      example: 30,
    }),
    owner: z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
    }),
    isFavorite: z.boolean().openapi({
      description:
        "Whether the authenticated user saved this recipe. Always false for guests.",
      example: false,
    }),
  }),
);

export const PaginatedRecipesSchema = createPaginatedSchema(
  RecipeCardSchema,
  "PaginatedRecipes",
);

export const OwnRecipesQuerySchema = PaginationQuerySchema.extend({
  limit: createPositiveIntegerQuerySchema(9, 100).openapi({
    description: "Own recipes per page, from 1 to 100.",
    example: 9,
  }),
  userId: IdSchema.optional().openapi({
    description:
      "Optional author ID. If omitted, returns recipes of the currently authenticated user.",
    example: "6462a8f74c3d0ddd28897fb8",
  }),
});

export const PaginatedOwnRecipesResponseSchema = registry.register(
  "PaginatedOwnRecipesResponse",
  z.object({
    items: z.array(RecipeCardSchema),
    total: z.number().int().nonnegative().openapi({ example: 18 }),
    page: z.number().int().min(1).openapi({ example: 1 }),
    limit: z.number().int().min(1).openapi({ example: 9 }),
    totalPages: z.number().int().nonnegative().openapi({ example: 2 }),
  }),
);

export const RecipeIdParamsSchema = z.object({
  id: IdSchema.openapi({
    description: "Recipe ID: an original 24-character hex ID or a UUID.",
    example: "6462a8f74c3d0ddd28898098",
  }),
});

const RecipeIngredientItemSchema = z.object({
  id: z.string().openapi({ example: "640c2dd963a319ea671e372c" }),
  name: z.string().openapi({ example: "Tomatoes" }),
  img: z.string().nullable(),
  measure: z.string().nullable().openapi({ example: "2 large" }),
});

export const RecipeDetailsSchema = registry.register(
  "RecipeDetails",
  RecipeCardSchema.extend({
    instructions: z.string().openapi({
      example: "Heat olive oil in a large skillet over medium heat...",
    }),
    category: z.object({
      id: z.string().openapi({ example: "6462a6cd4c3d0ddd28897f9b" }),
      name: z.string().openapi({ example: "Vegetarian" }),
    }),
    area: z.object({
      id: z.string().openapi({ example: "6462a6f04c3d0ddd28897f9d" }),
      name: z.string().openapi({ example: "Tunisian" }),
    }),
    ingredients: z.array(RecipeIngredientItemSchema),
  }),
);

export type RecipeIdParams = z.infer<typeof RecipeIdParamsSchema>;
export type RecipeDetails = z.infer<typeof RecipeDetailsSchema>;

export type OwnRecipesQuery = z.infer<typeof OwnRecipesQuerySchema>;
export type PaginatedOwnRecipesResponse = z.infer<
  typeof PaginatedOwnRecipesResponseSchema
>;

export type RecipesQuery = z.infer<typeof RecipesQuerySchema>;
export type PopularRecipesQuery = z.infer<typeof PopularRecipesQuerySchema>;
export type RecipeCard = z.infer<typeof RecipeCardSchema>;
