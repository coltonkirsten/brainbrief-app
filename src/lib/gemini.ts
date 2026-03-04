import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}


/** A source link extracted from Gemini grounding metadata */
export interface SourceLink {
  title: string;
  uri: string;
}

/** Structured data for a single topic in a briefing */
export interface TopicBriefing {
  name: string;
  headline: string;
  bullets: string[];
  bottomLine: string;
  /** Per-bullet source links: bulletSources[i] = sources for bullets[i] */
  bulletSources?: SourceLink[][];
  /** Legacy: flat per-topic sources (used when groundingSupports unavailable) */
  sources?: SourceLink[];
}

/** Structured briefing data parsed from Gemini response */
export interface BriefingData {
  greeting: string;
  topics: TopicBriefing[];
  sources?: SourceLink[]; // Any sources not matched to a specific topic
}

export interface BriefingResult {
  contentHtml: string;
  contentText: string;
  topicsCovered: string[];
  sources: SourceLink[];
  structured?: BriefingData;
  /** Whether Gemini invoked Google Search grounding for this response */
  grounded: boolean;
}

/**
 * Generate a personalized news briefing for a user's topics using
 * Gemini with Google Search grounding for real-time web data.
 *
 * Architecture (v2 — per-topic parallel generation):
 * - Each topic gets its own Gemini API call with focused Google Search
 * - Calls run in parallel via Promise.allSettled() for speed
 * - Per-topic grounding prevents source recycling across unrelated topics
 * - Ungrounded bullets are stripped post-generation (Fix D)
 * - Anti-hallucination prompt rules + low temperature (0.2) for accuracy
 */

/** Return a time-appropriate greeting based on the user's timezone. */
function getTimeGreeting(timezone?: string | null): string {
  try {
    const hour = new Date().toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone || "America/New_York",
    });
    const h = parseInt(hour, 10);
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    return "Good evening";
  } catch {
    // Invalid timezone string — fall back to neutral
    return "Good morning";
  }
}

export async function generateBriefing(
  topics: string[],
  displayName?: string | null,
  timezone?: string | null
): Promise<BriefingResult> {
  const name = displayName?.trim() || null;
  const timeGreeting = getTimeGreeting(timezone);
  const greeting = name ? `${timeGreeting}, ${name}!` : `${timeGreeting}!`;

  // Use user's timezone for accurate date context (fixes wrong-day bug for PST users)
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone || "America/New_York",
  });

  // Sanitize topic names: strip control chars, limit length, prevent prompt injection
  const sanitizedTopics = topics.map((t) =>
    t.replace(/[\x00-\x1f\x7f]/g, "").trim().substring(0, 100)
  );

  // Fix A: Generate each topic in parallel with separate API calls.
  // Each topic gets its own focused Google Search queries, preventing
  // source recycling and improving coverage for niche topics.
  console.log(`[gemini] Generating ${sanitizedTopics.length} topics in parallel...`);
  const results = await Promise.allSettled(
    sanitizedTopics.map((topic) => generateSingleTopic(topic, today, timezone))
  );

  // Collect results
  const topicBriefings: TopicBriefing[] = [];
  const allSources: SourceLink[] = [];
  let anyGrounded = false;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      topicBriefings.push(result.value.topic);
      allSources.push(...result.value.sources);
      if (result.value.grounded) anyGrounded = true;
    } else {
      // Topic generation failed entirely — add graceful fallback
      console.error(`[gemini] Topic "${sanitizedTopics[i]}" failed:`, result.reason);
      topicBriefings.push({
        name: sanitizedTopics[i],
        headline: sanitizedTopics[i],
        bullets: [
          "We couldn\u2019t retrieve the latest developments for this topic. It will be covered in your next briefing.",
        ],
        bottomLine: "",
        bulletSources: [[]],
      });
    }
  }

  // If ALL topics had limited/no coverage, mark entire briefing as ungrounded
  if (topicBriefings.every((t) => t.headline.includes("Limited Recent Coverage"))) {
    anyGrounded = false;
  }

  const structured: BriefingData = {
    greeting,
    topics: topicBriefings,
  };

  const contentHtml = generateHtmlFromStructured(structured);
  const contentText = generateTextFromStructured(structured);

  return {
    contentHtml,
    contentText,
    topicsCovered: topics,
    sources: allSources,
    structured,
    grounded: anyGrounded,
  };
}

