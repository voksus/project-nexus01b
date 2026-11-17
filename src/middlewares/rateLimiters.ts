import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { createHttpError } from "../errors/HttpError.ts";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Goes through errorHandler so a 429 has the same { message } shape as other errors
const tooManyRequests = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(createHttpError(429));
};

const createRateLimiter = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: tooManyRequests,
  });

// Password guessing: login and register share one counter per IP
export const authRateLimiter = createRateLimiter(FIFTEEN_MINUTES, 15);

// The frontend calls refresh on every app start and after any 401,
// so a guest reloading pages would hit the strict auth limit
export const refreshRateLimiter = createRateLimiter(FIFTEEN_MINUTES, 60);

export const apiRateLimiter = createRateLimiter(60 * 1000, 200);
