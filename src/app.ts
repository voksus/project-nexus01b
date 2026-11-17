import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.ts";
import { logger } from "./logger.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { notFoundHandler } from "./middlewares/notFoundHandler.ts";
import { apiRateLimiter } from "./middlewares/rateLimiters.ts";
import { generateOpenApiDocument } from "./openapi.ts";
import apiRouter from "./routes/index.ts";

const app = express();

// Render and Vercel rewrites put proxies in front; without this every client shares the proxy IP
app.set("trust proxy", env.TRUST_PROXY);

app.use(
  pinoHttp({
    logger,
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
  }),
);

app.use(
  cors({
    origin: env.allowedOriginsList,
    credentials: true,
  }),
);
app.use(helmet());
// Before body parsing, so rejected requests cost as little as possible; health checks stay unlimited
app.use("/api", (req, res, next) =>
  req.path === "/health" ? next() : apiRateLimiter(req, res, next),
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const openApiDoc = generateOpenApiDocument();
    return swaggerUi.setup(openApiDoc)(_req, res, next);
  },
);

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
