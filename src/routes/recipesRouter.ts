import { Router } from "express";
import "../docs/recipes.ts";
import "../docs/favorites.ts";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favoritesController.ts";
import * as recipesController from "../controllers/recipesController.ts";
import { authenticate } from "../middlewares/authenticate.ts";

import { authStub } from "../middlewares/authStub.ts";
import { imageUpload } from "../middlewares/imageUpload.ts";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.ts";
import { removeTempUpload } from "../middlewares/removeTempUpload.ts";
import { requireMultipart } from "../middlewares/requireMultipart.ts";
import { requireRecipeOwner } from "../middlewares/requireRecipeOwner.ts";
import { validateImageContent } from "../middlewares/validateImageContent.ts";
import { validateRecipeReferences } from "../middlewares/validateRecipeReferences.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import {
  FavoriteRecipeParamsSchema,
  FavoritesQuerySchema,
} from "../schemas/favoritesSchemas.ts";
import {
  CreateRecipeSchema,
  PopularRecipesQuerySchema,
  RecipeIdParamsSchema,
  RecipesQuerySchema,
} from "../schemas/recipesSchemas.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";

const recipesRouter = Router();

recipesRouter.get(
  "/favorites",
  authenticate,
  validateRequest({ query: FavoritesQuerySchema }),
  ctrlWrapper(getFavorites),
);

recipesRouter.post(
  "/:id/favorite",
  authenticate,
  validateRequest({ params: FavoriteRecipeParamsSchema }),
  ctrlWrapper(addFavorite),
);

recipesRouter.delete(
  "/:id/favorite",
  authenticate,
  validateRequest({ params: FavoriteRecipeParamsSchema }),
  ctrlWrapper(removeFavorite),
);

recipesRouter.get(
  "/popular",
  optionalAuthenticate,
  validateRequest({ query: PopularRecipesQuerySchema }),
  ctrlWrapper(recipesController.getPopularRecipes),
);

recipesRouter.get(
  "/",
  optionalAuthenticate,
  validateRequest({ query: RecipesQuerySchema }),
  ctrlWrapper(recipesController.getRecipes),
);

recipesRouter.post(
  "/",
  authStub,
  requireMultipart,
  imageUpload.single("thumb"),
  removeTempUpload,
  validateImageContent,
  validateRequest({ body: CreateRecipeSchema }),
  validateRecipeReferences,
  ctrlWrapper(recipesController.createRecipe),
);

recipesRouter.delete(
  "/:id",
  authStub,
  validateRequest({ params: RecipeIdParamsSchema }),
  requireRecipeOwner,
  ctrlWrapper(recipesController.deleteRecipe),
);

export default recipesRouter;
