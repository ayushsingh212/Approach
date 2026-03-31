import mongoose from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ─── Global cache (persists across hot reloads in dev) ────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

// ─── Connect ──────────────────────────────────────────────────────────────────

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in your .env.local file");
  }

  // Return existing connection if available
  if (cache.conn) return cache.conn;

  // Reuse pending connection promise (avoids duplicate connections during hot reload)
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,       // Don't queue commands if not connected
      maxPoolSize: 10,             // Max concurrent connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cache.conn = await cache.promise;
    console.log("✅ MongoDB connected successfully");
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

export default connectDB;