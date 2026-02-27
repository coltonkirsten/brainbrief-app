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
 * Uses plain text output (not JSON) to maximize grounding metadata
 * quality — Gemini's groundingSupports maps character ranges to
 * specific source chunks, enabling per-bullet citations.
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
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sanitize topic names: strip control chars, limit length, prevent prompt injection
  const sanitizedTopics = topics.map((t) =>
    t.replace(/[\x00-\x1f\x7f]/g, "").trim().substring(0, 100)
  );
  const topicList = sanitizedTopics.map((t) => `- ${t}`).join("\n");

  // Plain text output — NOT JSON — so grounding metadata maps correctly
  // to individual sentences/bullets in the response.
  const prompt = `You are Brain Brief — a sharp colleague who gives the 2-minute download on what matters today, ${today}. Concise, grounded in today's news, zero filler.

Search the web for the latest news on each topic below. What happened in the last 24-48 hours?

${name ? `Reader's name: ${name}` : `Reader: (no name provided — just say "${timeGreeting}!")`}
Topics:
${topicList}

RULES:
- Search the web for EACH topic to find the latest developments.
- Every bullet must cite a real, current news event from the last 48 hours.
- Include specific dates, names, numbers, and sources. No vague generalities.
- Every sentence earns its place. Cut ruthlessly. Think executive briefing, not blog post.

FOR EACH TOPIC write exactly this format:
## [Topic Name]: [Specific newsworthy headline from the last 48 hours]
- First key development with exact date, specific names, and numbers. One sentence.
- Second key development with specifics. One sentence.
- Optional third bullet if warranted. One sentence.
**The Bottom Line:** One sentence connecting the dots — why it matters.

