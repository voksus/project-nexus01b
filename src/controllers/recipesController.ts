import type { Request, Response } from "express";
import type {
  PopularRecipesQuery,
  RecipesQuery,
} from "../schemas/recipesSchemas.ts";
import {
  getRecipeByIdService,
  listPopularRecipes,
  listRecipes,
} from "../services/recipesService.ts";

export async function getRecipes(req: Request, res: Response) {
  const query = req.query as unknown as RecipesQuery;
  const result = await listRecipes(query, req.user?.id);
  res.status(200).json(result);
}

export async function getPopularRecipes(req: Request, res: Response) {
  const { limit } = req.query as unknown as PopularRecipesQuery;
  const result = await listPopularRecipes(limit, req.user?.id);
  res.status(200).json(result);
}

export async function getRecipeById(req: Request, res: Response) {
  const result = await getRecipeByIdService(req.params.id, req.user?.id);
  res.status(200).json(result);
}
