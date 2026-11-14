import { Router } from "express";
import * as authController from "../controllers/authController.ts";
import "../docs/auth.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { LoginBodySchema, RegisterBodySchema } from "../schemas/authSchemas.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";

const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest({ body: RegisterBodySchema }),
  ctrlWrapper(authController.register),
);

authRouter.post(
  "/login",
  validateRequest({ body: LoginBodySchema }),
  ctrlWrapper(authController.login),
);

authRouter.post("/refresh", ctrlWrapper(authController.refresh));

authRouter.post("/logout", ctrlWrapper(authController.logout));

export default authRouter;
