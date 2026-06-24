import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function makeRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

// Pre-built limiters per use-case
const limiters = redis
  ? {
      // Public endpoints — strict per IP
      auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:auth" }),
      // Authenticated mutations — per userId
      mutation: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:mutation" }),
      // Checkout — per userId, very tight
      checkout: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:checkout" }),
    }
  : null;

type LimiterKey = keyof NonNullable<typeof limiters>;

/**
 * Returns a 429 NextResponse if rate limit exceeded, otherwise null.
 * identifier should be IP for public routes, userId for authenticated routes.
 */
export async function checkRateLimit(
  identifier: string,
  limiterKey: LimiterKey = "mutation"
): Promise<NextResponse | null> {
  if (!limiters) return null; // Redis not configured — allow (dev/test)

  const { success, limit, remaining, reset } = await limiters[limiterKey].limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
