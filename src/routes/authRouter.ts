import { Router } from "express";
import * as authController from "../controllers/authController.ts";
import "../docs/auth.ts";
import {
  authRateLimiter,
  refreshRateLimiter,
} from "../middlewares/rateLimiters.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { LoginBodySchema, RegisterBodySchema } from "../schemas/authSchemas.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";

const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest({ body: RegisterBodySchema }),
  ctrlWrapper(authController.register),
);

authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest({ body: LoginBodySchema }),
  ctrlWrapper(authController.login),
);

authRouter.post(
  "/refresh",
  refreshRateLimiter,
  ctrlWrapper(authController.refresh),
);

authRouter.post("/logout", ctrlWrapper(authController.logout));

export default authRouter;
