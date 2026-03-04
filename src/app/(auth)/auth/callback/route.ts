import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Handles the Supabase auth callback after email confirmation (PKCE flow).
 *
 * Flow: user clicks confirmation email → Supabase verifies token →
 * redirects here with ?code=AUTH_CODE → we exchange code for session →
 * user is auto-signed-in and redirected to dashboard (no password re-entry).
 *
 * Cookie handling: creates Supabase client inline (not via shared createClient)
 * to ensure auth cookies are set directly on the redirect response.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect — only allow relative paths on our own origin
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    // Create Supabase client inline — this ensures cookies are set properly
    // on the response, even when we return a NextResponse.redirect().
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use x-forwarded-host for Vercel deployments (handles custom domains)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";

      let redirectBase: string;
      if (isLocal) {
        redirectBase = origin;
      } else if (forwardedHost) {
        redirectBase = `https://${forwardedHost}`;
      } else {
        redirectBase = origin;
      }

      console.log(`[auth/callback] Session established, redirecting to ${next}`);
      return NextResponse.redirect(`${redirectBase}${next}`);
    }

    // Code exchange failed — log the error for debugging
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  } else {
    console.warn("[auth/callback] No code parameter in callback URL");
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