// ---------- Per-Topic Generation (Fix A) ----------

interface SingleTopicResult {
  topic: TopicBriefing;
  sources: SourceLink[];
  grounded: boolean;
}

/**
 * Generate a briefing for a single topic with its own Gemini API call.
 * Each topic gets focused Google Search queries, preventing source
 * recycling across unrelated topics.
 */
async function generateSingleTopic(
  topicName: string,
  today: string,
  timezone?: string | null
): Promise<SingleTopicResult> {
  const MAX_ATTEMPTS = 2;

  // Per-topic prompt with strong anti-hallucination rules (Fix B)
  const prompt = `You are Brain Brief \u2014 a sharp, well-read intelligence analyst delivering a focused briefing on one topic.

Today is ${today} (${timezone || "America/New_York"} timezone). Search the web for the latest news about this specific topic from the past 24-48 hours.

Topic: ${topicName}

CRITICAL RULES \u2014 YOU MUST FOLLOW THESE:
- ONLY report on events, companies, people, and developments that appear in the Google Search results you receive
- NEVER fabricate or invent company names, product names, people, organizations, or events
- NEVER create fictional entities even if they sound plausible
- Every specific claim (names, funding amounts, percentages, dates, statistics) MUST come directly from the search results
- If the search results contain limited recent news for this topic, be honest: write "Recent coverage was limited" and provide only what the search actually returned
- Do NOT fill gaps in coverage with invented information
- Do NOT attribute information to sources that don\u2019t contain it
- Every company, organization, and person you mention MUST appear in the search results

FORMAT \u2014 write exactly this:
## ${topicName}: [Specific newsworthy headline taken directly from search results]
- First key development from the search results. What happened (with specific dates, names, numbers from the sources), why it matters, and what to watch. 2-3 sentences.
- Second key development from the search results. Same depth. 2-3 sentences.
- Third key development if the search results contain one. 2-3 sentences.
**The Bottom Line:** 1-2 sentences connecting the dots \u2014 the bigger picture for a busy professional.

If search results are thin, write fewer bullets rather than inventing content. One well-sourced bullet is better than three fabricated ones.

Write in a confident, editorial voice. Aim for 120-160 words. Be substantive but accurate \u2014 every fact must trace back to a search result.`;

  let responseText = "";
  let chunks: SourceLink[] = [];
  let supports: GroundingSupport[] = [];
  let grounded = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await getGeminiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Fix C: low temperature for factual accuracy
      },
    });

    // Extract text (response.text can throw on filtered content)
    try {
      responseText = response.text ?? "";
    } catch {
      const parts = response.candidates?.[0]?.content?.parts;
      responseText =
        parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
    }

    if (!responseText) {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`[gemini] Topic "${topicName}" attempt ${attempt}: empty response, retrying...`);
        continue;
      }
      return {
        topic: buildLimitedCoverageTopic(topicName),
        sources: [],
        grounded: false,
      };
    }

    // Extract grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    chunks =
      groundingMetadata?.groundingChunks
        ?.filter((chunk) => chunk.web?.uri)
        .map((chunk) => ({
          title: chunk.web!.title ?? "Source",
          uri: chunk.web!.uri!,
        })) ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supports = (groundingMetadata as any)?.groundingSupports ?? [];

    console.log(
      `[gemini] Topic "${topicName}" attempt ${attempt}: ${chunks.length} chunks, ${supports.length} supports`
    );

    if (chunks.length > 0) {
      grounded = true;
      break;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.warn(
        `[gemini] Topic "${topicName}" attempt ${attempt}: 0 chunks, retrying...`
      );
    }
  }

  // No grounding after retries — return limited coverage
  if (!grounded) {
    console.warn(`[gemini] Topic "${topicName}": no grounding after ${MAX_ATTEMPTS} attempts`);
    return {
      topic: buildLimitedCoverageTopic(topicName),
      sources: [],
      grounded: false,
    };
  }

  // Parse response into TopicBriefing
  const parsed = tryParseStructuredFromMarkdown(responseText, "");
  let topic: TopicBriefing;

  if (parsed && parsed.topics.length > 0) {
    topic = parsed.topics[0];
    topic.name = topicName; // Ensure consistent topic name
  } else {
    // Couldn't parse structured data — use raw text as fallback
    const cleanText = responseText.replace(/^##.*\n?/m, "").trim();
    topic = {
      name: topicName,
      headline: topicName,
      bullets: cleanText ? [cleanText.substring(0, 500)] : ["No details available."],
      bottomLine: "",
    };
  }

  // Fix D: Validate grounding — strip bullets with zero grounding supports
  if (supports.length > 0) {
    topic = validateAndStripUngrounded(topic, responseText, chunks, supports);
    const sourceCounts = (topic.bulletSources ?? []).map((bs) => bs.length);
    console.log(`[gemini] Topic "${topicName}" after validation: ${topic.bullets.length} bullets, sources: [${sourceCounts.join(",")}]`);
  } else if (chunks.length > 0) {
    // Have chunks but no supports — use keyword matching as fallback
    const tempData: BriefingData = { greeting: "", topics: [topic] };
    matchSourcesToTopics(chunks, tempData);
    topic = tempData.topics[0];
    console.log(`[gemini] Topic "${topicName}": keyword-matched sources (no supports available)`);
  }

  return { topic, sources: chunks, grounded: true };
}

