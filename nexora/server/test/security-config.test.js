import test from "node:test";
import assert from "node:assert/strict";
import { getAllowedOrigins, resolveJwtSecret } from "../src/security-config.js";

test("production refuses to start without a strong JWT secret", () => {
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: "production", JWT_SECRET: "" }),
    /JWT_SECRET/
  );
});

test("Render is treated as production even when NODE_ENV is unset", () => {
  assert.throws(
    () => resolveJwtSecret({ RENDER: "true", JWT_SECRET: "" }),
    /JWT_SECRET/
  );
});

test("production refuses the historical default JWT secret", () => {
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: "production", JWT_SECRET: "change-me" }),
    /JWT_SECRET/
  );
});

test("production accepts a unique secret with at least 32 characters", () => {
  const secret = "test-only-strong-random-secret-123456789";
  assert.equal(resolveJwtSecret({ NODE_ENV: "production", JWT_SECRET: secret }), secret);
});

test("development can start without production secrets", () => {
  assert.ok(resolveJwtSecret({ NODE_ENV: "development" }).length >= 32);
});

test("production CORS allow-list includes the deployed frontend and excludes dev Vite", () => {
  const origins = getAllowedOrigins({ NODE_ENV: "production" });
  assert.ok(origins.has("https://nexora-referral.onrender.com"));
  assert.ok(origins.has("capacitor://localhost"));
  assert.ok(!origins.has("http://localhost:5173"));
});

test("CORS_ORIGINS accepts a comma-separated list", () => {
  const origins = getAllowedOrigins({
    NODE_ENV: "production",
    CORS_ORIGINS: "https://example.test, https://admin.example.test"
  });
  assert.ok(origins.has("https://example.test"));
  assert.ok(origins.has("https://admin.example.test"));
});
