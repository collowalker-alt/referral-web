const DEVELOPMENT_JWT_SECRET = "nexora-local-development-secret-only-change-before-deploy";

export function resolveJwtSecret(env = process.env) {
  const secret = String(env.JWT_SECRET || "").trim();
  const production = String(env.NODE_ENV || "").trim().toLowerCase() === "production";

  if (production && secret.length < 32) {
    throw new Error("Unsafe production configuration: set JWT_SECRET to a unique random value of at least 32 characters.");
  }
  if (production && secret === "change-me") {
    throw new Error("Unsafe production configuration: the default JWT secret is forbidden.");
  }

  // The fallback is deliberately development-only. Production fails closed.
  return secret || DEVELOPMENT_JWT_SECRET;
}

export function getAllowedOrigins(env = process.env) {
  const production = String(env.NODE_ENV || "").trim().toLowerCase() === "production";
  const configured = String(env.CORS_ORIGINS || env.FRONTEND_URL || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  const origins = new Set([
    "https://nexora-referral.onrender.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
    ...configured
  ]);

  if (!production) origins.add("http://localhost:5173");
  return origins;
}
