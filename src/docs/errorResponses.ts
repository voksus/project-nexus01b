import { ErrorResponseSchema } from "../openapi.ts";

export const errorResponses = {
  400: {
    description: "Request validation failed.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  401: {
    description:
      "A supplied access token is invalid, expired, or belongs to a deleted user.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  429: {
    description:
      "Rate limit exceeded: more than 200 requests per minute from one IP. See the `RateLimit` and `Retry-After` headers.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  500: {
    description: "Internal server error.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
};
