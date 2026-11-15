import { prisma } from "../db.ts";

export const getCategories = async () => {
  return await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};
