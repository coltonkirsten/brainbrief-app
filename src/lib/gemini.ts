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
}

/**
 * Generate a personalized news briefing for a user's topics using
 * Gemini with Google Search grounding for real-time web data.
 *
 * Returns structured data (for email templating) + HTML/text fallbacks.
 */
export async function generateBriefing(
  topics: string[],
  displayName?: string | null
): Promise<BriefingResult> {
  const name = displayName?.trim() || null;
  const greeting = name ? `Good morning, ${name}!` : `Good morning!`;
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

  const prompt = `You are Brain Brief — a smart, well-read friend who stays on top of the news so your reader doesn't have to. Your job: give a concise, grounded briefing on the topics below using REAL, CURRENT information from the web.

Date: ${today}
${name ? `Reader's name: ${name}` : 'Reader: (no name provided — just say "Good morning!")'}
Topics to cover:
${topicList}

VOICE & TONE:
- Clear, confident, slightly conversational — like a sharp colleague giving you the 2-minute download
- Not robotic, not overly formal, not breathless or hype-y
- Every sentence earns its place — no filler, no padding, no throat-clearing

STRUCTURE:
For EACH topic, provide:
1. The topic name exactly as given above
2. A bold, specific headline (not just the topic name — make it about the actual news)
3. 2-4 bullet points of KEY recent developments (include dates, names, numbers — be specific). Include source publication names in parentheses, e.g. "(Reuters)"
4. A 1-2 sentence "The Bottom Line" synthesis — connect the dots, give perspective

If there's genuinely NOTHING new on a topic in the last 48 hours, still include it but note it in the headline and provide a brief status update.

GROUNDING RULES:
- Use ONLY real, current information from your web search
- Include the source publication name in parentheses after key claims
- Prefer reputable sources: Reuters, AP, Bloomberg, NYT, WSJ, TechCrunch, The Verge, etc.
- NEVER hallucinate facts, quotes, or statistics

OUTPUT FORMAT:
Respond with ONLY valid JSON (no markdown fences, no extra text before or after) matching this exact structure:

{
  "greeting": "${greeting}",
  "topics": [
    {
      "name": "Topic Name",
      "headline": "A specific, newsworthy headline about this topic",
      "bullets": [
        "Key development with specific details (Source Name)",
        "Another key development (Source Name)"
      ],
      "bottomLine": "1-2 sentence synthesis explaining why this matters and what to watch for."
    }
  ]
}

IMPORTANT:
- Output ONLY the JSON object. No markdown fences, no explanation, no extra text.
- Keep each topic concise: 2-4 bullets, each bullet 1-2 sentences max.
- Keep the total briefing under 800 words.`;

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  // Extract text from response (response.text can throw on filtered content)
  let responseText: string;
  try {
    responseText = response.text ?? "";
  } catch {
    const parts = response.candidates?.[0]?.content?.parts;
    responseText =
      parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
  }

  if (!responseText) {
    throw new Error(
      "Gemini returned no content — response may have been filtered"
    );
  }

  // Extract sources from grounding metadata
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const sources =
    (
      (groundingMetadata as Record<string, unknown>)
        ?.groundingChunks as Array<{
        web?: { title: string; uri: string };
      }>
    )
      ?.filter((chunk) => chunk.web)
      .map((chunk) => ({
        title: chunk.web!.title,
        uri: chunk.web!.uri,
      })) ?? [];

  // Try to parse structured JSON from Gemini's response
  let structured: BriefingData | undefined;
  try {
    let jsonText = responseText.trim();

    // Strip markdown code fences if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);
    if (parsed.topics && Array.isArray(parsed.topics)) {
      structured = {
        greeting: parsed.greeting || greeting,
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
    console.warn(
      "[gemini] Failed to parse JSON response, trying to extract structured data from markdown"
    );

    // Secondary fallback: try to extract structured data from markdown response
    // Gemini sometimes returns markdown with our expected structure (headlines, bullets, bottom line)
    structured = tryParseStructuredFromMarkdown(responseText, greeting);
    if (structured) {
      console.log("[gemini] Successfully extracted structured data from markdown");
    } else {
      console.warn("[gemini] Could not extract structured data, converting markdown to HTML");
    }
  }

  // Match grounding sources to specific topics
  if (structured && sources.length > 0) {
    matchSourcesToTopics(sources, structured);
    console.log(
      `[gemini] Matched ${sources.length} sources across ${structured.topics.length} topics:`,
      structured.topics.map((t) => `${t.name}: ${t.sources?.length ?? 0} sources`).join(", "),
      structured.sources?.length ? `+ ${structured.sources.length} unmatched` : ""
    );
  }

  // Generate HTML from structured data, or convert markdown to HTML
  const contentHtml = structured
    ? generateHtmlFromStructured(structured)
    : convertMarkdownToHtml(responseText);

  // Generate plain text
  const contentText = structured
    ? generateTextFromStructured(structured)
    : stripMarkdownToText(responseText);

  return {
    contentHtml,
    contentText,
    topicsCovered: topics,
    sources,
    structured,
  };
}

/**
 * Match grounding sources to specific topics using keyword overlap.
 * Sources are assigned to the topic whose content (headline, bullets, bottomLine)
 * has the most keyword overlap with the source title.
 * Unmatched sources go to data.sources as a catch-all.
 */
function matchSourcesToTopics(
  sources: SourceLink[],
  data: BriefingData
): void {
  // Deduplicate sources by URI (Gemini sometimes returns duplicates)
  const seen = new Set<string>();
  const uniqueSources = sources.filter((s) => {
    const key = s.uri.toLowerCase().replace(/\/+$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Build searchable text blobs per topic
  const topicTexts = data.topics.map((topic) =>
    [topic.name, topic.headline, ...topic.bullets, topic.bottomLine]
      .join(" ")
      .toLowerCase()
  );

  // Extract meaningful words (3+ chars) from each topic
  const topicKeywords = topicTexts.map((text) => {
    const words = text.match(/[a-z]{3,}/g) || [];
    // Remove very common words
    const stopwords = new Set([
      "the", "and", "for", "that", "this", "with", "from", "are", "was",
      "has", "have", "had", "been", "will", "but", "not", "its", "may",
      "more", "also", "than", "into", "about", "could", "would", "after",
      "new", "said", "while", "which", "their", "they", "these", "other",
      "over", "most", "some",
    ]);
    return words.filter((w) => !stopwords.has(w));
  });

  // Initialize per-topic source arrays
  for (const topic of data.topics) {
    topic.sources = [];
  }

  const unmatchedSources: SourceLink[] = [];

  for (const source of uniqueSources) {
    const sourceText = `${source.title} ${source.uri}`.toLowerCase();
    const sourceWords = new Set(
      (sourceText.match(/[a-z]{3,}/g) || []).filter(
        (w) => !["com", "www", "https", "html", "htm", "php", "org", "net", "news"].includes(w)
      )
    );

    // Score each topic by how many of its keywords appear in the source
    let bestTopicIdx = -1;
    let bestScore = 0;

    topicKeywords.forEach((keywords, idx) => {
      let score = 0;
      for (const word of keywords) {
        if (sourceWords.has(word)) {
          score += word.length; // Longer matching words = stronger signal
        }
      }
      // Also check if source words appear in topic text
      for (const word of sourceWords) {
        if (topicTexts[idx].includes(word) && word.length >= 4) {
          score += word.length * 0.5;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopicIdx = idx;
      }
    });

    // Require a minimum relevance score to match
    if (bestTopicIdx >= 0 && bestScore >= 6) {
      data.topics[bestTopicIdx].sources!.push(source);
    } else {
      unmatchedSources.push(source);
    }
  }

  // Cap sources per topic to 3 (keep most relevant, move extras to unmatched)
  for (const topic of data.topics) {
    if (topic.sources && topic.sources.length > 3) {
      const extras = topic.sources.splice(3);
      unmatchedSources.push(...extras);
    }
  }

  // Store unmatched sources at the data level
  if (unmatchedSources.length > 0) {
    data.sources = unmatchedSources;
  }
}

/**
 * Generate simple inner HTML from structured data.
 * Used for DB storage and dashboard display.
 */
function generateHtmlFromStructured(data: BriefingData): string {
  let html = `<p>${escapeHtml(data.greeting)} Here's what's happening in the topics you care about.</p>\n`;

  data.topics.forEach((topic, i) => {
    if (i > 0) {
      html += `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">\n`;
    }
    html += `<h2>${escapeHtml(topic.headline)}</h2>\n`;
    html += `<ul>\n`;
    topic.bullets.forEach((bullet) => {
      html += `  <li>${escapeHtml(bullet)}</li>\n`;
    });
    html += `</ul>\n`;
    if (topic.bottomLine) {
      html += `<p><em><strong>The Bottom Line:</strong> ${escapeHtml(topic.bottomLine)}</em></p>\n`;
    }
    // Source links per topic
    if (topic.sources && topic.sources.length > 0) {
      html += `<p style="font-size: 0.85em; color: #64748b; margin-top: 8px;"><strong>Read more:</strong> `;
      html += topic.sources
        .map((s) => `<a href="${escapeHtml(s.uri)}" target="_blank" rel="noopener" style="color: #10b981; text-decoration: underline;">${escapeHtml(s.title)}</a>`)
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
    topic.bullets.forEach((bullet) => {
      text += `  • ${bullet}\n`;
    });
    if (topic.bottomLine) {
      text += `\nThe Bottom Line: ${topic.bottomLine}\n`;
    }
    // Source links per topic
    if (topic.sources && topic.sources.length > 0) {
      text += `\nRead more:\n`;
      topic.sources.forEach((s) => {
        text += `  → ${s.title}: ${s.uri}\n`;
      });
    }
  });

  text += `\nStay informed. Stay sharp. — Brain Brief`;
  return text;
}