// ---------- Grounding Validation (Fix D) ----------

/**
 * Validate each bullet's grounding coverage and strip ungrounded bullets.
 * If a bullet has zero overlapping groundingSupports, it's likely hallucinated
 * and gets removed. Also maps per-bullet source citations.
 */
function validateAndStripUngrounded(
  topic: TopicBriefing,
  responseText: string,
  chunks: SourceLink[],
  supports: GroundingSupport[]
): TopicBriefing {
  const textLower = responseText.toLowerCase();
  const validBullets: string[] = [];
  const validBulletSources: SourceLink[][] = [];

  for (const bullet of topic.bullets) {
    // Find this bullet's position in the response text
    const bulletLower = bullet.toLowerCase().substring(0, 60);
    let bulletStart = textLower.indexOf(bulletLower);

    if (bulletStart === -1) {
      // Try shorter prefix
      const shortPrefix = bullet.toLowerCase().substring(0, 30);
      bulletStart = textLower.indexOf(shortPrefix);
    }

    if (bulletStart === -1) {
      // Bullet not found in response at all — likely a parsing artifact, skip
      console.log(`[gemini] Stripping bullet (not found in response): "${bullet.substring(0, 60)}..."`);
      continue;
    }

    const bulletEnd = bulletStart + bullet.length + 20; // slack for minor text differences
    const matched = collectSourcesForRange(bulletStart, bulletEnd, chunks, supports);
    const dedupedSources = dedup(matched);

    if (dedupedSources.length === 0) {
      // Zero grounding supports — likely hallucinated, strip it
      console.log(`[gemini] Stripping ungrounded bullet for "${topic.name}": "${bullet.substring(0, 60)}..."`);
      continue;
    }

    validBullets.push(bullet);
    validBulletSources.push(dedupedSources);
  }

  // If all bullets were stripped, return limited coverage fallback
  if (validBullets.length === 0) {
    console.warn(`[gemini] All bullets stripped for "${topic.name}" \u2014 using limited coverage fallback`);
    return buildLimitedCoverageTopic(topic.name);
  }

  return {
    ...topic,
    bullets: validBullets,
    bulletSources: validBulletSources,
  };
}

