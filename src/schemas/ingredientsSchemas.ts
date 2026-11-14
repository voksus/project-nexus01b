import { z } from "zod";
import { registry } from "../openapi.ts";

export const IngredientSchema = z.object({
  id: z.string().openapi({
    description: "Unique identifier of the ingredient",
    example: "640c2dd963a319ea671e37aa",
  }),
  name: z.string().openapi({
    description: "Name of the ingredient",
    example: "Squid",
  }),
  desc: z.string().nullable().openapi({
    description: "Detailed description of the ingredient",
    example: "A type of cephalopod with a soft, cylindrical body...",
  }),
  img: z.string().nullable().openapi({
    description: "URL to the ingredient's image",
    example:
      "https://ftp.goit.study/img/so-yummy/ingredients/640c2dd963a319ea671e37aa.png",
  }),
});

export const IngredientsResponseSchema = registry.register(
  "IngredientsResponse",
  z.array(IngredientSchema),
);
