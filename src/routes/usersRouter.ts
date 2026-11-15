import { Router } from "express";
import "../docs/users.ts";
import * as userCtrl from "../controllers/usersController.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import { imageUpload } from "../middlewares/imageUpload.ts";
import { removeTempUpload } from "../middlewares/removeTempUpload.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import {
  UserIdParamsSchema,
  UsersPaginationQuerySchema,
} from "../schemas/usersSchemas.ts";

const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get("/current", userCtrl.getCurrentUser);
usersRouter.get(
  "/following",
  validateRequest({ query: UsersPaginationQuerySchema }),
  userCtrl.getFollowing,
);
usersRouter.patch(
  "/avatars",
  imageUpload.single("avatar"),
  removeTempUpload,
  userCtrl.updateAvatar,
);
usersRouter.get(
  "/:id",
  validateRequest({ params: UserIdParamsSchema }),
  userCtrl.getUserById,
);
usersRouter.get(
  "/:id/followers",
  validateRequest({
    params: UserIdParamsSchema,
    query: UsersPaginationQuerySchema,
  }),
  userCtrl.getFollowers,
);
usersRouter.post(
  "/:id/follow",
  validateRequest({ params: UserIdParamsSchema }),
  userCtrl.followUser,
);
usersRouter.delete(
  "/:id/follow",
  validateRequest({ params: UserIdParamsSchema }),
  userCtrl.unfollowUser,
);

export default usersRouter;
