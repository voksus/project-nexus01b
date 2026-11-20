import { ErrorResponseSchema, registry } from "../openapi.ts";
import {
  OwnRecipesQuerySchema,
  PaginatedRecipesSchema,
  PopularRecipesQuerySchema,
  RecipeCardSchema,
  RecipeDetailsSchema,
  RecipeIdParamsSchema,
  RecipesQuerySchema,
} from "../schemas/recipesSchemas.ts";
import { z } from "../utils/zod.ts";
import { errorResponses } from "./errorResponses.ts";
import { authenticatedSecurity, optionalSecurity } from "./security.ts";

registry.registerPath({
  method: "get",
  path: "/api/recipes",
  tags: ["Recipes"],
  summary: "Search recipes with server-side pagination",
  description:
    "Category, ingredient and area filters are combined with AND. Category and area accept an ID or an exact, case-insensitive name. Recipes are ordered by creation date descending, then ID ascending. An unknown filter or an out-of-range page returns an empty items array. totalPages is at least 1, following the shared API pagination helper. Authentication is optional; use a Bearer access token or the accessToken cookie to receive isFavorite values.",
  security: optionalSecurity,
  request: { query: RecipesQuerySchema },
  responses: {
    200: {
      description: "A paginated list of recipe cards.",
      content: { "application/json": { schema: PaginatedRecipesSchema } },
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/recipes/popular",
  tags: ["Recipes"],
  summary: "Get popular recipes",
  description:
    "Ordered by the number of favorites descending, then ID ascending to resolve ties. Recipes without favorites are included when needed to fill the requested limit. Authentication is optional; isFavorite refers only to the current user.",
  security: optionalSecurity,
  request: { query: PopularRecipesQuerySchema },
  responses: {
    200: {
      description: "An array of recipe cards, without a pagination wrapper.",
      content: { "application/json": { schema: z.array(RecipeCardSchema) } },
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/recipes/own",
  tags: ["Recipes"],
  summary: "Get own or specified user's recipes",
  description:
    "Returns a paginated list of recipes created by the authenticated user, or by the author specified via the optional `userId` query parameter. Recipes are ordered by creation date descending, then ID ascending.",
  security: authenticatedSecurity,
  request: { query: OwnRecipesQuerySchema },
  responses: {
    200: {
      description: "A paginated list of recipe cards.",
      content: { "application/json": { schema: PaginatedRecipesSchema } },
    },
    ...errorResponses,
  },
});
const RecipeIngredientSchema = registry.register(
  "RecipeIngredient",
  z.object({
    id: z.string().openapi({ example: "6462a8f74c3d0ddd28897fcd" }),
    name: z.string().openapi({ example: "Avocado" }),
    img: z.string().nullable(),
    measure: z.string().nullable().openapi({ example: "3" }),
  }),
);

const RecipeSchema = registry.register(
  "Recipe",
  z.object({
    id: z.string().openapi({ example: "3f9c1e7a-2b4d-4c8e-9a1f-6d5b7e8c9a0b" }),
    title: z.string().openapi({ example: "Salmon avocado salad" }),
    description: z.string().nullable(),
    instructions: z.string(),
    time: z.number().int().nullable().openapi({ example: 40 }),
    thumb: z.string().nullable(),
    ownerId: z.string(),
    category: z.object({ id: z.string(), name: z.string() }),
    area: z.object({ id: z.string(), name: z.string() }),
    ingredients: z.array(RecipeIngredientSchema),
    createdAt: z.string().openapi({ format: "date-time" }),
    updatedAt: z.string().openapi({ format: "date-time" }),
  }),
);

const CreateRecipeMultipartSchema = registry.register(
  "CreateRecipeMultipart",
  z.object({
    title: z.string().openapi({ example: "Salmon avocado salad" }),
    description: z
      .string()
      .openapi({ example: "A healthy salad with salmon and avocado." }),
    instructions: z.string(),
    categoryId: z.string().openapi({ example: "6462a8f74c3d0ddd28897fcd" }),
    areaId: z.string().openapi({ example: "6462a8f74c3d0ddd28897fcd" }),
    time: z.string().openapi({
      example: "40",
      description: "Minutes, 1–1440",
    }),
    ingredients: z.string().openapi({
      example: '[{"id":"6462a8f74c3d0ddd28897fcd","measure":"400 g"}]',
      description:
        "JSON array of { id, measure }. Each ingredient at least once.",
    }),
    thumb: z.string().openapi({
      format: "binary",
      description: "JPEG, PNG or WebP, max 5 MB",
    }),
  }),
);

registry.registerPath({
  method: "post",
  path: "/api/recipes",
  tags: ["Recipes"],
  summary: "Create a recipe",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": { schema: CreateRecipeMultipartSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Recipe created",
      content: { "application/json": { schema: RecipeSchema } },
    },
    400: {
      description:
        "Validation error, missing image, or unknown category, area, or ingredient ID",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Get full recipe details by ID",
  description:
    "Returns full details of a single recipe, including category, area, owner, ingredients with measures, and `isFavorite` status (always `false` for unauthenticated guests).",
  security: optionalSecurity,
  request: {
    params: RecipeIdParamsSchema,
  },
  responses: {
    200: {
      description: "Full recipe details.",
      content: { "application/json": { schema: RecipeDetailsSchema } },
    },
    ...errorResponses,
    404: {
      description: "Recipe not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const UpdateRecipeMultipartSchema = registry.register(
  "UpdateRecipeMultipart",
  CreateRecipeMultipartSchema.partial().extend({
    thumb: z.string().optional().openapi({
      format: "binary",
      description: "Optional replacement JPEG, PNG or WebP, max 5 MB",
    }),
  }),
);

registry.registerPath({
  method: "patch",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Partially update an own recipe",
  description:
    "Updates only the provided fields. A new photo replaces the previous one. At least one field or a new image is required. Unknown category, area, or ingredient IDs are rejected.",
  security: [{ bearerAuth: [] }],
  request: {
    params: RecipeIdParamsSchema,
    body: {
      required: true,
      content: {
        "multipart/form-data": { schema: UpdateRecipeMultipartSchema },
      },
    },
  },
  responses: {
    200: {
      description: "The updated recipe.",
      content: { "application/json": { schema: RecipeDetailsSchema } },
    },
    400: {
      description:
        "Validation error, empty update, or unknown category, area, or ingredient ID",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Recipe belongs to another user",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Recipe not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    415: {
      description:
        "Content-Type is not multipart or the image type is not allowed",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Delete own recipe",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ example: "3f9c1e7a-2b4d-4c8e-9a1f-6d5b7e8c9a0b" }),
    }),
  },
  responses: {
    204: { description: "Recipe deleted" },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Recipe belongs to another user",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Recipe not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
