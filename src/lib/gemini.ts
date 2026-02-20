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
  const name = displayName || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topicList = topics.map((t) => `- ${t}`).join("\n");

  const prompt = `You are Brain Brief, an AI news briefing assistant. Generate a personalized news briefing for today (${today}).

The user's topics:
${topicList}

Requirements:
- Start with: "Good morning, ${name}! Here's your Brain Brief for ${today}."
- For EACH topic, create a section with:
  - A clear headline for the topic
  - 2-4 bullet points covering the most important recent developments
  - A brief 1-2 sentence synthesis paragraph putting the developments in context
- End with: "Stay informed. Stay sharp. — Brain Brief"
- Be concise, accurate, and focused on the most recent news (last 24-48 hours)
- Cite sources when possible (include the publication name)
- No fluff — every sentence should be informative
- Use a professional but approachable tone

Format your response as clean HTML suitable for an email. Use these HTML elements:
- <h1> for the greeting
- <h2> for topic section headers
- <ul><li> for bullet points
- <p> for synthesis paragraphs and sign-off
- <strong> for emphasis on key facts
- <a href="..."> for source links when available
- Do NOT include <html>, <head>, <body>, or <style> tags — just the content HTML

Keep the total briefing under 800 words.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const contentHtml = response.text ?? "";

  // Strip HTML tags for plain text version
  const contentText = contentHtml
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
  const sources = (
    (groundingMetadata as Record<string, unknown>)?.groundingChunks as Array<{
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
