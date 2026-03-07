import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { XPixel } from "@/components/x-pixel";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Brain Brief — Your intelligent daily briefing",
    template: "%s | Brain Brief",
  },
  description:
    "The antidote to information overload. Get smarter about the topics you care about, delivered directly to your inbox.",
  metadataBase: new URL("https://www.brainbrief.app"),
  alternates: {
    canonical: "https://www.brainbrief.app",
  },
  openGraph: {
    title: "Brain Brief — Your intelligent daily briefing",
    description:
      "The antidote to information overload. Get smarter about the topics you care about, delivered directly to your inbox.",
    url: "https://www.brainbrief.app",
    siteName: "Brain Brief",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.brainbrief.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brain Brief — Your intelligent daily briefing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Brief — Your intelligent daily briefing",
    description:
      "The antidote to information overload. Get smarter about the topics you care about.",
    images: ["https://www.brainbrief.app/og-image.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${merriweather.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Analytics />
        <XPixel />
      </body>
    </html>
  );
}
