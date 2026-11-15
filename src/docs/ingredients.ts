import { registry } from "../openapi.ts";
import { IngredientsResponseSchema } from "../schemas/ingredientsSchemas.ts";

registry.registerPath({
  method: "get",
  path: "/api/ingredients",
  tags: ["Ingredients"],
  summary: "Get all ingredients",
  description: "Returns a complete list of ingredients.",
  responses: {
    200: {
      description: "Array of ingredient objects",
      content: {
        "application/json": { schema: IngredientsResponseSchema },
      },
    },
  },
});
