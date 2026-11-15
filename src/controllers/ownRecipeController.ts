import type { Request, Response } from "express";
import { createHttpError } from "../errors/HttpError.ts";
import type { OwnRecipesQuery } from "../schemas/recipesSchemas.ts";
import { listOwnRecipes } from "../services/recipesService.ts";

const getCurrentUserId = (req: Request): string => {
  if (!req.user) throw createHttpError(401);
  return req.user.id;
};

export async function getOwnRecipes(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  const query = req.query as unknown as OwnRecipesQuery;
  res.status(200).json(await listOwnRecipes(query, userId));
}
