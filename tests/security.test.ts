import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import type { Server } from "node:http";
import { after, before, test } from "node:test";

// Every request here is rejected by a limiter, validation or a missing cookie
// before it reaches Prisma, so no test database is needed
let server: Server;
let baseUrl: string;

async function post(path: string, headers?: Record<string, string>) {
  const response = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: "{}",
    signal: AbortSignal.timeout(10000),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json(),
  };
}

before(async () => {
  process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1:1/unused";
  process.env.JWT_SECRET = randomBytes(48).toString("hex");
  process.env.NODE_ENV = "test";

  const app = (await import("../src/app.ts")).default;

  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", () => resolve());
    server.once("error", reject);
  });
  const address = server.address();
  assert(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("responses carry security headers and hide Express", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.ok(response.headers.get("content-security-policy"));
  assert.ok(response.headers.get("strict-transport-security"));
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("health check is not rate limited", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.headers.get("ratelimit"), null);
});

test("login and register share a limit of 15 attempts per IP", async () => {
  const ip = { "X-Forwarded-For": "203.0.113.1" };

  for (let attempt = 1; attempt <= 15; attempt++) {
    const path = attempt % 2 ? "/api/auth/login" : "/api/auth/register";
    const { status } = await post(path, ip);
    assert.equal(status, 400, `attempt ${attempt} should reach validation`);
  }

  const blocked = await post("/api/auth/login", ip);
  assert.equal(blocked.status, 429);
  assert.deepEqual(blocked.body, {
    message: "Too many requests, please try again later.",
  });
  assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  assert.match(blocked.headers.get("ratelimit") ?? "", /15-in-15min/);
});

test("the auth limit is counted per client IP behind the proxy", async () => {
  const { status } = await post("/api/auth/login", {
    "X-Forwarded-For": "203.0.113.2",
  });

  assert.equal(status, 400);
});

test("refresh has its own limit, separate from login", async () => {
  const { status } = await post("/api/auth/refresh", {
    "X-Forwarded-For": "203.0.113.1",
  });

  assert.equal(status, 401);
});