/**
 * Convert markdown to clean HTML using the `marked` parser.
 * This handles the case where Gemini returns markdown instead of JSON.
 */
function convertMarkdownToHtml(markdown: string): string {
  try {
    // Configure marked for clean output
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

    const html = marked.parse(markdown);
    if (typeof html === "string") {
      return html;
    }
    // marked.parse can return a Promise if async is enabled — shouldn't happen with our config
    return markdown;
  } catch (err) {
    console.error("[gemini] Markdown conversion failed:", err);
    // Ultimate fallback: wrap in basic HTML paragraphs
    return markdown
      .split("\n\n")
      .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }
}

/**
 * Try to extract structured BriefingData from markdown-formatted text.
 * Gemini sometimes returns the right structure in markdown form instead of JSON:
 * - ## Topic headlines
 * - Bullet lists
 * - **The Bottom Line:** paragraphs
 */
function tryParseStructuredFromMarkdown(
  markdown: string,
  defaultGreeting: string
): BriefingData | undefined {
  try {
    // Split by h2/## headers to find topic sections
    const sections = markdown.split(/^##\s+/m).filter((s) => s.trim());

    if (sections.length === 0) return undefined;

    // First section before any ## might contain greeting
    let greetingText = defaultGreeting;
    let topicSections = sections;

    // Check if first section looks like a greeting (no bullets, short)
    const firstSection = sections[0].trim();
    if (
      firstSection.length < 200 &&
      !firstSection.includes("- ") &&
      !firstSection.includes("* ")
    ) {
      // This might be a greeting/intro paragraph
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

        // First line is the headline (was after ##)
        const headline = lines[0].trim().replace(/\*\*/g, "");

        // Extract bullets (lines starting with - or * or numbered)
        const bullets: string[] = [];
        let bottomLine = "";

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();

          // Check for "The Bottom Line" or "Bottom Line"
          if (/\*?\*?the bottom line\*?\*?:?/i.test(line)) {
            // The bottom line content might be on this line or the next
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

          // Bullet points
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

        // Derive topic name from headline (strip specifics)
        const name = headline;

        return { name, headline, bullets, bottomLine };
      })
      .filter((t): t is TopicBriefing => t !== null);

    if (topics.length === 0) return undefined;

    return { greeting: greetingText, topics };
  } catch {
    return undefined;
  }
}

/**
 * Strip markdown formatting to produce plain text (for text email version).
 */
function stripMarkdownToText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "") // Remove heading markers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/^[-*]\s+/gm, "  • ") // Bullet points
    .replace(/^\d+\.\s+/gm, "  • ") // Numbered lists
    .replace(/---+/g, "---") // Horizontal rules
    .replace(/\n{3,}/g, "\n\n") // Collapse extra newlines
    .trim();
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