Keep it under 400 words total. No filler, no background — only real-time news.`;

  // Call Gemini with retry — if grounding returns 0 chunks, retry up to
  // MAX_ATTEMPTS times. Gemini intermittently skips Google Search grounding.
  const MAX_ATTEMPTS = 3;
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
      },
    });

    // Extract text from response (response.text can throw on filtered content)
    try {
      responseText = response.text ?? "";
    } catch {
      const parts = response.candidates?.[0]?.content?.parts;
      responseText =
        parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
    }

    if (!responseText) {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`[gemini] Attempt ${attempt}: empty response, retrying...`);
        continue;
      }
      throw new Error(
        "Gemini returned no content — response may have been filtered"
      );
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
      `[gemini] Attempt ${attempt}: ${chunks.length} chunks, ${supports.length} supports`
    );

    // If we got grounding data, use this response
    if (chunks.length > 0) {
      grounded = true;
      break;
    }

    // If no grounding, retry with a delay
    if (attempt < MAX_ATTEMPTS) {
      console.warn(
        `[gemini] Attempt ${attempt}: 0 grounding chunks — retrying for better grounding...`
      );
    }
  }

  if (!grounded) {
    console.error(
      `[gemini] WARNING: ${MAX_ATTEMPTS} attempts all returned 0 grounding chunks. Content may be unverified.`
    );
  }

  // Parse plain text response into structured data
  let structured = tryParseStructuredFromMarkdown(responseText, greeting);

  // Fallback: try parsing as JSON in case Gemini ignored the plain text instruction
  if (!structured) {
    structured = tryParseJson(responseText, greeting);
  }

  if (!structured) {
    console.warn("[gemini] Could not parse structured data from response");
  }

  // Map grounding supports to per-bullet sources
  if (structured && chunks.length > 0 && supports.length > 0) {
    mapSupportsToStructured(responseText, structured, chunks, supports);
    const bulletSourceCounts = structured.topics.map(
      (t) => `${t.name}: ${(t.bulletSources ?? []).map((bs) => bs.length).join(",")}`
    );
    console.log(`[gemini] Per-bullet sources: ${bulletSourceCounts.join(" | ")}`);
  } else if (structured && chunks.length > 0) {
    // Fallback: use keyword matching when no groundingSupports available
    matchSourcesToTopics(chunks, structured);
    console.log(
      `[gemini] Keyword-matched ${chunks.length} sources (no groundingSupports)`
    );
  }

  // Generate HTML from structured data, or convert markdown to HTML
  let contentHtml = structured
    ? generateHtmlFromStructured(structured)
    : convertMarkdownToHtml(responseText);

  // Generate plain text
  let contentText = structured
    ? generateTextFromStructured(structured)
    : stripMarkdownToText(responseText);

  // Add disclaimer if grounding failed — content may be hallucinated
  if (!grounded) {
    const disclaimer = `<p style="font-size: 0.85em; color: #94a3b8; margin-top: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background-color: #f8fafc;"><em>Note: This briefing could not be verified with live sources. Information may not reflect the latest developments. <a href="https://www.brainbrief.app/dashboard" style="color: #10b981;">Generate a new briefing</a> to try again.</em></p>`;
    contentHtml += disclaimer;
    contentText += `\n\nNote: This briefing could not be verified with live sources. Information may not reflect the latest developments.`;
  }

  return {
    contentHtml,
    contentText,
    topicsCovered: topics,
    sources: chunks,
    structured,
    grounded,
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

// ---------- Grounding → Per-Bullet Mapping ----------

/**
 * Map groundingSupports to individual bullets in the structured data.
 *
 * Strategy: each groundingSupport covers a character range in the response.
 * We find where each bullet's text appears in the response, then collect
 * the source chunks whose support segments overlap with that bullet.
 */
function mapSupportsToStructured(
  responseText: string,
  data: BriefingData,
  chunks: SourceLink[],
  supports: GroundingSupport[]
): void {
  const textLower = responseText.toLowerCase();

  for (const topic of data.topics) {
    topic.bulletSources = [];

    for (const bullet of topic.bullets) {
      // Find this bullet's position in the response text
      const bulletLower = bullet.toLowerCase().substring(0, 60); // Use prefix for matching
      const bulletStart = textLower.indexOf(bulletLower);

      if (bulletStart === -1) {
        // Bullet not found verbatim — try fuzzy: match first 30 chars
        const shortPrefix = bullet.toLowerCase().substring(0, 30);
        const altStart = textLower.indexOf(shortPrefix);
        if (altStart === -1) {
          topic.bulletSources.push([]);
          continue;
        }
        // Use the alt match position
        const bulletEnd = altStart + bullet.length + 20; // allow some slack
        const matched = collectSourcesForRange(altStart, bulletEnd, chunks, supports);
        topic.bulletSources.push(dedup(matched));
        continue;
      }

      const bulletEnd = bulletStart + bullet.length + 20; // allow some slack
      const matched = collectSourcesForRange(bulletStart, bulletEnd, chunks, supports);
      topic.bulletSources.push(dedup(matched));
    }
  }
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

  html += `<p>Stay informed. Stay sharp. — Brain Brief</p>`;
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
        text += `  • ${bullet} [${citations}]\n`;
      } else {
        text += `  • ${bullet}\n`;
      }
    });
    if (topic.bottomLine) {
      text += `\nThe Bottom Line: ${topic.bottomLine}\n`;
    }
    // Legacy per-topic sources
    if (!topic.bulletSources && topic.sources && topic.sources.length > 0) {
      text += `\nRead more:\n`;
      topic.sources.forEach((s) => {
        text += `  → ${cleanDomain(s.title)}: ${s.uri}\n`;
      });
    }
  });

  text += `\nStay informed. Stay sharp. — Brain Brief`;
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
    .replace(/^[-*]\s+/gm, "  • ")
    .replace(/^\d+\.\s+/gm, "  • ")
    .replace(/---+/g, "---")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Clean a domain-style title for display (e.g., "reuters.com" → "Reuters") */
function cleanDomain(title: string): string {
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
