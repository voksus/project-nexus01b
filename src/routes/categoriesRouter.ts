import { Router } from "express";
import "../docs/categories.ts";
import { getCategories } from "../controllers/categoriesController.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";

const categoriesRouter = Router();

categoriesRouter.get("/", ctrlWrapper(getCategories));

export default categoriesRouter;
