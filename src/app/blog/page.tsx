import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { getAllPosts } from "@/content/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Brain Brief",
  description:
    "Ideas on staying informed without the noise. Essays on information overload, intentional reading, and building a smarter news diet.",
  openGraph: {
    title: "Blog — Brain Brief",
    description:
      "Ideas on staying informed without the noise. Essays on information overload, intentional reading, and building a smarter news diet.",
    url: "https://www.brainbrief.app/blog",
    siteName: "Brain Brief",
    type: "website",
    images: [
      {
        url: "https://www.brainbrief.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brain Brief Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Brain Brief",
    description:
      "Ideas on staying informed without the noise. Essays on information overload, intentional reading, and building a smarter news diet.",
    images: ["https://www.brainbrief.app/og-image.png"],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  // ItemList JSON-LD — helps Google understand the blog collection
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Brain Brief Blog",
    description:
      "Ideas on staying informed without the noise. Essays on information overload, intentional reading, and building a smarter news diet.",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.brainbrief.app/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight font-serif text-primary"
        >
          Brain<span className="text-accent">Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-32">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-primary tracking-tight">
            The Brain Brief Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Ideas on staying informed without the noise. Essays on information
            overload, intentional reading, and building a smarter news diet.
          </p>
        </div>

        {/* Post list */}
        <div className="space-y-0 divide-y divide-border">
          {posts.map((post) => (
            <article key={post.slug} className="py-8 first:pt-0 group">
              <Link href={`/blog/${post.slug}`} className="block sm:flex sm:gap-6">
                {post.coverImage && (
                  <div className="flex-shrink-0 mb-4 sm:mb-0 rounded-xl overflow-hidden sm:w-48 sm:h-28">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={384}
                      height={224}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="text-border">/</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime} min read
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-primary group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-2">
                    {post.metaDescription}
                  </p>

                  <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold font-serif text-primary">
            Ready to fix your information diet?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Brain Brief delivers a daily 5-minute briefing on exactly the topics
            you care about. No noise, no filler, no algorithm.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-6 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
          >
            Start your 7-day free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-serif font-bold text-primary">
            Brain<span className="text-accent">Brief</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
