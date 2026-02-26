import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

// Allow up to 30s for Twitter API calls
export const maxDuration = 30;

/**
 * Post a tweet via the Twitter/X API v2.
 *
 * POST /api/twitter/post
 * Headers: { Authorization: "Bearer <INTERNAL_API_SECRET>" }
 * Body:    { "text": string }
 *
 * Returns: { success: true, tweetId: string, tweetUrl: string }
 *
 * Protected by INTERNAL_API_SECRET — only internal agents (Em) can call this.
 */
export async function POST(request: Request) {
  // -----------------------------------------------------------------------
  // 1. Auth — verify internal secret
  // -----------------------------------------------------------------------
  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    console.error("[twitter] INTERNAL_API_SECRET is not configured");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token || token !== internalSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // -----------------------------------------------------------------------
  // 2. Validate request body
  // -----------------------------------------------------------------------
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json(
      { error: "Missing required field: text" },
      { status: 400 }
    );
  }

  if (text.length > 280) {
    return NextResponse.json(
      { error: `Tweet too long: ${text.length} characters (max 280)` },
      { status: 400 }
    );
  }

  // -----------------------------------------------------------------------
  // 3. Validate Twitter credentials
  // -----------------------------------------------------------------------
  const apiKey = process.env.TWITTER_API_KEY;
  const apiKeySecret = process.env.TWITTER_API_KEY_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiKeySecret || !accessToken || !accessTokenSecret) {
    console.error("[twitter] Missing one or more Twitter API credentials");
    return NextResponse.json(
      { error: "Twitter API credentials not configured" },
      { status: 500 }
    );
  }

  // -----------------------------------------------------------------------
  // 4. Post the tweet
  // -----------------------------------------------------------------------
  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiKeySecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    const { data } = await client.v2.tweet(text);

    const tweetId = data.id;
    const tweetUrl = `https://x.com/i/status/${tweetId}`;

    console.log(`[twitter] Tweet posted: ${tweetId}`);

    return NextResponse.json({
      success: true,
      tweetId,
      tweetUrl,
    });
  } catch (err: unknown) {
    // Handle Twitter API errors with specific messaging
    if (err && typeof err === "object" && "code" in err) {
      const twitterErr = err as { code: number; data?: { detail?: string; title?: string } };

      // Rate limit
      if (twitterErr.code === 429) {
        console.error("[twitter] Rate limited by Twitter API");
        return NextResponse.json(
          { error: "Twitter rate limit exceeded. Try again later." },
          { status: 429 }
        );
      }

      // Auth failure
      if (twitterErr.code === 401 || twitterErr.code === 403) {
        console.error("[twitter] Auth error:", twitterErr.data?.detail || twitterErr.code);
        return NextResponse.json(
          { error: `Twitter auth failed: ${twitterErr.data?.detail || "check credentials"}` },
          { status: 403 }
        );
      }

      // Duplicate tweet
      if (twitterErr.code === 403 && twitterErr.data?.detail?.includes("duplicate")) {
        return NextResponse.json(
          { error: "Duplicate tweet — Twitter rejected identical content" },
          { status: 409 }
        );
      }

      console.error("[twitter] API error:", twitterErr.code, twitterErr.data);
      return NextResponse.json(
        { error: `Twitter API error (${twitterErr.code}): ${twitterErr.data?.detail || "Unknown error"}` },
        { status: twitterErr.code >= 400 && twitterErr.code < 600 ? twitterErr.code : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[twitter] Unexpected error:", message);
    return NextResponse.json(
      { error: `Failed to post tweet: ${message}` },
      { status: 500 }
    );
  }
}
