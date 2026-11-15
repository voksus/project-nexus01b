import { prisma } from "../db.ts";

export const getIngredients = async () => {
  return await prisma.ingredient.findMany({
    select: { id: true, name: true, desc: true, img: true },
    orderBy: { name: "asc" },
  });
};
