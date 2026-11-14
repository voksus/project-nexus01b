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
