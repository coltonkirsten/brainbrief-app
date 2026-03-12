import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getAllPosts, getPostBySlug, getAllSlugs } from "@/content/blog";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Generate static paths for all blog posts */
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/** Generate metadata for each blog post */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const ogImage = post.coverImage
    ? `https://www.brainbrief.app${post.coverImage}`
    : "https://www.brainbrief.app/og-image.png";

  return {
    title: `${post.title} — Brain Brief`,
    description: post.metaDescription,
    keywords: [post.keyword, "brain brief", "news briefing", "AI news"],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://www.brainbrief.app/blog/${post.slug}`,
      siteName: "Brain Brief",
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Convert markdown to HTML
  marked.setOptions({ gfm: true, breaks: false });
  const contentHtml = marked.parse(post.content) as string;

  // Get adjacent posts for navigation
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-10 -mx-6 sm:mx-0 rounded-none sm:rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
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
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold font-serif text-primary tracking-tight leading-tight">
            {post.title}
          </h1>
        </header>

        {/* Article body */}
        <article
          className="prose max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* CTA card */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold font-serif text-primary">
            Stay informed, not overwhelmed
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Brain Brief delivers a personalized 5-minute briefing on the topics
            you choose. Every morning, straight to your inbox.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-5 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
          >
            Start your 7-day free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Post navigation */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost && (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex flex-col p-5 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors"
            >
              <span className="text-xs font-medium text-muted-foreground mb-2">
                Previous
              </span>
              <span className="text-sm font-semibold font-serif text-primary group-hover:text-accent transition-colors leading-snug">
                {prevPost.title}
              </span>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex flex-col p-5 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors sm:text-right sm:col-start-2"
            >
              <span className="text-xs font-medium text-muted-foreground mb-2">
                Next
              </span>
              <span className="text-sm font-semibold font-serif text-primary group-hover:text-accent transition-colors leading-snug">
                {nextPost.title}
              </span>
            </Link>
          )}
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
