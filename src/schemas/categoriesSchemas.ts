import { z } from "zod";
import { registry } from "../openapi.ts";

export const CategorySchema = z.object({
  id: z.string().openapi({
    description: "Unique identifier of the category",
    example: "6462a6cd4c3d0ddd28897f8a",
  }),
  name: z.string().openapi({
    description: "Name of the recipe category",
    example: "Seafood",
  }),
});

export const CategoriesResponseSchema = registry.register(
  "CategoriesResponse",
  z.array(CategorySchema),
);
