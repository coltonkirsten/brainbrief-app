import { NextResponse } from "next/server";
import { submitToIndexNow, getAllPublicUrls } from "@/lib/indexnow";

/**
 * POST /api/indexnow — Submit all public URLs to IndexNow.
 * Protected by CRON_SECRET (same as other internal endpoints).
 *
 * Can be called manually or hooked into the SEO cron.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = getAllPublicUrls();
  console.log(`[indexnow] Submitting ${urls.length} URLs`);

  const result = await submitToIndexNow(urls);

  return NextResponse.json({
    ...result,
    totalUrls: urls.length,
  });
}