/** Build a "limited coverage" fallback for a topic with no verified news */
function buildLimitedCoverageTopic(topicName: string): TopicBriefing {
  return {
    name: topicName,
    headline: `${topicName}: Limited Recent Coverage`,
    bullets: [
      "No significant verified developments were found in search results for the past 24\u201348 hours. This topic will be covered in depth when breaking news emerges.",
    ],
    bottomLine: "",
    bulletSources: [[]],
  };
}

// ---------- Grounding Support Types ----------

interface GroundingSupport {
  segment?: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

/**
 * Collect source links from groundingSupports whose segments overlap
 * with the given character range [rangeStart, rangeEnd].
 */
function collectSourcesForRange(
  rangeStart: number,
  rangeEnd: number,
  chunks: SourceLink[],
  supports: GroundingSupport[]
): SourceLink[] {
  const sources: SourceLink[] = [];

  for (const support of supports) {
    const segStart = support.segment?.startIndex ?? 0;
    const segEnd = support.segment?.endIndex ?? 0;

    // Check if this support segment overlaps with our bullet range
    if (segEnd > rangeStart && segStart < rangeEnd) {
      // This support covers our bullet — collect its source chunks
      for (const idx of support.groundingChunkIndices ?? []) {
        if (idx >= 0 && idx < chunks.length) {
          sources.push(chunks[idx]);
        }
      }
    }
  }

  return sources;
}

/** Deduplicate source links by URI, limit to 3 per bullet */
function dedup(sources: SourceLink[]): SourceLink[] {
  const seen = new Set<string>();
  const result: SourceLink[] = [];
  for (const s of sources) {
    const key = s.uri.toLowerCase().replace(/\/+$/, "");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(s);
    }
    if (result.length >= 3) break;
  }
  return result;
}

// ---------- Parsing ----------

/**
 * Try to extract structured BriefingData from markdown-formatted text.
 * Expected format:
 *   ## Topic Name: Headline
 *   - Bullet 1
 *   - Bullet 2
 *   **The Bottom Line:** Synthesis sentence.
 */
function tryParseStructuredFromMarkdown(
  markdown: string,
  defaultGreeting: string
): BriefingData | undefined {
  try {
    const sections = markdown.split(/^##\s+/m).filter((s) => s.trim());
    if (sections.length === 0) return undefined;

    let greetingText = defaultGreeting;
    let topicSections = sections;

    // First section before any ## might contain greeting/intro
    const firstSection = sections[0].trim();
    if (
      firstSection.length < 200 &&
      !firstSection.includes("- ") &&
      !firstSection.includes("* ")
    ) {
      const firstLine = firstSection.split("\n")[0].trim();
      if (firstLine.length > 0 && firstLine.length < 100) {
        greetingText = firstLine.replace(/^#+\s*/, "").replace(/\*\*/g, "");
      }
      topicSections = sections.slice(1);
    }

    if (topicSections.length === 0) return undefined;

    const topics: TopicBriefing[] = topicSections
      .map((section) => {
        const lines = section.split("\n").filter((l) => l.trim());
        if (lines.length === 0) return null;

        // First line: "Topic Name: Headline" or just "Headline"
        const rawHeadline = lines[0].trim().replace(/\*\*/g, "");

        // Split "Topic Name: Headline" format
        let topicName = rawHeadline;
        let headline = rawHeadline;
        const colonIdx = rawHeadline.indexOf(": ");
        if (colonIdx > 0 && colonIdx < 60) {
          topicName = rawHeadline.substring(0, colonIdx).trim();
          headline = rawHeadline.substring(colonIdx + 2).trim() || rawHeadline;
        }

        const bullets: string[] = [];
        let bottomLine = "";

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();

          if (/\*?\*?the bottom line\*?\*?:?/i.test(line)) {
            const blContent = line
              .replace(/\*?\*?the bottom line\*?\*?:?\s*/i, "")
              .trim();
            if (blContent) {
              bottomLine = blContent.replace(/\*\*/g, "").replace(/\*/g, "");
            } else if (i + 1 < lines.length) {
              bottomLine = lines[i + 1]
                .trim()
                .replace(/\*\*/g, "")
                .replace(/\*/g, "");
            }
            break;
          }

          if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            const bulletText = line
              .replace(/^[-*•]\s+/, "")
              .replace(/^\d+\.\s+/, "")
              .replace(/\*\*/g, "")
              .trim();
            if (bulletText) bullets.push(bulletText);
          }
        }

        if (bullets.length === 0) return null;

        return { name: topicName, headline, bullets, bottomLine };
      })
      .filter((t): t is TopicBriefing => t !== null);

    if (topics.length === 0) return undefined;

    return { greeting: greetingText, topics };
  } catch {
    return undefined;
  }
}

