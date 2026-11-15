import type { Request, Response } from "express";
import * as ingredientsService from "../services/ingredientsService.ts";

export const getIngredients = async (_req: Request, res: Response) => {
  const ingredients = await ingredientsService.getIngredients();
  res.status(200).json(ingredients);
};
