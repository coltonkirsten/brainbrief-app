/**
 * IndexNow — instant URL indexing for Bing, Yandex, Seznam, Naver.
 *
 * When we publish new content (SEO topic briefings, blog posts),
 * we notify search engines immediately instead of waiting for crawlers.
 *
 * Docs: https://www.indexnow.org/documentation
 * - One POST to any participating engine propagates to all
 * - Max 10,000 URLs per batch
 * - Key file hosted at /{key}.txt in public/
 */

const INDEXNOW_KEY = "4073a3acfcd4ead16a7d5f9d72ec29d798f6a0ec7db449ad325b881f9af67876";
const HOST = "www.brainbrief.app";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// Submit to Bing — it propagates to all IndexNow participants
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Submit a batch of URLs to IndexNow for instant indexing.
 * Returns { success, status, submitted } or { success: false, error }.
 */
export async function submitToIndexNow(
  urls: string[]
): Promise<{ success: boolean; status?: number; submitted?: number; error?: string }> {
  if (urls.length === 0) {
    return { success: true, submitted: 0 };
  }

  // Cap at 10,000 per spec
  const batch = urls.slice(0, 10000);

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: batch,
      }),
    });

    // 200 = success, 202 = accepted (pending key validation)
    if (response.status === 200 || response.status === 202) {
      console.log(
        `[indexnow] Submitted ${batch.length} URLs, status: ${response.status}`
      );
      return { success: true, status: response.status, submitted: batch.length };
    }

    const body = await response.text().catch(() => "");
    console.error(
      `[indexnow] Failed: status=${response.status}, body=${body.slice(0, 200)}`
    );
    return { success: false, status: response.status, error: body.slice(0, 200) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[indexnow] Network error:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Build the full list of public URLs to submit.
 * Includes: static pages, all topic pages, all blog posts.
 */
export function getAllPublicUrls(): string[] {
  // Import dynamically to avoid circular deps at module level
  const { getAllTopicSlugs } = require("@/content/topics");
  const { getAllSlugs: getAllBlogSlugs } = require("@/content/blog");

  const base = `https://${HOST}`;
  const urls: string[] = [
    base,
    `${base}/topics`,
    `${base}/sample`,
    `${base}/blog`,
    `${base}/subscribe`,
    `${base}/terms`,
    `${base}/privacy`,
  ];

  // Topic pages
  for (const slug of getAllTopicSlugs()) {
    urls.push(`${base}/topics/${slug}`);
  }

  // Blog posts
  for (const slug of getAllBlogSlugs()) {
    urls.push(`${base}/blog/${slug}`);
  }

  return urls;
}
