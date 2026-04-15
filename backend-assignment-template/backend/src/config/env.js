import dotenv from "dotenv";

dotenv.config();

export const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS) || 300;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
export const jwtSecret = process.env.JWT_SECRET || "dev-secret";
export const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/waygood-evaluation";
export const port = Number(process.env.PORT) || 4000;
export const redisUrl = process.env.REDIS_URL || "";