"use client";

import Script from "next/script";

/**
 * X (Twitter) Ads base pixel.
 *
 * Loads the Universal Website Tag (uwt.js) and initializes with the pixel ID
 * from the NEXT_PUBLIC_X_PIXEL_ID environment variable.
 *
 * This must be rendered globally (in root layout) for conversion events to work.
 * If the env var is not set, nothing is rendered — safe to deploy before config.
 */
export function XPixel() {
  const pixelId = process.env.NEXT_PUBLIC_X_PIXEL_ID;

  if (!pixelId) return null;

  return (
    <Script
      id="x-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','${pixelId}');
        `.trim(),
      }}
    />
  );
}
