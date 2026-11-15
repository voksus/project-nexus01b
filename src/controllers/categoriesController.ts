import type { Request, Response } from "express";
import * as categoriesService from "../services/categoriesService.ts";

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await categoriesService.getCategories();
  res.status(200).json(categories);
};
