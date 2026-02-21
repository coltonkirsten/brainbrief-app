import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://brainbrief.app"),
  openGraph: {
    title: "Brain Brief — Your intelligent daily briefing",
    description:
      "The antidote to information overload. Get smarter about the topics you care about, delivered directly to your inbox.",
    url: "https://brainbrief.app",
    siteName: "Brain Brief",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Brief — Your intelligent daily briefing",
    description:
      "The antidote to information overload. Get smarter about the topics you care about.",
  },
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
      </body>
    </html>
  );
}
