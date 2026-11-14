import { Router } from "express";
import "../docs/ingredients.ts";
import { getIngredients } from "../controllers/ingredientsController.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";

const ingredientsRouter = Router();

ingredientsRouter.get("/", ctrlWrapper(getIngredients));

export default ingredientsRouter;
