# Rate Limiting System

The EatSmartDaily application implements a distributed rate limiting system using Upstash Redis for production environments with a fallback to in-memory rate limiting for development.

## Architecture

### Production (with Upstash Redis)
- Uses `@upstash/ratelimit` and `@upstash/redis` packages
- Implements sliding window rate limiting per endpoint
- Supports distributed environments across multiple instances
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables

### Development (fallback)
- Uses in-memory Map for storing rate limit counters
- Single-server setup only
- Automatically used when Redis environment variables are not configured

## Rate Limits

| Endpoint | Limit | Window | Description |
|----------|-------|--------|-------------|
| api_posts | 10 requests | 1 minute | Creating new posts |
| api_contact | 5 requests | 1 hour | Contact form submissions |
| api_newsletter | 3 requests | 24 hours | Newsletter subscriptions |
| api_comments | 5 requests | 1 minute | Comment submissions |
| api_views | 100 requests | 10 seconds | Page view tracking |
| api_auth_login | 5 attempts | 15 minutes | Login attempts |
| api_upload | 20 requests | 1 minute | File uploads |

## Implementation

The `checkRateLimit(identifier, endpoint)` function is async and returns:
```typescript
{
  allowed: boolean;
  retryAfter?: number; // seconds to wait before retry
}
```

## Usage in API Routes

```typescript
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "api_posts");

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // Process request...
}
```

## Environment Variables

For production deployment:
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

If these are not set, the system automatically falls back to in-memory rate limiting.