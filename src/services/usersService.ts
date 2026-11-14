import { prisma } from "../db.ts";
import { HttpError } from "../errors/HttpError.ts";
import {
  formatPaginatedResponse,
  getPaginationParams,
  type PaginationQuery,
} from "../utils/pagination.ts";
import { uploadImage } from "./cloudinaryService.ts";

const ensureUserExists = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }
};

export const getCurrentUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      _count: {
        select: {
          recipes: true,
          favorites: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    recipesCount: user._count.recipes,
    favoritesCount: user._count.favorites,
    followersCount: user._count.followers,
    followingCount: user._count.following,
  };
};

export const getUserByIdService = async (
  targetUserId: string,
  currentUserId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      _count: {
        select: {
          recipes: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const followRecord = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    recipesCount: user._count.recipes,
    followersCount: user._count.followers,
    isFollowing: Boolean(followRecord),
  };
};

export const updateUserAvatarService = async (
  userId: string,
  filePath: string,
) => {
  const avatarUrl = await uploadImage(filePath, `avatars/${userId}`, {
    overwrite: true,
  });

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: { avatar: true },
  });

  return { avatar: updatedUser.avatar };
};

export const getFollowingService = async (
  userId: string,
  query: PaginationQuery = {},
) => {
  const { page, limit, skip } = getPaginationParams(query, 5);

  const [total, followingRecords] = await Promise.all([
    prisma.userFollow.count({ where: { followerId: userId } }),
    prisma.userFollow.findMany({
      where: { followerId: userId },
      skip,
      take: limit,
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            _count: { select: { followers: true, recipes: true } },
            recipes: {
              take: 4,
              orderBy: { createdAt: "desc" },
              select: { id: true, title: true, thumb: true },
            },
          },
        },
      },
    }),
  ]);

  const items = followingRecords.map((record) => ({
    id: record.following.id,
    name: record.following.name,
    avatar: record.following.avatar,
    recipesCount: record.following._count.recipes,
    isFollowing: true,
    recipes: record.following.recipes,
  }));

  return formatPaginatedResponse(items, total, page, limit);
};

export const getFollowersService = async (
  targetUserId: string,
  currentUserId: string,
  query: PaginationQuery = {},
) => {
  await ensureUserExists(targetUserId);

  const { page, limit, skip } = getPaginationParams(query, 5);

  const [total, followerRecords] = await Promise.all([
    prisma.userFollow.count({ where: { followingId: targetUserId } }),
    prisma.userFollow.findMany({
      where: { followingId: targetUserId },
      skip,
      take: limit,
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            _count: { select: { followers: true, recipes: true } },
            recipes: {
              take: 4,
              orderBy: { createdAt: "desc" },
              select: { id: true, title: true, thumb: true },
            },
          },
        },
      },
    }),
  ]);

  const followerUserIds = followerRecords.map((r) => r.follower.id);
  const currentUserFollows = await prisma.userFollow.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: followerUserIds },
    },
    select: { followingId: true },
  });

  const currentUserFollowsSet = new Set(
    currentUserFollows.map((f) => f.followingId),
  );

  const items = followerRecords.map((record) => ({
    id: record.follower.id,
    name: record.follower.name,
    avatar: record.follower.avatar,
    recipesCount: record.follower._count.recipes,
    isFollowing: currentUserFollowsSet.has(record.follower.id),
    recipes: record.follower.recipes,
  }));

  return formatPaginatedResponse(items, total, page, limit);
};

export const followUserService = async (
  currentUserId: string,
  targetUserId: string,
) => {
  if (currentUserId === targetUserId) {
    throw new HttpError(400, "You cannot follow yourself");
  }

  await ensureUserExists(targetUserId);

  await prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
    create: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
    update: {},
  });

  return { message: "Successfully followed" };
};

export const unfollowUserService = async (
  currentUserId: string,
  targetUserId: string,
) => {
  await ensureUserExists(targetUserId);

  await prisma.userFollow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  return { message: "Successfully unfollowed" };
};
