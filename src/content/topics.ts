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

  // ── Expansion Wave 2 (Apr 2026) ──────────────────────────────────

  // Technology & AI
  {
    slug: "open-source-ai",
    name: "Open Source AI",
    description:
      "Open-weight models, community-driven AI projects, licensing debates, and the open-source AI ecosystem.",
    keyword: "open source AI news",
    category: "Technology & AI",
    relatedSlugs: ["artificial-intelligence", "generative-ai", "software-engineering"],
  },
  {
    slug: "dev-tools",
    name: "Developer Tools",
    description:
      "IDEs, CI/CD platforms, AI coding assistants, and the tools shaping modern software development.",
    keyword: "developer tools news",
    category: "Technology & AI",
    relatedSlugs: ["software-engineering", "web-development", "generative-ai"],
  },
  {
    slug: "apple",
    name: "Apple",
    description:
      "iPhone, Mac, Vision Pro, Apple Intelligence, and everything from the world's most valuable company.",
    keyword: "Apple news today",
    category: "Technology & AI",
    relatedSlugs: ["semiconductors", "generative-ai", "artificial-intelligence"],
  },
  {
    slug: "privacy-surveillance",
    name: "Privacy & Surveillance",
    description:
      "Data privacy laws, surveillance technology, encryption battles, and the fight for digital rights.",
    keyword: "digital privacy news",
    category: "Technology & AI",
    relatedSlugs: ["cybersecurity", "ai-regulation", "us-politics"],
  },

  // Business & Finance
  {
    slug: "venture-capital",
    name: "Venture Capital",
    description:
      "Funding rounds, VC trends, valuations, and the investors shaping the startup landscape.",
    keyword: "venture capital news",
    category: "Business & Finance",
    relatedSlugs: ["startups", "fintech", "generative-ai"],
  },
  {
    slug: "commercial-real-estate",
    name: "Commercial Real Estate",
    description:
      "Office markets, retail spaces, industrial logistics, REITs, and the post-pandemic CRE landscape.",
    keyword: "commercial real estate news",
    category: "Business & Finance",
    relatedSlugs: ["real-estate", "global-economy", "remote-work"],
  },
  {
    slug: "private-equity",
    name: "Private Equity",
    description:
      "Buyouts, portfolio companies, fundraising, and how PE firms are reshaping industries.",
    keyword: "private equity news",
    category: "Business & Finance",
    relatedSlugs: ["venture-capital", "stock-market", "global-economy"],
  },
  {
    slug: "ecommerce",
    name: "E-Commerce",
    description:
      "Online retail trends, marketplace dynamics, fulfillment innovation, and the future of shopping.",
    keyword: "ecommerce news",
    category: "Business & Finance",
    relatedSlugs: ["supply-chain", "fintech", "creator-economy"],
  },
  {
    slug: "insurance-industry",
    name: "Insurance Industry",
    description:
      "Insurtech, underwriting automation, climate risk pricing, and the evolving insurance landscape.",
    keyword: "insurance industry news",
    category: "Business & Finance",
    relatedSlugs: ["fintech", "climate-change", "artificial-intelligence"],
  },

  // Science & Climate
  {
    slug: "crispr-gene-editing",
    name: "CRISPR & Gene Editing",
    description:
      "CRISPR therapies, gene drives, regulatory approvals, and the cutting edge of genetic engineering.",
    keyword: "CRISPR gene editing news",
    category: "Science & Climate",
    relatedSlugs: ["biotech", "pharmaceuticals", "longevity"],
  },
  {
    slug: "battery-technology",
    name: "Battery Technology",
    description:
      "Solid-state batteries, grid storage, EV battery breakthroughs, and the energy storage revolution.",
    keyword: "battery technology news",
    category: "Science & Climate",
    relatedSlugs: ["electric-vehicles", "renewable-energy", "semiconductors"],
  },
  {
    slug: "carbon-capture",
    name: "Carbon Capture",
    description:
      "Direct air capture, carbon credits, sequestration technology, and the business of removing CO₂.",
    keyword: "carbon capture news",
    category: "Science & Climate",
    relatedSlugs: ["climate-change", "renewable-energy", "nuclear-energy"],
  },
  {
    slug: "astronomy",
    name: "Astronomy",
    description:
      "Telescope discoveries, exoplanets, cosmology breakthroughs, and our evolving view of the universe.",
    keyword: "astronomy news today",
    category: "Science & Climate",
    relatedSlugs: ["space-exploration", "quantum-computing", "ocean-science"],
  },
  {
    slug: "weather-climate-extremes",
    name: "Extreme Weather",
    description:
      "Hurricanes, heat waves, wildfires, flooding, and how climate change is fueling extreme weather events.",
    keyword: "extreme weather news",
    category: "Science & Climate",
    relatedSlugs: ["climate-change", "renewable-energy", "public-health"],
  },
  {
    slug: "renewable-energy-policy",
    name: "Renewable Energy Policy",
    description:
      "Tax credits, grid interconnection, permitting reform, and the policies accelerating clean energy.",
    keyword: "renewable energy policy news",
    category: "Science & Climate",
    relatedSlugs: ["renewable-energy", "nuclear-energy", "us-politics"],
  },

  // Health & Wellness
  {
    slug: "womens-health",
    name: "Women's Health",
    description:
      "Reproductive health research, menopause science, maternal care, and the women's health investment boom.",
    keyword: "women's health news",
    category: "Health & Wellness",
    relatedSlugs: ["public-health", "biotech", "pharmaceuticals"],
  },
  {
    slug: "sleep-science",
    name: "Sleep Science",
    description:
      "Sleep research, circadian biology, sleep tech, and the science of why rest matters more than you think.",
    keyword: "sleep science news",
    category: "Health & Wellness",
    relatedSlugs: ["mental-health", "fitness-science", "longevity"],
  },
  {
    slug: "psychedelics-therapy",
    name: "Psychedelics & Therapy",
    description:
      "Psilocybin, MDMA-assisted therapy, clinical trials, and the regulated psychedelic medicine movement.",
    keyword: "psychedelic therapy news",
    category: "Health & Wellness",
    relatedSlugs: ["mental-health", "pharmaceuticals", "biotech"],
  },
  {
    slug: "healthcare-policy",
    name: "Healthcare Policy",
    description:
      "Drug pricing, insurance reform, hospital systems, and the policy battles shaping healthcare access.",
    keyword: "healthcare policy news",
    category: "Health & Wellness",
    relatedSlugs: ["public-health", "pharmaceuticals", "us-politics"],
  },

  // Politics & Geopolitics
  {
    slug: "india",
    name: "India",
    description:
      "Economic growth, tech industry expansion, geopolitics, and India's rising influence on the world stage.",
    keyword: "India news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["china", "global-economy", "semiconductors"],
  },
  {
    slug: "southeast-asia",
    name: "Southeast Asia",
    description:
      "ASEAN economies, trade corridors, tech ecosystems, and geopolitical dynamics across Southeast Asia.",
    keyword: "Southeast Asia news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["china", "global-economy", "supply-chain"],
  },
  {
    slug: "us-economy",
    name: "US Economy",
    description:
      "Fed decisions, employment data, inflation, GDP, and the economic indicators that move markets.",
    keyword: "US economy news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["stock-market", "global-economy", "us-politics"],
  },
  {
    slug: "local-government",
    name: "Local Government",
    description:
      "City councils, zoning reform, municipal budgets, and the local policy decisions that shape daily life.",
    keyword: "local government news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-politics", "urban-planning", "real-estate"],
  },
  {
    slug: "trade-policy",
    name: "Trade Policy",
    description:
      "Tariffs, trade agreements, sanctions, and the economic diplomacy reshaping global commerce.",
    keyword: "trade policy news",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-foreign-policy", "china", "global-economy"],
  },
  {
    slug: "defense-military",
    name: "Defense & Military",
    description:
      "Defense contracts, military technology, NATO, and the geopolitics of global security.",
    keyword: "defense news today",
    category: "Politics & Geopolitics",
    relatedSlugs: ["us-foreign-policy", "middle-east", "cybersecurity"],
  },

  // Culture & Sports
  {
    slug: "soccer",
    name: "Soccer / Football",
    description:
      "Premier League, Champions League, MLS, transfer news, and the global game's biggest stories.",
    keyword: "soccer news today",
    category: "Culture & Sports",
    relatedSlugs: ["nba", "nfl", "fantasy-sports"],
  },
  {
    slug: "mlb",
    name: "MLB Baseball",
    description:
      "Scores, trades, analytics, prospect rankings, and everything Major League Baseball.",
    keyword: "MLB news today",
    category: "Culture & Sports",
    relatedSlugs: ["nba", "nfl", "fantasy-sports"],
  },
  {
    slug: "formula-e",
    name: "Formula E",
    description:
      "Electric racing results, team standings, technology developments, and the future of motorsport.",
    keyword: "Formula E news",
    category: "Culture & Sports",
    relatedSlugs: ["formula-1", "electric-vehicles", "battery-technology"],
  },
  {
    slug: "book-publishing",
    name: "Book Publishing",
    description:
      "Bestseller lists, publishing industry shifts, author news, and the evolving world of books.",
    keyword: "book publishing news",
    category: "Culture & Sports",
    relatedSlugs: ["film-tv", "creator-economy", "generative-ai"],
  },
  {
    slug: "anime-manga",
    name: "Anime & Manga",
    description:
      "New releases, adaptations, industry trends, and the global anime and manga phenomenon.",
    keyword: "anime news today",
    category: "Culture & Sports",
    relatedSlugs: ["gaming", "film-tv", "music-industry"],
  },
  {
    slug: "true-crime",
    name: "True Crime",
    description:
      "Major cases, cold case breakthroughs, forensic science, and the true crime stories captivating the public.",
    keyword: "true crime news",
    category: "Culture & Sports",
    relatedSlugs: ["podcasting", "film-tv", "us-politics"],
  },
  {
    slug: "food-beverage",
    name: "Food & Beverage",
    description:
      "Restaurant trends, food science, CPG brands, and the business of what we eat and drink.",
    keyword: "food industry news",
    category: "Culture & Sports",
    relatedSlugs: ["nutrition-science", "ecommerce", "supply-chain"],
  },

  // Niche & Emerging
  {
    slug: "indie-game-dev",
    name: "Indie Game Development",
    description:
      "Indie releases, game jams, tools like Godot and Unity, and the creators building games outside AAA studios.",
    keyword: "indie game dev news",
    category: "Niche & Emerging",
    relatedSlugs: ["gaming", "creator-economy", "software-engineering"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description:
      "New releases, type system improvements, ecosystem tools, and the language powering modern web development.",
    keyword: "TypeScript news",
    category: "Niche & Emerging",
    relatedSlugs: ["web-development", "software-engineering", "dev-tools"],
  },
  {
    slug: "kubernetes-devops",
    name: "Kubernetes & DevOps",
    description:
      "Container orchestration, platform engineering, CI/CD, and the infrastructure behind modern apps.",
    keyword: "Kubernetes DevOps news",
    category: "Niche & Emerging",
    relatedSlugs: ["cloud-computing", "software-engineering", "dev-tools"],
  },
  {
    slug: "drones-uav",
    name: "Drones & UAVs",
    description:
      "Commercial drones, delivery fleets, defense UAVs, regulations, and aerial technology breakthroughs.",
    keyword: "drone news today",
    category: "Niche & Emerging",
    relatedSlugs: ["robotics", "defense-military", "autonomous-vehicles"],
  },
  {
    slug: "water-scarcity",
    name: "Water Scarcity",
    description:
      "Desalination, aquifer depletion, water rights, and the looming global freshwater crisis.",
    keyword: "water scarcity news",
    category: "Niche & Emerging",
    relatedSlugs: ["climate-change", "weather-climate-extremes", "urban-planning"],
  },
  {
    slug: "aging-population",
    name: "Aging Population",
    description:
      "Demographic shifts, elder care innovation, retirement economics, and what an older world means for society.",
    keyword: "aging population news",
    category: "Niche & Emerging",
    relatedSlugs: ["longevity", "healthcare-policy", "public-health"],
  },
  {
    slug: "synthetic-biology",
    name: "Synthetic Biology",
    description:
      "Engineered organisms, biomanufacturing, lab-grown materials, and the convergence of biology and engineering.",
    keyword: "synthetic biology news",
    category: "Niche & Emerging",
    relatedSlugs: ["biotech", "crispr-gene-editing", "pharmaceuticals"],
  },
  {
    slug: "legal-tech",
    name: "Legal Tech",
    description:
      "AI contract review, litigation analytics, legal AI assistants, and technology transforming the legal industry.",
    keyword: "legal tech news",
    category: "Niche & Emerging",
    relatedSlugs: ["artificial-intelligence", "generative-ai", "dev-tools"],
  },
  {
    slug: "climate-tech",
    name: "Climate Tech",
    description:
      "Cleantech startups, green hydrogen, climate fund investments, and the technology tackling the climate crisis.",
    keyword: "climate tech news",
    category: "Niche & Emerging",
    relatedSlugs: ["climate-change", "renewable-energy", "venture-capital"],
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
