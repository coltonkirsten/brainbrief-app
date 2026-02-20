import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    default: "Brain Brief — AI-Powered Personalized Briefings",
    template: "%s | Brain Brief",
  },
  description:
    "Get smarter about the topics you care about. AI-generated briefings delivered to your inbox.",
  metadataBase: new URL("https://brainbrief.app"),
  openGraph: {
    title: "Brain Brief — AI-Powered Personalized Briefings",
    description:
      "Get smarter about the topics you care about. AI-generated briefings delivered to your inbox.",
    url: "https://brainbrief.app",
    siteName: "Brain Brief",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Brief — AI-Powered Personalized Briefings",
    description:
      "Get smarter about the topics you care about. AI-generated briefings delivered to your inbox.",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