/**
 * Fallback: try to parse as JSON (in case Gemini returns JSON despite
 * our plain text instruction).
 */
function tryParseJson(
  responseText: string,
  defaultGreeting: string
): BriefingData | undefined {
  try {
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);
    if (parsed.topics && Array.isArray(parsed.topics)) {
      return {
        greeting: parsed.greeting || defaultGreeting,
        topics: parsed.topics.map(
          (t: {
            name?: string;
            headline?: string;
            bullets?: string[];
            bottomLine?: string;
            bottom_line?: string;
          }) => ({
            name: t.name || "Latest Updates",
            headline: t.headline || t.name || "Latest Updates",
            bullets: Array.isArray(t.bullets) ? t.bullets : [],
            bottomLine: t.bottomLine || t.bottom_line || "",
          })
        ),
      };
    }
  } catch {
    // Not valid JSON — that's fine, we wanted plain text
  }
  return undefined;
}

// ---------- Legacy Keyword Matching (fallback) ----------

/**
 * Fallback: match sources to topics using keyword overlap.
 * Used when groundingSupports is not available.
 */
function matchSourcesToTopics(
  sources: SourceLink[],
  data: BriefingData
): void {
  const seen = new Set<string>();
  const uniqueSources = sources.filter((s) => {
    const key = s.uri.toLowerCase().replace(/\/+$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const topicTexts = data.topics.map((topic) =>
    [topic.name, topic.headline, ...topic.bullets, topic.bottomLine]
      .join(" ")
      .toLowerCase()
  );

  const stopwords = new Set([
    "the", "and", "for", "that", "this", "with", "from", "are", "was",
    "has", "have", "had", "been", "will", "but", "not", "its", "may",
    "more", "also", "than", "into", "about", "could", "would", "after",
    "new", "said", "while", "which", "their", "they", "these", "other",
    "over", "most", "some",
  ]);

  const topicKeywords = topicTexts.map((text) => {
    const words = text.match(/[a-z]{3,}/g) || [];
    return words.filter((w) => !stopwords.has(w));
  });

  for (const topic of data.topics) {
    topic.sources = [];
  }

  const unmatchedSources: SourceLink[] = [];

  for (const source of uniqueSources) {
    const sourceText = `${source.title} ${source.uri}`.toLowerCase();
    const sourceWords = new Set(
      (sourceText.match(/[a-z]{3,}/g) || []).filter(
        (w) =>
          !["com", "www", "https", "html", "htm", "php", "org", "net", "news"].includes(w)
      )
    );

    let bestTopicIdx = -1;
    let bestScore = 0;

    topicKeywords.forEach((keywords, idx) => {
      let score = 0;
      for (const word of keywords) {
        if (sourceWords.has(word)) score += word.length;
      }
      for (const word of sourceWords) {
        if (topicTexts[idx].includes(word) && word.length >= 4)
          score += word.length * 0.5;
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopicIdx = idx;
      }
    });

    if (bestTopicIdx >= 0 && bestScore >= 6) {
      data.topics[bestTopicIdx].sources!.push(source);
    } else {
      unmatchedSources.push(source);
    }
  }

  for (const topic of data.topics) {
    if (topic.sources && topic.sources.length > 3) {
      const extras = topic.sources.splice(3);
      unmatchedSources.push(...extras);
    }
  }

  if (unmatchedSources.length > 0) {
    data.sources = unmatchedSources;
  }
}

// ---------- HTML Generation ----------

/**
 * Generate inner HTML from structured data.
 * Used for DB storage and dashboard display.
 * Includes per-bullet source citations when available.
 */
function generateHtmlFromStructured(data: BriefingData): string {
  let html = `<p>${escapeHtml(data.greeting)} Here's what's happening in the topics you care about.</p>\n`;

  data.topics.forEach((topic, i) => {
    if (i > 0) {
      html += `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">\n`;
    }
    html += `<h2>${escapeHtml(topic.headline)}</h2>\n`;
    html += `<ul>\n`;
    topic.bullets.forEach((bullet, bi) => {
      const bulletSourceList = topic.bulletSources?.[bi] ?? [];
      if (bulletSourceList.length > 0) {
        // Inline citations after the bullet text
        const citations = bulletSourceList
          .map(
            (s) =>
              `<a href="${escapeHtml(s.uri)}" target="_blank" rel="noopener" style="color: #10b981; text-decoration: none; font-size: 0.85em;">${escapeHtml(cleanDomain(s.title))}</a>`
          )
          .join(", ");
        html += `  <li>${escapeHtml(bullet)} <span style="color: #94a3b8;">[${citations}]</span></li>\n`;
      } else {
        html += `  <li>${escapeHtml(bullet)}</li>\n`;
      }
    });
    html += `</ul>\n`;
    if (topic.bottomLine) {
      html += `<p><em><strong>The Bottom Line:</strong> ${escapeHtml(topic.bottomLine)}</em></p>\n`;
    }
    // Legacy per-topic sources (when bulletSources unavailable)
    if (!topic.bulletSources && topic.sources && topic.sources.length > 0) {
      html += `<p style="font-size: 0.85em; color: #64748b; margin-top: 8px;"><strong>Read more:</strong> `;
      html += topic.sources
        .map(
          (s) =>
            `<a href="${escapeHtml(s.uri)}" target="_blank" rel="noopener" style="color: #10b981; text-decoration: underline;">${escapeHtml(cleanDomain(s.title))}</a>`
        )
        .join(" · ");
      html += `</p>\n`;
    }
  });

  html += `<p>Stay informed. Stay sharp. \u2014 Brain Brief</p>`;
  return html;
}

/**
 * Generate plain text version from structured data.
 */
function generateTextFromStructured(data: BriefingData): string {
  let text = `${data.greeting} Here's what's happening in the topics you care about.\n\n`;

  data.topics.forEach((topic, i) => {
    if (i > 0) text += `\n---\n\n`;
    text += `${topic.headline}\n\n`;
    topic.bullets.forEach((bullet, bi) => {
      const bulletSourceList = topic.bulletSources?.[bi] ?? [];
      if (bulletSourceList.length > 0) {
        const citations = bulletSourceList.map((s) => cleanDomain(s.title)).join(", ");
        text += `  \u2022 ${bullet} [${citations}]\n`;
      } else {
        text += `  \u2022 ${bullet}\n`;
      }
    });
    if (topic.bottomLine) {
      text += `\nThe Bottom Line: ${topic.bottomLine}\n`;
    }
    // Legacy per-topic sources
    if (!topic.bulletSources && topic.sources && topic.sources.length > 0) {
      text += `\nRead more:\n`;
      topic.sources.forEach((s) => {
        text += `  \u2192 ${cleanDomain(s.title)}: ${s.uri}\n`;
      });
    }
  });

  text += `\nStay informed. Stay sharp. \u2014 Brain Brief`;
  return text;
}

// ---------- Utilities ----------

/**
 * Convert markdown to clean HTML using the `marked` parser.
 * Fallback when structured parsing fails.
 */
function convertMarkdownToHtml(markdown: string): string {
  try {
    marked.setOptions({ gfm: true, breaks: true });
    const html = marked.parse(markdown);
    if (typeof html === "string") return html;
    return markdown;
  } catch (err) {
    console.error("[gemini] Markdown conversion failed:", err);
    return markdown
      .split("\n\n")
      .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }
}

/**
 * Strip markdown formatting to produce plain text (for text email version).
 */
function stripMarkdownToText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*]\s+/gm, "  \u2022 ")
    .replace(/^\d+\.\s+/gm, "  \u2022 ")
    .replace(/---+/g, "---")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Map of known domains to proper display names */
const DOMAIN_NAMES: Record<string, string> = {
  "theguardian.com": "The Guardian",
  "nytimes.com": "NY Times",
  "washingtonpost.com": "Washington Post",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "cnn.com": "CNN",
  "reuters.com": "Reuters",
  "apnews.com": "AP News",
  "techcrunch.com": "TechCrunch",
  "theverge.com": "The Verge",
  "arstechnica.com": "Ars Technica",
  "wired.com": "Wired",
  "bloomberg.com": "Bloomberg",
  "ft.com": "Financial Times",
  "wsj.com": "Wall Street Journal",
  "cnbc.com": "CNBC",
  "cio.com": "CIO",
  "zdnet.com": "ZDNet",
  "infoworld.com": "InfoWorld",
  "networkworld.com": "Network World",
  "eff.org": "EFF",
  "nature.com": "Nature",
  "science.org": "Science",
  "sciencedaily.com": "ScienceDaily",
  "space.com": "Space.com",
  "formula1.com": "Formula 1",
  "motorsport.com": "Motorsport",
  "autosport.com": "Autosport",
  "racingnews365.com": "RacingNews365",
  "espn.com": "ESPN",
  "aljazeera.com": "Al Jazeera",
  "npr.org": "NPR",
  "politico.com": "Politico",
  "thehill.com": "The Hill",
  "axios.com": "Axios",
  "engadget.com": "Engadget",
  "technologyreview.com": "MIT Tech Review",
  "venturebeat.com": "VentureBeat",
};

/** Clean a domain-style title for display (e.g., "theguardian.com" → "The Guardian") */
function cleanDomain(title: string): string {
  const stripped = title.replace(/^www\./, "").toLowerCase();

  // Check known domain mapping first
  if (DOMAIN_NAMES[stripped]) return DOMAIN_NAMES[stripped];

  // Remove common TLDs and capitalize
  let clean = title
    .replace(/^www\./, "")
    .replace(/\.(com|org|net|co\.uk|io)$/i, "");
  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean || title;
}

/**
 * Generate a short teaser about a topic for win-back emails (Day 10).
 * Uses Gemini with Google Search grounding to find recent developments.
 */
export async function generateTeaser(topic: string): Promise<string> {
  const fallback = `Developments continue in ${topic}. Significant updates and new information have emerged since your last briefing.`;

  try {
    const prompt = `You are Brain Brief. We need a 1-2 sentence teaser about the topic "${topic}" to win back a user whose trial expired.

Using Google Search grounding, find a recent, notable development in this topic.
Write 1-2 sentences in a concrete, editorial voice.
Example: "Meanwhile, Apple announced a new AI chip, while Google's latest model is likely to shift the landscape."
Do NOT say "Here is a teaser" or include any markdown fences or quotes. JUST the 1-2 sentences.`;

    const response = await getGeminiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    let responseText: string;
    try {
      responseText = response.text ?? "";
    } catch {
      const parts = response.candidates?.[0]?.content?.parts;
      responseText =
        parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
    }

    return responseText.trim() || fallback;
  } catch (err) {
    console.error("[gemini] Error generating teaser:", err);
    return fallback;
  }
}

/** Escape HTML special characters in text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
