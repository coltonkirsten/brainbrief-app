import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/** Structured data for a single topic in a briefing */
export interface TopicBriefing {
  name: string;
  headline: string;
  bullets: string[];
  bottomLine: string;
}

/** Structured briefing data parsed from Gemini response */
export interface BriefingData {
  greeting: string;
  topics: TopicBriefing[];
}

export interface BriefingResult {
  contentHtml: string;
  contentText: string;
  topicsCovered: string[];
  sources: { title: string; uri: string }[];
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

  const topicList = topics.map((t) => `- ${t}`).join("\n");

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

  const response = await ai.models.generateContent({
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
      "[gemini] Failed to parse JSON response, falling back to raw HTML"
    );
  }

  // Generate HTML from structured data, or use raw response as-is
  const contentHtml = structured
    ? generateHtmlFromStructured(structured)
    : responseText;

  // Generate plain text
  const contentText = structured
    ? generateTextFromStructured(structured)
    : stripHtmlToText(responseText);

  return {
    contentHtml,
    contentText,
    topicsCovered: topics,
    sources,
    structured,
  };
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
  });

  text += `\nStay informed. Stay sharp. — Brain Brief`;
  return text;
}

/**
 * Strip HTML tags to produce plain text (fallback for non-structured responses).
 */
function stripHtmlToText(html: string): string {
  return html
    .replace(/<hr[^>]*>/g, "\n---\n")
    .replace(/<\/?(h[1-6]|p|div)[^>]*>/g, "\n")
    .replace(/<li[^>]*>/g, "  - ")
    .replace(/<\/li>/g, "\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "$2 ($1)")
    .replace(/<\/?strong>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Escape HTML special characters in text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
