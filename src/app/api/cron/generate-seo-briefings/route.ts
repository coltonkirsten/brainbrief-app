import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateBriefing } from "@/lib/gemini";
import { generateSubjectLine } from "@/lib/email";
import { getAllTopics } from "@/content/topics";

/**
 * Cron endpoint: generates daily briefings for all SEO topic pages.
 *
 * Runs once daily at 10:00 UTC (6 AM ET) via Vercel Cron.
 * Each topic gets a single-topic briefing stored under the sample user ID.
 * Topics are processed in parallel batches to stay within Gemini rate limits
 * and the 300s Vercel function timeout.
 *
 * These briefings power the /topics/{slug} programmatic SEO pages.
 */

export const maxDuration = 300;

const SAMPLE_USER_ID = "0a1ee72f-2d65-4062-8c0b-db92305cae1d";
const BATCH_SIZE = 8; // Topics per parallel batch — balances speed vs rate limits

export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[seo-cron] CRON_SECRET is not set — refusing to run");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(
    "[seo-cron] Starting SEO briefing generation at",
    new Date().toISOString()
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );

  const allTopics = getAllTopics();

  // Check which topics already have a briefing today (skip regeneration)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: existingBriefings } = await supabase
    .from("briefings")
    .select("topics_covered")
    .eq("user_id", SAMPLE_USER_ID)
    .gte("created_at", todayStart.toISOString());

  const existingTopicNames = new Set(
    (existingBriefings ?? []).flatMap(
      (b: { topics_covered: string[] }) => b.topics_covered ?? []
    )
  );

  // Filter to topics that need generation today
  const topicsToGenerate = allTopics.filter(
    (t) => !existingTopicNames.has(t.name)
  );

  if (topicsToGenerate.length === 0) {
    console.log(
      `[seo-cron] All ${allTopics.length} SEO briefings already generated today, skipping`
    );
    return NextResponse.json({
      success: true,
      message: "All SEO briefings already generated today",
      total: allTopics.length,
      generated: 0,
      skipped: allTopics.length,
    });
  }

  console.log(
    `[seo-cron] ${topicsToGenerate.length} of ${allTopics.length} topics need generation`
  );

  // Fetch previous 7 days of sample briefings for dedup context
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data: prevBriefings } = await supabase
    .from("briefings")
    .select("created_at, content_text, topics_covered")
    .eq("user_id", SAMPLE_USER_ID)
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false })
    .limit(200); // More history since we have many topics

  // Process topics in batches
  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < topicsToGenerate.length; i += BATCH_SIZE) {
    // Check if we're running out of time (leave 30s buffer)
    const elapsed = Date.now() - startTime;
    if (elapsed > 250000) {
      console.warn(
        `[seo-cron] ⚠️ Approaching timeout at ${(elapsed / 1000).toFixed(0)}s — stopping after ${successCount} topics`
      );
      break;
    }

    const batch = topicsToGenerate.slice(i, i + BATCH_SIZE);
    console.log(
      `[seo-cron] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.map((t) => t.name).join(", ")}`
    );

    const batchResults = await Promise.allSettled(
      batch.map(async (topic) => {
        try {
          const briefing = await generateBriefing(
            [topic.name],
            null,
            "America/New_York",
            prevBriefings ?? undefined
          );

          const subjectLine = generateSubjectLine(briefing.structured);

          const { error: insertError } = await supabase
            .from("briefings")
            .insert({
              user_id: SAMPLE_USER_ID,
              content_html: briefing.contentHtml,
              content_text: briefing.contentText,
              topics_covered: briefing.topicsCovered,
              grounded: briefing.grounded,
              subject_line: subjectLine,
              structured_data: briefing.structured
                ? JSON.parse(JSON.stringify(briefing.structured))
                : null,
              sent_at: new Date().toISOString(),
            });

          if (insertError) {
            throw new Error(`DB insert failed: ${insertError.message}`);
          }

          return { topic: topic.name, success: true, grounded: briefing.grounded };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          throw new Error(`${topic.name}: ${msg}`);
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        successCount++;
        console.log(
          `[seo-cron] ✓ ${result.value.topic}: grounded=${result.value.grounded}`
        );
      } else {
        failCount++;
        const errMsg = result.reason?.message || "Unknown error";
        errors.push(errMsg);
        console.error(`[seo-cron] ✗ ${errMsg}`);
      }
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(
    `[seo-cron] Done in ${(elapsed / 1000).toFixed(0)}s. Generated: ${successCount}, Failed: ${failCount}, Skipped: ${existingTopicNames.size}`
  );

  if (failCount > 0) {
    console.error(
      `[seo-cron] ⚠️ ALERT: ${failCount} SEO briefings failed: ${errors.slice(0, 5).join("; ")}`
    );
  }

  return NextResponse.json({
    success: true,
    total: allTopics.length,
    generated: successCount,
    failed: failCount,
    skipped: existingTopicNames.size,
    elapsed: `${(elapsed / 1000).toFixed(0)}s`,
  });
}
