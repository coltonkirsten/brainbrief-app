import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface BriefingResult {
  contentHtml: string;
  contentText: string;
  topicsCovered: string[];
  sources: { title: string; uri: string }[];
}

/**
 * Generate a personalized news briefing for a user's topics using
 * Gemini with Google Search grounding for real-time web data.
 */
export async function generateBriefing(
  topics: string[],
  displayName?: string | null
): Promise<BriefingResult> {
  const name = displayName?.trim() || null;
  const greeting = name
    ? `Good morning, ${name}!`
    : `Good morning!`;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topicList = topics.map((t) => `- ${t}`).join("\n");

  const prompt = `You are Brain Brief — a smart, well-read friend who stays on top of the news so your reader doesn't have to. Your job: give a concise, grounded briefing on the topics below using REAL, CURRENT information from the web.

Date: ${today}
${name ? `Reader's name: ${name}` : "Reader: (no name provided — just say \"Good morning!\")"}
Topics to cover:
${topicList}

VOICE & TONE:
- Clear, confident, slightly conversational — like a sharp colleague giving you the 2-minute download
- Not robotic, not overly formal, not breathless or hype-y
- Every sentence earns its place — no filler, no padding, no throat-clearing

STRUCTURE (follow exactly):
1. Opening line: "${greeting} Here's what's happening in the topics you care about."
2. For EACH topic, write:
   - A bold, specific headline (not just the topic name — make it about the news)
   - 2-4 bullet points of KEY recent developments (include dates, names, numbers — be specific)
   - A 1-2 sentence "Why it matters" synthesis — connect the dots, give perspective
3. If there's genuinely NOTHING new on a topic in the last 48 hours, say so briefly: "It's been a quiet couple of days for [topic]. We'll have more when things pick up." Do NOT make up or pad content.
4. Sign-off: "Stay informed. Stay sharp. — Brain Brief"

GROUNDING RULES:
- Use ONLY real, current information from your web search
- Include the source publication name in parentheses after key claims, e.g. "(Reuters)"
- If you can link to the source, include an <a> tag
- Prefer reputable sources: Reuters, AP, Bloomberg, NYT, WSJ, TechCrunch, The Verge, etc.
- NEVER hallucinate facts, quotes, or statistics

HTML FORMAT (email-safe, no external styles):
- <h2> for topic section headlines
- <ul><li> for bullet points
- <p> for the "why it matters" synthesis, opening, and sign-off
- <strong> for emphasis on key facts, names, or numbers
- <a href="..." style="color: #6366f1;"> for source links
- Add <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"> between topic sections
- Do NOT include <html>, <head>, <body>, or <style> tags — just the inner content HTML

LENGTH: Keep the total briefing under 800 words. Concise > comprehensive.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  // response.text can throw if content was filtered or empty
  let contentHtml: string;
  try {
    contentHtml = response.text ?? "";
  } catch {
    // Fallback: try to extract text from candidates directly
    const parts = response.candidates?.[0]?.content?.parts;
    contentHtml = parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
  }

  if (!contentHtml) {
    throw new Error("Gemini returned no content — response may have been filtered");
  }

  // Strip HTML tags for plain text version
  const contentText = contentHtml
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

  return {
    contentHtml,
    contentText,
    topicsCovered: topics,
    sources,
  };
}
