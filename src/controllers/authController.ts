import type { Request, Response } from "express";
import type { LoginBody, RegisterBody } from "../schemas/authSchemas.ts";
import * as authService from "../services/authService.ts";
import {
  clearAuthCookies,
  getRefreshTokenCookie,
  setAuthCookies,
} from "../utils/authCookies.ts";

const sendAuthResult = (
  res: Response,
  status: number,
  { user, tokens }: authService.AuthResult,
): void => {
  setAuthCookies(res, tokens);
  res.status(status).json({ user, accessToken: tokens.accessToken.token });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req.body as RegisterBody);
  sendAuthResult(res, 201, result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginBody);
  sendAuthResult(res, 200, result);
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.refresh(getRefreshTokenCookie(req));
  sendAuthResult(res, 200, result);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout(getRefreshTokenCookie(req));
  clearAuthCookies(res);
  res.status(204).end();
};
