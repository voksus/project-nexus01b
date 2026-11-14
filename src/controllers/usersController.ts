import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import * as userService from "../services/usersService.ts";
import { ctrlWrapper } from "../utils/ctrlWrapper.ts";
import type { PaginationQuery } from "../utils/pagination.ts";

// 1. GET /api/users/current
const getCurrent = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const userProfile = await userService.getCurrentUserService(userId);
  res.json(userProfile);
};

// 2. GET /api/users/:id
const getById = async (req: Request, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const targetUserId = String(req.params.id);
  const userProfile = await userService.getUserByIdService(
    targetUserId,
    currentUserId,
  );
  res.json(userProfile);
};

// 3. PATCH /api/users/avatars
const changeAvatar = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new HttpError(400, "Avatar image file is required");
  }

  const result = await userService.updateUserAvatarService(
    userId,
    req.file.path,
  );
  res.json(result);
};

// 4. GET /api/users/following
const fetchFollowing = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const result = await userService.getFollowingService(
    userId,
    req.query as PaginationQuery,
  );
  res.json(result);
};

// 5. GET /api/users/:id/followers
const fetchFollowers = async (req: Request, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const targetUserId = String(req.params.id);
  const result = await userService.getFollowersService(
    targetUserId,
    currentUserId,
    req.query as PaginationQuery,
  );
  res.json(result);
};

// 6. POST /api/users/:id/follow
const follow = async (req: Request, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const targetUserId = String(req.params.id);
  const result = await userService.followUserService(
    currentUserId,
    targetUserId,
  );
  res.json(result);
};

// 7. DELETE /api/users/:id/follow
const unfollow = async (req: Request, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const targetUserId = String(req.params.id);
  const result = await userService.unfollowUserService(
    currentUserId,
    targetUserId,
  );
  res.json(result);
};

export const getCurrentUser = ctrlWrapper(getCurrent);
export const getUserById = ctrlWrapper(getById);
export const updateAvatar = ctrlWrapper(changeAvatar);

export const getFollowing = ctrlWrapper(fetchFollowing);
export const getFollowers = ctrlWrapper(fetchFollowers);
export const followUser = ctrlWrapper(follow);
export const unfollowUser = ctrlWrapper(unfollow);
