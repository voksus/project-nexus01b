import { registry } from "../openapi.ts";
import { CategoriesResponseSchema } from "../schemas/categoriesSchemas.ts";

registry.registerPath({
  method: "get",
  path: "/api/categories",
  tags: ["Categories"],
  summary: "Get all categories",
  description: "Returns a complete list of recipe categories.",
  responses: {
    200: {
      description: "Array of category objects",
      content: {
        "application/json": { schema: CategoriesResponseSchema },
      },
    },
  },
});
