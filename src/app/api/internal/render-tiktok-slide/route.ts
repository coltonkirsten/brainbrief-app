/**
 * Internal-only TikTok slide render endpoint.
 *
 * Renders an HTML string to a PNG via headless Chromium (puppeteer-core +
 * @sparticuz/chromium on Vercel's serverless runtime).
 *
 * - Auth: Bearer ${INTERNAL_API_SECRET}
 * - Body:    { html: string, width?: number, height?: number, deviceScaleFactor?: number }
 * - Returns: { ok: true, png: <base64>, width, height, deviceScaleFactor } on success
 *
 * Designed to be called from a local caller script that does template
 * substitution locally, posts the final HTML, and writes the returned PNG to
 * disk. Keeps the rendering concern (Chromium-as-a-service) cleanly isolated
 * from content concerns (template files Chelsea/Em iterate on).
 *
 * Defaults match Chelsea's production templates: 1080×1920 viewport at 2× DPR.
 */

import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 60;
// Avoid Vercel cold-start auto-static optimization for this route.
export const dynamic = "force-dynamic";

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;
const DEFAULT_DPR = 2;
const MAX_HTML_BYTES = 200 * 1024; // 200KB hard cap on inbound HTML

interface RenderBody {
  html?: unknown;
  width?: unknown;
  height?: unknown;
  deviceScaleFactor?: unknown;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function clampDpr(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(3, n));
}

export async function POST(request: NextRequest) {
  // ---- Auth ----------------------------------------------------------------
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "INTERNAL_API_SECRET not configured" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // ---- Parse body ----------------------------------------------------------
  let body: RenderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON body" },
      { status: 400 }
    );
  }

  const html = typeof body.html === "string" ? body.html : "";
  if (!html) {
    return NextResponse.json(
      { ok: false, error: "missing 'html' string" },
      { status: 400 }
    );
  }
  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    return NextResponse.json(
      { ok: false, error: `html exceeds ${MAX_HTML_BYTES} bytes` },
      { status: 413 }
    );
  }

  const width = clampInt(body.width, 320, 2160, DEFAULT_WIDTH);
  const height = clampInt(body.height, 320, 4096, DEFAULT_HEIGHT);
  const deviceScaleFactor = clampDpr(body.deviceScaleFactor, DEFAULT_DPR);

  // ---- Render --------------------------------------------------------------
  let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;
  const startedAt = Date.now();
  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width, height, deviceScaleFactor },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor });

    // setContent waits for network/DOM to settle so Google Fonts (Inter,
    // Playfair Display) used by Chelsea's templates load before the screenshot.
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });

    // Belt-and-suspenders: explicitly wait for fonts to be ready in case
    // networkidle0 fires before fonts apply.
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const screenshot = await page.screenshot({
      type: "png",
      omitBackground: false,
      fullPage: false,
      clip: { x: 0, y: 0, width, height },
    });

    const pngBase64 = Buffer.from(screenshot).toString("base64");
    const elapsedMs = Date.now() - startedAt;

    return NextResponse.json({
      ok: true,
      png: pngBase64,
      width,
      height,
      deviceScaleFactor,
      bytes: screenshot.length,
      elapsedMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "render failed";
    console.error("[render-tiktok-slide] error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  } finally {
    try {
      if (browser) await browser.close();
    } catch {
      /* swallow */
    }
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method not allowed; use POST" },
    { status: 405 }
  );
}
