/**
 * Programmatic SEO topic definitions.
 *
 * Each topic becomes a landing page at /topics/{slug} with a daily
 * AI-generated briefing powered by Gemini + Google Search grounding.
 *
 * Categories are used for the /topics index page grid layout.
 * Keywords target specific search queries for organic discovery.
 */

export interface SEOTopic {
  slug: string;
  name: string;
  /** One-line description for meta tags and page body */
  description: string;
  /** Primary SEO keyword to target */
  keyword: string;
  /** Category for index page grouping */
  category: TopicCategory;
  /** Related topic slugs for internal linking */
  relatedSlugs?: string[];
}

export type TopicCategory =
  | "Technology & AI"
  | "Business & Finance"
  | "Science & Climate"
  | "Health & Wellness"
  | "Politics & Geopolitics"
  | "Culture & Sports"
  | "Niche & Emerging";

export const CATEGORY_ORDER: TopicCategory[] = [
  "Technology & AI",
  "Business & Finance",
  "Science & Climate",
  "Health & Wellness",
  "Politics & Geopolitics",
  "Culture & Sports",
  "Niche & Emerging",
];

export const CATEGORY_DESCRIPTIONS: Record<TopicCategory, string> = {
  "Technology & AI":
    "Stay ahead of the curve on artificial intelligence, software, cybersecurity, and the tech industry.",
  "Business & Finance":
    "Markets, startups, economic trends, and the forces shaping global commerce.",
  "Science & Climate":
    "Breakthroughs in research, space exploration, climate action, and the natural world.",
  "Health & Wellness":
    "Medical advances, mental health, nutrition science, and public health developments.",
  "Politics & Geopolitics":
    "Elections, policy shifts, international relations, and the geopolitical landscape.",
  "Culture & Sports":
    "Entertainment, sports, media trends, and the cultural conversations that matter.",
  "Niche & Emerging":
    "Deep dives into specialized topics — from programming languages to urban planning.",
};

export const topicsList: SEOTopic[] = [
  // ── Technology & AI ──────────────────────────────────────────────
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "The latest in AI research, product launches, regulation, and how machine intelligence is reshaping industries.",
    keyword: "AI news today",
    category: "Technology & AI",
    relatedSlugs: ["machine-learning", "generative-ai", "ai-regulation"],
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    description:
      "New models, training techniques, benchmarks, and real-world applications of machine learning.",
    keyword: "machine learning news",
    category: "Technology & AI",
    relatedSlugs: ["artificial-intelligence", "generative-ai", "data-science"],
  },
  {
    slug: "generative-ai",
    name: "Generative AI",
    description:
      "ChatGPT, Gemini, Claude, Midjourney, and the generative AI tools transforming how we create and work.",
    keyword: "generative AI news",
    category: "Technology & AI",
    relatedSlugs: ["artificial-intelligence", "machine-learning", "ai-regulation"],
  },
  {
    slug: "ai-regulation",
    name: "AI Regulation",
    description:
      "Government policies, safety frameworks, and the global debate over how to govern artificial intelligence.",
    keyword: "AI regulation news",
    category: "Technology & AI",
    relatedSlugs: ["artificial-intelligence", "generative-ai", "us-politics"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Data breaches, threat intelligence, zero-days, and the evolving landscape of digital security.",
    keyword: "cybersecurity news today",
    category: "Technology & AI",
    relatedSlugs: ["cloud-computing", "artificial-intelligence"],
  },
  {
    slug: "cloud-computing",
    name: "Cloud Computing",
    description:
      "AWS, Azure, GCP updates, infrastructure trends, and the shift to cloud-native architectures.",
    keyword: "cloud computing news",
    category: "Technology & AI",
    relatedSlugs: ["cybersecurity", "software-engineering"],
  },
  {
    slug: "software-engineering",
    name: "Software Engineering",
    description:
      "Developer tools, frameworks, best practices, and the craft of building great software.",
    keyword: "software engineering news",
    category: "Technology & AI",
    relatedSlugs: ["rust-programming", "web-development", "cloud-computing"],
  },
  {
    slug: "web-development",
    name: "Web Development",
    description:
      "Frontend frameworks, browser APIs, performance optimization, and the modern web platform.",
    keyword: "web development news",
    category: "Technology & AI",
    relatedSlugs: ["software-engineering", "rust-programming"],
  },
  {
    slug: "rust-programming",
    name: "Rust Programming",
    description:
      "Rust language updates, ecosystem growth, adoption stories, and systems programming trends.",
    keyword: "Rust programming news",
    category: "Technology & AI",
    relatedSlugs: ["software-engineering", "web-development"],
  },
  {
    slug: "semiconductors",
    name: "Semiconductors",
    description:
      "Chip design, fabrication advances, supply chain dynamics, and the geopolitics of semiconductor manufacturing.",
    keyword: "semiconductor industry news",
    category: "Technology & AI",
    relatedSlugs: ["artificial-intelligence", "electric-vehicles"],
  },

  // ── Business & Finance ───────────────────────────────────────────
  {
    slug: "stock-market",
    name: "Stock Market",
    description:
      "Market movements, earnings reports, analyst insights, and what's driving equities today.",
    keyword: "stock market news today",
    category: "Business & Finance",
    relatedSlugs: ["personal-finance", "cryptocurrency", "global-economy"],
  },
  {
    slug: "personal-finance",
    name: "Personal Finance",
    description:
      "Saving, investing, budgeting, credit, and practical strategies for managing your money.",
    keyword: "personal finance news",
    category: "Business & Finance",
    relatedSlugs: ["stock-market", "real-estate", "cryptocurrency"],
  },
  {
    slug: "cryptocurrency",
    name: "Cryptocurrency",
    description:
      "Bitcoin, Ethereum, DeFi, regulation, and the evolving world of digital assets and blockchain.",
    keyword: "crypto news today",
    category: "Business & Finance",
    relatedSlugs: ["stock-market", "personal-finance", "fintech"],
  },
  {
    slug: "startups",
    name: "Startups & Venture Capital",
    description:
      "Funding rounds, founder stories, accelerator news, and the startup ecosystem.",
    keyword: "startup news today",
    category: "Business & Finance",
    relatedSlugs: ["artificial-intelligence", "fintech", "global-economy"],
  },
  {
    slug: "fintech",
    name: "Fintech",
    description:
      "Digital banking, payments innovation, insurtech, and the technology transforming financial services.",
    keyword: "fintech news",
    category: "Business & Finance",
    relatedSlugs: ["cryptocurrency", "personal-finance", "startups"],
  },
  {
    slug: "global-economy",
    name: "Global Economy",
    description:
      "GDP growth, trade policy, central bank decisions, inflation, and macroeconomic trends worldwide.",
    keyword: "global economy news",
    category: "Business & Finance",
    relatedSlugs: ["stock-market", "us-politics", "china"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description:
      "Housing markets, commercial property, mortgage rates, and real estate investment trends.",
    keyword: "real estate market news",
    category: "Business & Finance",
    relatedSlugs: ["personal-finance", "global-economy", "urban-planning"],
  },
  {
    slug: "remote-work",
    name: "Remote Work",
    description:
      "Return-to-office mandates, hybrid work policies, productivity research, and the future of work.",
    keyword: "remote work news",
    category: "Business & Finance",
    relatedSlugs: ["startups", "software-engineering"],
  },

  // ── Science & Climate ────────────────────────────────────────────
  {
    slug: "climate-change",
    name: "Climate Change",
    description:
      "Global warming data, climate policy, extreme weather events, and the transition to clean energy.",
    keyword: "climate change news today",
    category: "Science & Climate",
    relatedSlugs: ["renewable-energy", "electric-vehicles", "fusion-energy"],
  },
  {
    slug: "renewable-energy",
    name: "Renewable Energy",
    description:
      "Solar, wind, battery storage, grid modernization, and the clean energy transition.",
    keyword: "renewable energy news",
    category: "Science & Climate",
    relatedSlugs: ["climate-change", "electric-vehicles", "fusion-energy"],
  },
  {
    slug: "electric-vehicles",
    name: "Electric Vehicles",
    description:
      "Tesla, EV startups, battery tech, charging infrastructure, and the shift away from combustion engines.",
    keyword: "electric vehicle news",
    category: "Science & Climate",
    relatedSlugs: ["renewable-energy", "climate-change", "semiconductors"],
  },
  {
    slug: "fusion-energy",
    name: "Fusion Energy",
    description:
      "Plasma milestones, private fusion companies, ITER updates, and the quest for limitless clean energy.",
    keyword: "fusion energy news",
    category: "Science & Climate",
    relatedSlugs: ["renewable-energy", "climate-change", "space-exploration"],
  },
  {
    slug: "space-exploration",
    name: "Space Exploration",
    description:
      "SpaceX, NASA, ESA, satellite launches, Mars missions, and humanity's expanding presence in space.",
    keyword: "space exploration news",
    category: "Science & Climate",
    relatedSlugs: ["artificial-intelligence", "fusion-energy"],
  },
  {
    slug: "biotech",
    name: "Biotechnology",
    description:
      "Gene editing, drug development, clinical trials, and the science of engineering biology.",
    keyword: "biotech news today",
    category: "Science & Climate",
    relatedSlugs: ["pharmaceuticals", "longevity", "artificial-intelligence"],
  },
  {
    slug: "quantum-computing",
    name: "Quantum Computing",
    description:
      "Qubit milestones, error correction, quantum algorithms, and the race to practical quantum advantage.",
    keyword: "quantum computing news",
    category: "Science & Climate",
    relatedSlugs: ["artificial-intelligence", "semiconductors", "cybersecurity"],
  },
  {
    slug: "ocean-science",
    name: "Ocean Science",
    description:
      "Marine biology, ocean conservation, deep-sea exploration, and the health of our oceans.",
    keyword: "ocean science news",
    category: "Science & Climate",
    relatedSlugs: ["climate-change", "renewable-energy"],
  },

  // ── Health & Wellness ────────────────────────────────────────────
  {
    slug: "mental-health",
    name: "Mental Health",
    description:
      "Therapy research, workplace wellness, anxiety and depression treatments, and destigmatization efforts.",
    keyword: "mental health news",
    category: "Health & Wellness",
    relatedSlugs: ["longevity", "nutrition-science", "remote-work"],
  },
  {
    slug: "nutrition-science",
    name: "Nutrition Science",
    description:
      "Diet research, food policy, supplements, and the science behind what we eat.",
    keyword: "nutrition science news",
    category: "Health & Wellness",
    relatedSlugs: ["mental-health", "longevity"],
  },
  {
    slug: "longevity",
    name: "Longevity & Aging",
    description:
      "Anti-aging research, healthspan science, senolytics, and the quest to extend healthy human life.",
    keyword: "longevity research news",
    category: "Health & Wellness",
    relatedSlugs: ["biotech", "mental-health", "nutrition-science"],
  },
  {
    slug: "pharmaceuticals",
    name: "Pharmaceuticals",
    description:
      "Drug approvals, clinical trials, pricing debates, and the pharmaceutical industry landscape.",
    keyword: "pharmaceutical news today",
    category: "Health & Wellness",
    relatedSlugs: ["biotech", "longevity"],
  },
  {
    slug: "fitness-science",
    name: "Fitness Science",
    description:
      "Exercise research, training methodologies, sports science, and evidence-based fitness practices.",
    keyword: "fitness science news",
    category: "Health & Wellness",
    relatedSlugs: ["nutrition-science", "mental-health", "longevity"],
  },
  {
    slug: "public-health",
    name: "Public Health",
    description:
      "Epidemiology, vaccine development, health policy, and global health challenges.",
    keyword: "public health news",
    category: "Health & Wellness",
    relatedSlugs: ["pharmaceuticals", "mental-health"],
  },

  // ── Politics & Geopolitics ───────────────────────────────────────
  {
    slug: "us-politics",
    name: "US Politics",
    description:
      "Congress, the White House, elections, policy debates, and the American political landscape.",
    keyword: "US politics news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["global-economy", "ai-regulation", "us-foreign-policy"],
  },
  {
    slug: "us-foreign-policy",
    name: "US Foreign Policy",
    description:
      "Diplomacy, sanctions, alliances, military strategy, and America's role on the world stage.",
    keyword: "US foreign policy news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-politics", "china", "middle-east"],
  },
  {
    slug: "china",
    name: "China",
    description:
      "Economic policy, tech competition, military posture, and China's growing global influence.",
    keyword: "China news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-foreign-policy", "semiconductors", "global-economy"],
  },
  {
    slug: "european-union",
    name: "European Union",
    description:
      "EU regulation, trade agreements, political shifts, and the bloc's evolving role in global affairs.",
    keyword: "European Union news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["global-economy", "ai-regulation", "climate-change"],
  },
  {
    slug: "middle-east",
    name: "Middle East",
    description:
      "Conflict, diplomacy, energy politics, and the complex dynamics shaping the Middle East.",
    keyword: "Middle East news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-foreign-policy", "global-economy"],
  },
  {
    slug: "africa",
    name: "Africa",
    description:
      "Economic growth, governance, tech innovation, and the continent's rising global significance.",
    keyword: "Africa news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["global-economy", "renewable-energy", "startups"],
  },
  {
    slug: "latin-america",
    name: "Latin America",
    description:
      "Politics, trade, migration, and the economic and social forces shaping Latin America.",
    keyword: "Latin America news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["global-economy", "us-foreign-policy"],
  },

  // ── Culture & Sports ─────────────────────────────────────────────
  {
    slug: "nfl",
    name: "NFL Football",
    description:
      "Scores, trades, draft picks, injuries, and everything happening in the National Football League.",
    keyword: "NFL news today",
    category: "Culture & Sports",
    relatedSlugs: ["nba", "fantasy-sports"],
  },
  {
    slug: "nba",
    name: "NBA Basketball",
    description:
      "Game recaps, trades, standings, player news, and the latest from the NBA.",
    keyword: "NBA news today",
    category: "Culture & Sports",
    relatedSlugs: ["nfl", "fantasy-sports"],
  },
  {
    slug: "fantasy-sports",
    name: "Fantasy Sports",
    description:
      "Start/sit advice, waiver wire picks, injury impacts, and strategy across all fantasy leagues.",
    keyword: "fantasy sports news",
    category: "Culture & Sports",
    relatedSlugs: ["nfl", "nba"],
  },
  {
    slug: "formula-1",
    name: "Formula 1",
    description:
      "Race results, team strategies, driver transfers, and the engineering drama of Formula 1.",
    keyword: "F1 news today",
    category: "Culture & Sports",
    relatedSlugs: ["electric-vehicles"],
  },
  {
    slug: "film-tv",
    name: "Film & Television",
    description:
      "Box office, streaming wars, production news, and the shows and movies shaping pop culture.",
    keyword: "movie and TV news",
    category: "Culture & Sports",
    relatedSlugs: ["gaming", "music-industry"],
  },
  {
    slug: "gaming",
    name: "Gaming",
    description:
      "Game releases, industry trends, esports, hardware launches, and gaming culture.",
    keyword: "gaming news today",
    category: "Culture & Sports",
    relatedSlugs: ["film-tv", "artificial-intelligence"],
  },
  {
    slug: "music-industry",
    name: "Music Industry",
    description:
      "Album releases, streaming data, touring news, and the business of music.",
    keyword: "music industry news",
    category: "Culture & Sports",
    relatedSlugs: ["film-tv"],
  },

  // ── Niche & Emerging ─────────────────────────────────────────────
  {
    slug: "urban-planning",
    name: "Urban Planning",
    description:
      "City design, zoning reform, public transit, housing policy, and the future of how we build cities.",
    keyword: "urban planning news",
    category: "Niche & Emerging",
    relatedSlugs: ["real-estate", "climate-change", "electric-vehicles"],
  },
  {
    slug: "data-science",
    name: "Data Science",
    description:
      "Analytics tools, statistical methods, data engineering, and the practice of extracting insight from data.",
    keyword: "data science news",
    category: "Niche & Emerging",
    relatedSlugs: ["machine-learning", "artificial-intelligence", "software-engineering"],
  },
  {
    slug: "robotics",
    name: "Robotics",
    description:
      "Industrial automation, humanoid robots, autonomous systems, and the robotics industry.",
    keyword: "robotics news today",
    category: "Niche & Emerging",
    relatedSlugs: ["artificial-intelligence", "semiconductors", "electric-vehicles"],
  },
  {
    slug: "3d-printing",
    name: "3D Printing",
    description:
      "Additive manufacturing breakthroughs, new materials, industrial applications, and desktop 3D printing.",
    keyword: "3D printing news",
    category: "Niche & Emerging",
    relatedSlugs: ["robotics", "space-exploration"],
  },
  {
    slug: "podcasting",
    name: "Podcasting",
    description:
      "Podcast industry trends, platform moves, monetization, and the evolving audio landscape.",
    keyword: "podcasting industry news",
    category: "Niche & Emerging",
    relatedSlugs: ["music-industry", "film-tv"],
  },
  {
    slug: "nuclear-energy",
    name: "Nuclear Energy",
    description:
      "Reactor technology, SMRs, nuclear policy, waste management, and the nuclear renaissance.",
    keyword: "nuclear energy news",
    category: "Niche & Emerging",
    relatedSlugs: ["fusion-energy", "renewable-energy", "climate-change"],
  },
  {
    slug: "creator-economy",
    name: "Creator Economy",
    description:
      "YouTube, TikTok, Substack, monetization tools, and the business of being an independent creator.",
    keyword: "creator economy news",
    category: "Niche & Emerging",
    relatedSlugs: ["podcasting", "music-industry", "remote-work"],
  },
  {
    slug: "supply-chain",
    name: "Supply Chain & Logistics",
    description:
      "Shipping disruptions, warehouse automation, trade routes, and global supply chain resilience.",
    keyword: "supply chain news",
    category: "Niche & Emerging",
    relatedSlugs: ["global-economy", "semiconductors", "robotics"],
  },
  {
    slug: "edtech",
    name: "Education Technology",
    description:
      "Online learning platforms, AI in education, university disruption, and the future of how we learn.",
    keyword: "edtech news",
    category: "Niche & Emerging",
    relatedSlugs: ["artificial-intelligence", "remote-work", "creator-economy"],
  },
  {
    slug: "autonomous-vehicles",
    name: "Autonomous Vehicles",
    description:
      "Self-driving cars, robotaxis, ADAS technology, and the road to full vehicle autonomy.",
    keyword: "self-driving car news",
    category: "Niche & Emerging",
    relatedSlugs: ["electric-vehicles", "artificial-intelligence", "robotics"],
  },
];

// ── Helper functions ────────────────────────────────────────────────

export function getAllTopics(): SEOTopic[] {
  return topicsList;
}

export function getTopicBySlug(slug: string): SEOTopic | undefined {
  return topicsList.find((t) => t.slug === slug);
}

export function getAllTopicSlugs(): string[] {
  return topicsList.map((t) => t.slug);
}

export function getTopicsByCategory(category: TopicCategory): SEOTopic[] {
  return topicsList.filter((t) => t.category === category);
}

export function getRelatedTopics(slug: string): SEOTopic[] {
  const topic = getTopicBySlug(slug);
  if (!topic?.relatedSlugs) return [];
  return topic.relatedSlugs
    .map((s) => getTopicBySlug(s))
    .filter((t): t is SEOTopic => t !== undefined);
}
