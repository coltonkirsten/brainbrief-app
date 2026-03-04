export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  keyword: string;
  publishedAt: string; // ISO date string
  readingTime: number; // minutes
  content: string; // markdown
}

export const blogPosts: BlogPost[] = [
  {
    slug: "stay-informed-without-doomscrolling",
    title: "How to Actually Stay Informed Without Doomscrolling",
    metaDescription:
      "Learn how to stay genuinely informed without the anxiety and time drain of doomscrolling — and what a healthier information diet actually looks like.",
    keyword: "how to stay informed without doomscrolling",
    publishedAt: "2026-01-20",
    readingTime: 7,
    content: `The problem isn't your willpower. It's the business model.

Every major news platform — social media, news apps, cable networks — is built around one metric: time on site. Not how informed you feel afterward. Not how accurate the information is. Not whether reading it was worth your time. Just: did you keep scrolling?

Doomscrolling is the predictable outcome of a system designed to maximize engagement at the expense of everything else. Breaking the habit requires understanding what you're actually up against, then building a different system.

## Why "Just Read Less News" Doesn't Work

The instinct to quit news cold turkey is understandable. But it creates a different problem: most of us have legitimate reasons to stay informed. Our work requires it. Our interests demand it. We have a genuine desire to understand what's happening in the world.

The goal isn't to consume less information. It's to consume *better* information — deliberately rather than reactively.

## The Real Problem: Passive vs. Active Consumption

There are two fundamentally different ways to engage with information.

**Passive consumption** is what doomscrolling looks like. You open Twitter or a news app with vague intentions and get pulled along by whatever the algorithm surfaces. You're not choosing what to read — the platform is choosing for you, based on what generates clicks, outrage, or fear of missing out.

**Active consumption** means deciding in advance what you want to know about, then finding information that serves that goal. It's the difference between wandering through a grocery store hungry versus shopping with a list.

Most people's information diet is almost entirely passive. That's by design. Passive consumption generates more engagement, and engagement is what these platforms are built to produce.

## Building an Intentional Information Diet

An intentional approach to staying informed has three components.

### 1. Know what you actually want to follow

Not what you think you *should* follow. Not what's trending. What do you genuinely care about?

For most people, this is a specific mix — maybe AI developments, climate policy, their industry, a sport, and one or two personal interests. Write it down. That list is your information diet. Everything else is optional noise.

### 2. Schedule your news time

Open Twitter at noon, not first thing in the morning and not while waiting in line. Give yourself a defined window — 10 or 20 minutes — and close it when the time is up. The news will still be there tomorrow.

What you're doing is converting information consumption from a reactive habit (open the app when bored or anxious) into a deliberate one (read at a specific time for a specific purpose). This single change eliminates most of the anxiety that comes with passive scrolling.

### 3. Favor synthesis over links

The format matters as much as the content. A well-written summary of what's happening in a topic — with context and significance explained — is worth more than ten raw links you'll open and never finish reading.

Aggregation feels informative. Synthesis actually is.

This is also why email works better than feeds for intentional consumption. An email arrives, you read it, you close it. There's no infinite scroll. The format enforces a natural stopping point.

## What "Staying Informed" Actually Means

It's worth examining what this phrase means in practice.

Most people who doomscroll feel perpetually busy with information but persistently unenlightened. They can tell you what the latest controversy was but not why the Federal Reserve's latest decision matters for their mortgage rate. They're consuming volume, not depth.

Being genuinely informed means having enough context to understand what's happening and why it matters. That requires consistent engagement with a specific set of topics — not a firehose of everything.

Narrower scope, read more carefully, actually retained: that's what staying informed looks like.

## A Better Design

The alternative to doomscrolling isn't less information — it's better-designed information delivery. A daily briefing that covers only the topics you've chosen, arrives in your inbox on a fixed schedule, and synthesizes rather than aggregates does something algorithmically driven platforms fundamentally cannot: it serves your agenda instead of the platform's.

You read it, you're done. Nothing to scroll. No recommendation engine designed to pull you deeper.

That's the philosophy behind [Brain Brief](https://brainbrief.app). Choose your topics. Get a briefing. Move on with your day.`,
  },
  {
    slug: "generic-newsletters-are-dead",
    title: "Why Generic Newsletters Are Dead (And What's Replacing Them)",
    metaDescription:
      "Newsletter fatigue is real. After a decade of inbox overload, the era of generic email digests is ending. Here's what comes next — and why it's better.",
    keyword: "newsletter fatigue",
    publishedAt: "2026-01-24",
    readingTime: 8,
    content: `In 2020, newsletters were supposed to save us.

The argument was compelling: escape the algorithmic chaos of social media, subscribe to writers you trust, get their work delivered directly to your inbox. No feed. No ads. No recommendation engine gaming your attention. Just the signal, reliably delivered.

It worked — for a while. Then it created a different problem.

## The Inbox That Became Another Feed

The newsletter boom was real. Substack went from a niche tool to a cultural institution in roughly two years. "Email is back" became a media industry refrain. Writers left established publications to go independent; readers followed.

The problem is that most readers didn't subscribe to one newsletter. They subscribed to fifteen. Then stopped opening most of them. Started feeling guilty about that. Eventually began treating their inbox the way they'd previously treated Twitter: something to be stress-scrolled and managed rather than actually read.

The newsletters solved the algorithm problem. They didn't solve the volume problem. And they introduced a new one: inbox overload that looks almost identical to feed overload, just slower and with more unread counts.

## The Structural Problem With Generic Newsletters

Even the best newsletters share a fundamental limitation: they're written for everyone who subscribes, which means they're truly optimized for nobody.

A technology newsletter covers AI, hardware, policy, startup culture, and the occasional profile piece. A given reader might care deeply about AI and policy and essentially nothing about the rest. But the newsletter is a bundle — you take all of it or none. You skim past what doesn't apply to you, paying an attention tax each time you do.

Multiply this across a dozen subscriptions and the picture becomes clear. You're reading a lot. You're not necessarily learning what you want to know about.

### The engagement paradox

Newsletter writers face a real tension: to grow their audience, they need to cover broadly. But broad coverage means every subscriber finds a significant portion of each issue irrelevant. The newsletters that cover everything attract the most subscribers and serve them least well.

This isn't a criticism of newsletter writers — it's a structural constraint. A single publication serving a diverse audience cannot produce content that feels precisely calibrated for every individual reader. It's not possible.

## Why Personalization Attempts Have Fallen Short

Some products have tried to address this with segmentation. Choose a "track": beginner, intermediate, advanced. Get the startup edition or the enterprise edition.

This is marginally better than nothing, but it's a blunt instrument. It acknowledges that different readers have different needs, then offers two or three preset categories instead of actually solving the problem. It's the difference between a restaurant that asks if you have dietary restrictions and one that sends you a menu based on your actual preferences.

Real personalization isn't a dropdown menu. It's a briefing shaped around exactly what you care about — your topics, your depth, your interests.

## What Comes Next

The next generation of information delivery isn't another newsletter. It's a daily briefing built around your specific interests.

Not the publication's editorial calendar. Not an algorithm's guess about what will keep you engaged. The topics you've explicitly said matter to you.

This is only possible at scale because of AI. Synthesizing what's new and significant across hundreds of sources, identifying meaningful developments, and writing a coherent, readable briefing for someone interested in, say, climate policy, Formula 1, and enterprise software — that's not work one editor can do for one reader. It is precisely what a well-designed AI system can do.

The result looks less like a newsletter and more like a briefing memo. Specific to your interests. Written for you, not for a demographic.

## Why Email Is Still the Right Delivery Format

None of this means email was the wrong idea. Email remains the best delivery mechanism for intentional information consumption — it arrives, you read it, it's done. There's no infinite scroll. No notification badge accumulating. The format imposes a natural stopping point that feeds never do.

The insight from the newsletter era was right: get information out of the algorithmic feed and into a format the reader controls. The execution just didn't go far enough. The next step isn't a better newsletter. It's a briefing that knows what you care about.

## The Inbox Is Fine. The Bundle Is the Problem.

If you're experiencing newsletter fatigue, the solution isn't to unsubscribe from everything and go back to the news feed. It's to replace the bundle with something that actually serves your interests.

A daily briefing on your topics. Synthesized, not aggregated. Five minutes to read. Done.

The inbox isn't going anywhere. The twenty-newsletter subscription stack is.`,
  },
  {
    slug: "five-minute-morning-briefing",
    title:
      "The 5-Minute Morning Briefing: How AI Is Changing the Way We Consume News",
    metaDescription:
      "AI-powered morning briefings aren't just faster news — they're a fundamentally different approach to staying informed. Here's what makes them different.",
    keyword: "AI news briefing",
    publishedAt: "2026-01-28",
    readingTime: 8,
    content: `Somewhere between the morning newspaper and the doomscrolling era, we lost the idea that staying informed could be a calm, finite experience.

A newspaper arrived. You read it. You were done.

At some point, "staying informed" became a continuous, anxious background task — tabs open, notifications on, reflexive refresh pulls before coffee has finished brewing. The information got faster. The clarity got worse.

The morning briefing is making a comeback. But what it looks like now is fundamentally different from what it replaced.

## What AI Curation Actually Does

There's a common misconception about AI-powered news tools: that they're glorified aggregators that surface links faster than you could find them yourself. Some are. But a more useful category does something fundamentally different — it synthesizes.

Aggregation gives you links. Synthesis gives you understanding.

The distinction matters more than it might first appear. Reading ten headlines about a policy debate tells you that people are arguing. A well-synthesized briefing tells you what the core disagreement is, what's changed since last week, and why it matters. The former takes longer and teaches you less.

AI synthesis works by pulling from hundreds of sources, identifying what's new and significant within a topic area, and producing a coherent, readable summary — not a collection of links with automated subject lines. Actual prose, with context. The goal is to leave you with genuine understanding of a topic, not the ambient awareness of someone who skimmed a lot of headlines.

## Why Topic-First Beats Source-First

Most news consumption is source-first: you follow publications, journalists, or social accounts and read whatever they produce. The logic is that if you trust the source, you'll trust the output.

This model has two problems worth understanding.

**First, even trusted sources publish things you don't care about.** A publication you follow for its climate coverage also covers tech, culture, politics, and sports. You're accepting a bundle when you want a slice. You pay an attention tax every time you encounter content outside your actual interests.

**Second, important developments rarely live in one source.** A significant shift in AI policy might be covered most meaningfully by a major newspaper, two trade publications, an academic research blog, and an independent journalist on Substack — none of whom you necessarily follow. Source-first consumption means you see one or two angles on a story that deserves five.

Topic-first consumption inverts this. You define what you want to know about. The system finds the most relevant coverage of that topic across all sources, synthesizes it, and delivers the result. You get breadth without the time cost.

## The Significance Problem

The hardest challenge in AI-powered briefings isn't writing quality or source coverage — it's determining what's actually new and significant on a given day in a given topic.

A lot happens every day. The useful question is: of everything published about AI today, what genuinely moved the conversation forward versus what was commentary, noise, or incremental updates?

Getting this right requires more than recency ranking. It requires understanding a topic deeply enough to distinguish a meaningful development from a high-volume reaction cycle. This is where the difference between a useful briefing and a mediocre one lives — not in the writing, but in what gets included and what gets filtered out.

## The 5-Minute Format

The most useful morning briefings share properties with the best newspaper front pages: they tell you what's important today, give you enough context to understand why, and don't waste your time getting there.

Five minutes is the right target for a reason. It's enough time to cover three to five topics with genuine depth. It's not so long that it becomes another obligation you procrastinate on. And it respects a real constraint: mornings are already full.

This also means the writing has to earn its keep. A 5-minute briefing that's padded, jargon-heavy, or structured around links rather than synthesis takes eight minutes and teaches you less. The discipline is editorial — every sentence is there because it adds something.

## The Habit Architecture

Part of why the briefing format works is that it fits naturally into an existing daily ritual. Email arrives. You read it over coffee. You move on.

There's no app to open, no feed to manage, no notification badge accumulating pressure. The briefing lands at a consistent time and serves a consistent function. The format enforces closure — something feeds are explicitly designed to prevent.

Over time, the habit builds genuine knowledge. Not the ambient, anxious awareness of someone who scrolled for an hour, but actual understanding of how the topics you care about are developing — because you engaged with them consistently, in synthesized form, every day.

## What This Looks Like in Practice

[Brain Brief](https://brainbrief.app) lets you choose up to ten topics — anything from geopolitics to Formula 1 to machine learning to modern history. Each morning, you receive a briefing that covers what's new and significant in each of them.

No filler. No topics you didn't choose. No algorithm with its own agenda.

It arrives in your inbox. You read it. You're done.`,
  },
  {
    slug: "hidden-cost-of-information-overload",
    title:
      "The Hidden Cost of Information Overload (And What It's Costing Your Career)",
    metaDescription:
      "Information overload isn't just annoying — it has measurable costs to your focus, decision-making, and career performance. Here's what the research shows.",
    keyword: "information overload solutions",
    publishedAt: "2026-02-01",
    readingTime: 9,
    content: `Every knowledge worker has experienced some version of this: you spent the morning reading — news, newsletters, Slack, email, a few articles you meant to skim — and by noon you feel both exhausted and somehow behind. You've been consuming information for hours. You don't feel more informed.

This isn't a personal failing. It's a well-documented cognitive phenomenon, and it has real consequences.

## What Information Overload Actually Is

Information overload happens when the volume of incoming information exceeds a person's capacity to process it meaningfully. The concept isn't new — psychologist George Miller established in 1956 that the human brain can hold roughly seven pieces of information in working memory at a time. What's new is the scale of the problem.

The average knowledge worker in 2024 encounters more information in a single day than a person in the 15th century encountered in a lifetime. This isn't metaphor — it's a rough estimate from information scientists who study data volume growth. The biological machinery hasn't changed. The information environment has changed dramatically.

The result is a system under consistent stress — not the dramatic, acute stress of a deadline, but the chronic, low-grade stress of a brain that is perpetually processing more than it can meaningfully absorb.

## The Attention Recovery Problem

The most cited piece of research in this area comes from Gloria Mark at the University of California, Irvine, who has spent decades studying how people actually work. Her findings are consistently uncomfortable.

After an interruption — switching to a different app, checking a notification, clicking a link — it takes an average of 23 minutes to return to full focus on the original task. Not two minutes. Twenty-three.

For knowledge workers who check news or social media habitually during the workday, the math is sobering. Three interruptions from a news feed between 9 and 11 AM might cost more than an hour of productive cognitive bandwidth — not in the time spent on the interruption, but in the recovery time afterward.

This compounds in a specific way when the interruption is information designed to generate an emotional response. Outrage, anxiety, and urgency are the emotional signatures of most news feeds — and these states are particularly disruptive to the kind of focused, analytical work that high-performance knowledge work requires.

## The Decision-Making Degradation

A second, less discussed cost is what information overload does to decision quality.

Research from Columbia Business School and other institutions on "decision fatigue" has established that the quality of decisions degrades as cognitive load accumulates throughout the day. Judges grant parole at different rates before and after lunch. Doctors prescribe more conservatively late in a clinical session. The brain, treated as a resource, runs lower as the day progresses.

Information overload accelerates this. Exposure to high volumes of competing information — each piece implicitly demanding a response (Is this important? Should I act on this? What does this mean for me?) — consumes the same decision-making resources that you need for the actual work of your job.

The professional who spends an hour reading a fire-hose of news before sitting down to make a strategic recommendation is operating at a cognitive disadvantage relative to the one who did something structured and finite instead.

## The Retention Paradox

Perhaps the most counterintuitive cost: more information often means less learning.

This is the retention paradox of information overload. Humans consolidate memories during sleep, and the brain preferentially consolidates information it processed deliberately and with some depth. Surface-level exposure to high volumes of information — the scrolling-and-skimming pattern — produces weak memory traces that fade quickly.

The professional who reads twelve headlines about a geopolitical development will likely retain less about that situation in two weeks than the one who read one well-synthesized 600-word briefing. Volume is not depth. Speed is not retention.

This is why people who follow a lot of news often find themselves unable to explain, in substance, what's actually happening in the stories they've been "following."

## What It's Costing, Concretely

The IDC estimated that the annual cost of information overload to the US economy was over $650 billion — a figure that accounts for lost productivity, poor decisions made under cognitive strain, and the time cost of managing information overload itself.

At the individual level, the costs are less dramatic but more personal:

- **Chronic background anxiety** — the persistent sense that you're behind, missing something, or insufficiently informed
- **Reduced strategic thinking** — shallow, reactive thinking rather than the kind of deliberate analysis that produces good work
- **Meeting performance** — showing up to discussions with ambient awareness rather than genuine command of relevant topics
- **Career signaling** — colleagues and managers notice the difference between someone who speaks with genuine understanding and someone who is working from headlines

## A Different Approach

The solution isn't to stop engaging with information. It's to redesign how you engage with it.

The core shift is from passive to deliberate consumption: knowing what topics you want to follow, choosing a format that synthesizes rather than aggregates, and creating fixed windows for information consumption rather than continuous ambient exposure.

A daily briefing that covers exactly the topics you've chosen — read once, at a consistent time, in a format that gives you genuine understanding rather than a pile of links — addresses the core problem. It keeps you genuinely informed on the things that matter to your work and your interests, without the cognitive costs that come with passive, high-volume consumption.

The goal isn't to be less informed. It's to be actually informed, rather than just busy with information.`,
  },
  {
    slug: "rss-apps-newsletters-comparison",
    title: "RSS Feeds, News Apps, and Newsletters: An Honest Comparison",
    metaDescription:
      "RSS, news apps, newsletters, social media — each approach to staying informed has real tradeoffs. Here's an honest breakdown to help you build the right information diet.",
    keyword: "best way to stay up to date on news",
    publishedAt: "2026-02-04",
    readingTime: 10,
    content: `There is no shortage of tools that promise to help you stay informed. After two decades of media experimentation, the options have proliferated: RSS readers, curated news apps, Substack newsletters, email digests, Twitter lists, Reddit, podcasts, and now AI-powered briefings. Each has a committed user base that insists it's the right approach.

Most of them work, for some people, in some situations. None of them is right for everyone.

Here's an honest assessment of each major approach — what it's genuinely good at, where it falls short, and who it tends to serve best.

---

## RSS Feeds

**What it is:** RSS (Really Simple Syndication) is a protocol that lets you subscribe to websites and get new posts delivered to a feed reader like Feedly, NewsBlur, or the late, beloved Google Reader. You build your own curated list of sources and read everything in one interface.

**What it does well:**
- Complete control over sources — nothing algorithmic, nothing you didn't choose
- Works across thousands of publications and blogs
- Chronological and predictable — you see everything, in order
- Great for niche or technical publications that aren't available in mainstream apps

**Where it falls short:**
- Source-first by nature: you follow publications, not topics. If a major story crosses multiple sources you don't follow, you'll miss the synthesis.
- No significance filtering — you see every post from every subscribed source, regardless of importance
- High maintenance: requires active curation, and lists go stale as publications change
- Doesn't work with Twitter, Substack (by default), or many modern content platforms
- The reading experience depends entirely on your reader app

**Best for:** Developers, researchers, and niche-domain professionals who know exactly which sources cover their field, and want to see everything from them without algorithmic interference.

---

## News Apps

**What they are:** Curated aggregators like Apple News, Google News, Flipboard, and their equivalents. These pull from thousands of publishers and use algorithms (with varying degrees of editorial curation) to surface what's considered relevant to you.

**What they do well:**
- Zero setup — they work immediately
- Broad coverage across many publishers
- Good for casual, general-interest consumption
- Mobile-optimized for reading on the go

**Where they fall short:**
- Algorithmic by nature: what surfaces is what drives engagement, not what's most substantive
- Designed for time-in-app maximization — infinite scroll, constant fresh content
- Topics and personalization are coarse; you can say "I like tech news" but not specify the precise intersection of AI, climate policy, and Formula 1 you actually care about
- You're reading within the app, not a format that enforces closure

**Best for:** General-interest news consumers who want a passive, low-effort way to catch major stories across categories. Not ideal for anyone who has specific professional or niche interests they want to follow with depth.

---

## Newsletters

**What they are:** Email publications from individual writers or publications, delivered directly to your inbox. The modern newsletter boom (Substack, Beehiiv, Ghost) created thousands of high-quality independent publications across nearly every topic.

**What they do well:**
- Direct relationship between writer and reader — no platform intermediary
- Often the highest-quality writing in a given domain, from experts writing in their own voice
- Email format naturally enforces closure (you read it, you're done)
- Delivered on a predictable schedule

**Where they fall short:**
- Bundle problem: each newsletter covers its own scope, and you take all of it or none
- Volume: most readers subscribe to far more than they can meaningfully read
- Source-first: you're following a writer's perspective on a topic, not the full landscape of what's happening
- Inconsistent publishing schedules create noise management problems
- Quality varies enormously — the great ones are irreplaceable, the mediocre ones become inbox guilt

**Best for:** People who have found specific writers they trust deeply in domains they care about. Works best when paired with genuine selectivity (two or three, not fifteen).

---

## Social Media (Twitter/X, LinkedIn, Reddit)

**What it is:** Follows, lists, communities, and algorithmic feeds across social platforms, used as an information source rather than (just) a social network.

**What it does well:**
- Real-time coverage — often the fastest source for breaking developments
- Expert commentary and primary source discussion (especially Twitter/X for certain fields)
- Reddit communities offer deep, niche expertise on specific topics
- Social signal — you can often gauge significance by how much credible people are discussing something

**Where it falls short:**
- Engineered for engagement, not understanding — the format rewards hot takes over nuanced analysis
- High noise-to-signal ratio, even with careful curation
- Optimized for time-in-platform, not information efficiency
- Emotionally expensive — platforms designed to keep you engaged often do so through outrage and anxiety
- No synthesis: you get fragments, not coherent understanding

**Best for:** Real-time monitoring of fast-moving situations; following specific experts in narrow domains; understanding the conversation *around* a topic rather than the topic itself. Not a substitute for synthesis.

---

## AI-Powered Briefings

**What they are:** Services that use AI to synthesize what's new and significant in a given topic area, then deliver the result as a readable briefing — rather than surfacing links or aggregating headlines.

**What they do well:**
- Topic-first rather than source-first: finds relevant coverage across all sources, not just ones you curate
- Synthesis over aggregation: you get coherent understanding, not a pile of headlines
- Works across any combination of topics, regardless of how niche or multidisciplinary
- Finite format — a briefing is a document, not a feed
- Scales to exactly what you care about without the bundle constraints of newsletters

**Where they fall short:**
- Significance filtering is still imperfect — determining what's genuinely new and important versus high-volume noise is a hard problem
- Not suitable for real-time: if you need to know about something the moment it happens, a daily briefing won't serve that need
- Quality depends heavily on the underlying model and curation logic
- The category is new, and the best implementations are still being refined

**Best for:** People with specific, defined topic interests who want genuine understanding — not ambient awareness — in a time-efficient format. Particularly well-suited to professionals who need to stay current on their industry and a few other areas without the time cost of managing multiple information sources.

---

## Building Your Stack

These tools aren't necessarily mutually exclusive. A practical information diet for most knowledge workers might look like:

- **One or two deeply trusted newsletters** from writers who are genuinely expert in your most important domain
- **Twitter/X lists or Reddit communities** for real-time signal in fast-moving topics, accessed on a schedule rather than continuously
- **A daily briefing** for the rest — the topics you want to follow without the curation overhead

The goal is deliberate design. Most people's information diet happened to them; they subscribed to things, followed accounts, and opened apps reactively. The alternative is deciding what you want to know about and choosing the tools that serve that goal.`,
  },
  {
    slug: "how-executives-stay-informed",
    title:
      "How Executives Stay Informed Without Spending 3 Hours on News",
    metaDescription:
      "Senior professionals can't afford to doomscroll — or to be uninformed. Here's how the best of them stay genuinely current in under 30 minutes a day.",
    keyword: "how executives stay informed",
    publishedAt: "2026-02-07",
    readingTime: 9,
    content: `There's a specific irony in how most people approach staying informed: the more you need to know — the more consequential your decisions, the more domains you operate across, the more people who depend on your judgment — the less time you have to find out.

Senior professionals face this daily. They need genuine command of what's happening in their industry, adjacent fields, and the broader environment their organization operates in. They don't have three hours to spend on it. And most of them have learned, through experience, that the methods that work for casual news consumption don't scale to their actual information needs.

Here's what the patterns look like when it's done well.

## They Treat Information as a Resource, Not a Habit

The clearest pattern among people who stay well-informed under time pressure: they think about information the way they think about any other resource. What do I need? Where does it come from? How much of it do I need, and in what form?

This is a fundamentally different orientation than the passive consumption model — opening apps and feeds and seeing what arrives. Passive consumption is appropriate for leisure. For professional knowledge management, it's expensive and unreliable.

Effective senior professionals define their information requirements deliberately: the two or three domains that directly affect their work, the industry dynamics they need to track, the one or two adjacent areas they want to maintain awareness of. That list is the scope of their information diet. Everything else is optional.

## They Use Fixed Windows, Not Continuous Monitoring

Without exception, the pattern among high-performers who stay genuinely current is **scheduled consumption, not continuous monitoring**.

A fixed 20-minute block each morning — before the day's demands fragment attention — dedicated to the briefings, newsletters, or summaries that cover their defined domains. Not tabs opened and abandoned throughout the day. Not notifications checked reflexively between meetings. A defined start and end.

This matters for two reasons.

First, it's the only approach that's sustainable. Continuous monitoring, even of high-quality sources, eventually produces the same fatigue and noise as doomscrolling. The format is different but the cognitive cost is similar.

Second, it imposes a useful constraint. When you have 20 minutes, you read what matters. When you have unlimited time, you read whatever holds your attention. The constraint improves the quality of what you actually absorb.

## They Favor Synthesis Over Breadth

A consistent preference among effective information consumers: they want to understand what's happening, not see everything that was written about it.

This means choosing formats that synthesize — briefings, summaries, editorial takes from people with genuine expertise — over formats that aggregate. The goal is enough understanding to think clearly about a topic, not comprehensive coverage of every perspective.

In practice, this often looks like:

**Briefing documents over newsletters.** A well-written briefing that covers three developments in a domain in 400 words is more useful than a 2,000-word newsletter that covers twelve. The former can be read and understood; the latter is skimmed.

**Expert synthesis over primary sources.** For domains outside your core expertise, a clear explanation from someone who understands the field beats reading the primary material directly. You don't need to read every academic paper on climate science; you need to understand what the current state of evidence says and why it matters.

**Summaries before depth.** The useful pattern is: understand the landscape from a briefing, then go deep on the specific elements that require your attention. Start broad and synthesized, go deep only where it's warranted.

## They're Topic-First, Not Source-First

Senior professionals who stay genuinely well-informed tend to define what they follow by topic, not by source. They don't maintain a list of publications and read everything those publications produce. They maintain a list of questions — what's happening in AI regulation? What's the state of our competitive landscape? What are the macro trends in talent? — and find information that answers those questions.

This is harder to build than a subscription list but produces much better outcomes. Source-first consumption means you're at the mercy of each publication's editorial calendar and scope. Topic-first consumption means you get what you actually need to know.

The practical version of this is a defined set of topics — narrow enough to be meaningful, broad enough to cover the domains that matter — and a system that delivers coverage of those topics consistently.

## They Delegate to Good Tools

Historically, the delegation layer was a chief of staff or a trusted assistant who would clip, summarize, and surface relevant material. That model still exists in large organizations, but it doesn't scale to smaller teams, and it produces information filtered through another person's judgment.

The more modern version of this delegation is a well-designed briefing system. Define the topics. Get the synthesis delivered. Trust the system enough to stop monitoring everything else.

This requires some upfront investment in choosing the right tools — and some ongoing calibration as your information needs evolve — but it eliminates the overhead of manual curation and reduces the temptation toward passive consumption.

## What This Looks Like in Practice

The pattern, assembled:

1. **Define your topics** — three to five areas that matter to your work and your thinking. Write them down.
2. **Choose your format** — briefings that synthesize, not feeds that aggregate
3. **Set a fixed window** — 20 minutes in the morning, before the day fragments
4. **Read with purpose, not passively** — you're building understanding, not ambient awareness
5. **Go deep only where warranted** — the briefing tells you what matters; you decide whether it merits further attention

This isn't a heroic discipline. It's a system. And systems, unlike willpower, scale.`,
  },
  {
    slug: "reading-wrong-things",
    title: "You're Reading the Wrong Things. Here's How to Know.",
    metaDescription:
      "Most people's information diet happened to them — they never chose it. Here's a simple audit to find out if what you're reading actually matches what you care about.",
    keyword: "information diet",
    publishedAt: "2026-02-10",
    readingTime: 7,
    content: `Here's a question worth sitting with: when did you last choose what to follow?

Not subscribe to something, or click follow on an account — those are actions, not choices. I mean: when did you last sit down and decide, deliberately, what topics you want to understand better, and build your information diet around that answer?

Most people haven't. Most people's information diet happened to them. They signed up for a newsletter when it was recommended, followed an account because everyone else seemed to, installed a news app because it came with their phone. Over time, the stack of sources accumulated without much intention behind it.

The result is an information diet that reflects your past self's clicks more than your current self's actual interests. And it produces a specific, recognizable feeling: you read a lot, but you don't feel well-informed about the things that actually matter to you.

## The Audit

Here's a simple test to find out if your information diet is working. It takes about ten minutes.

### Step 1: Write down the five topics you most want to understand.

Not what you think you *should* follow. Not what's professionally expected of you. What do you genuinely want to know more about?

For most people, this is some mix of professional domains, personal interests, and a few broader areas they find themselves caring about — geopolitics, a sport, a scientific field, a creative interest. Write down the actual list, not the aspirational one.

### Step 2: List everything you currently read.

Newsletters, apps, accounts you check regularly, podcasts, subreddits, anything. Be honest.

### Step 3: Compare the two lists.

For every item on your "currently reading" list, ask: does this serve one of the five topics I said I care about?

If the answer is "not really" or "occasionally," that source is probably noise. It might be interesting noise — you might genuinely enjoy it — but it's not building the understanding you said you wanted.

Then flip it: for every topic you said mattered to you, is there at least one source on your reading list that meaningfully covers it? If not, you're not actually following the things you said were important.

Most people who do this exercise find significant misalignment between the two lists. They're spending more time with sources they sort of follow out of habit than with sources that serve their stated interests.

## The Alignment Problem

There are two failure modes the audit surfaces.

**Stale subscriptions:** Sources you added at some point and never removed, whose relevance to your life has shifted. The newsletter you subscribed to during a previous job. The account you followed because of one good post. These accumulate over time and create volume without value.

**Topic gaps:** Things you said matter to you that you're getting essentially no coverage on. This is the more interesting failure. It means you have genuine intellectual interests that your information diet is ignoring entirely — either because you haven't found good sources, or because the good sources don't exist in a format you consume.

Both are worth addressing. The stale subscriptions are easy: unsubscribe. The topic gaps are harder, because finding genuinely good coverage of a specific topic across multiple sources requires either deliberate curation or a system that does it for you.

## What to Do With What You Find

The goal isn't to make your information diet smaller — it's to make it deliberate.

**For misaligned sources:** Unsubscribe or unfollow without guilt. You're not missing anything; you were already mostly ignoring it.

**For topic gaps:** This is where real work is needed. The question is whether you can find a good source that covers your topic well — and whether that source covers it in a way that serves understanding rather than just awareness.

A newsletter that covers your topic exists and is well-written? Great. Subscribe to it, unsubscribe from something else to keep the total manageable.

Your topic is niche enough that no single newsletter covers it well, or your interests cross too many domains for a bundle format to serve? That's a different problem. It's the problem that synthesis tools — briefings that pull from across sources and cover exactly the topics you specify — are designed to solve.

## The Broader Principle

Your information diet is a resource. Like any resource, it's worth managing deliberately rather than letting accumulate by accident.

The question isn't "am I reading enough?" Most people are reading more than enough. The question is whether what you're reading is building the understanding you want — or just producing a sense of having been busy with information.

Those two things feel similar in the moment. Over time, the difference compounds.`,
  },
  {
    slug: "why-you-cant-remember-what-you-read",
    title:
      "Why You Can't Remember What You Read (And What to Do About It)",
    metaDescription:
      "You read constantly but retain almost nothing. This isn't a memory problem — it's a processing problem. Here's what cognitive science says about why, and what actually works.",
    keyword: "why can't I remember what I read",
    publishedAt: "2026-02-13",
    readingTime: 8,
    content: `You've had this experience: you read something, close the tab, and twenty minutes later can't recall what it said. Not the details — the gist. You remember reading *something* about the topic. You can't tell someone what you learned.

This happens to nearly everyone who consumes information the way most people currently do. And it's not a memory problem. It's a processing problem.

## How Memory Actually Works

In the 1970s, psychologists Fergus Craik and Robert Lockhart proposed what became one of the most durable frameworks in cognitive psychology: levels of processing. The idea is straightforward but has significant implications for how we read.

Shallow processing means engaging with the surface features of information — the words on the page, the structure, whether something looks familiar. Deep processing means engaging with meaning — understanding what something says, why it matters, how it connects to what you already know.

Memory strength, their research showed, is determined by depth of processing, not by exposure time. Reading something slowly doesn't help if you're still processing it shallowly. And skimming something produces weak, fragile memory traces regardless of how many times you do it.

This is why you can read an article, close it, and remember almost nothing. If your eyes moved across the words but your brain was mostly pattern-matching and moving on — if you were skimming for familiarity rather than reading for understanding — you processed it shallowly. The memory trace is thin and fades quickly.

## The Forgetting Curve

Hermann Ebbinghaus mapped this out empirically in the 1880s with what became known as the forgetting curve. Without reinforcement, humans forget roughly 50% of new information within an hour, 70% within a day, and 90% within a week.

The curve flattens with meaningful engagement. Information processed with genuine attention — where you understood the idea, made connections to existing knowledge, or could explain it to someone else — decays much more slowly.

The implication is counterintuitive: one careful, comprehending read is typically more valuable for retention than three quick skims. Volume is not depth.

## The Recognition Trap

There's a specific cognitive illusion that makes this worse: the feeling of familiarity.

When you skim a headline or article, you often come away with a sense of knowing — a feeling that you're now informed about this topic. But what you have is recognition, not recall. You'd recognize the story if you encountered it again. You cannot recall the substance, explain the argument, or apply the information.

Recognition and recall feel similar in the moment. The difference becomes visible when you try to discuss the topic in a meeting, explain it to someone else, or use it to inform a decision. That's when it becomes clear that familiarity and understanding are not the same thing.

Most high-volume news consumption produces recognition, not recall. You've been "informed" in the sense that you've encountered the information — not in the sense that you can do anything with it.

## Why Synthesis Helps Retention

A well-synthesized briefing is better for retention than a set of raw sources for a specific reason: synthesis forces meaning-making.

When a briefing explains what happened, why it changed, and what it means — rather than presenting raw information and leaving you to do that work — it's doing some of the deep processing for you. The result is that you're reading for comprehension of a coherent argument rather than pattern-matching across multiple fragments.

You're also reading less. And paradoxically, reading less information presented more clearly produces better retention than reading more information presented as headlines and links. The brain consolidates what it understood, not what it scanned.

## The Volume Trap

The most common response to the "I'm not retaining anything" problem is to read more carefully, or to read more. Neither reliably works.

Reading more carefully, without changing the format or volume, runs into the limits of attention. There's a reason editors and researchers enforce word limits — attention is finite, and past a certain volume, everything becomes shallower whether you intend it to or not.

Reading more is the opposite of the solution. More volume means more shallow processing, more fragile memory traces, and more of the recognition-not-recall problem.

The counterintuitive answer is: read less, in a format that gives you more to work with.

## What Actually Works

A few principles that follow from the research:

**Choose depth over breadth.** Five topics covered well produce more durable knowledge than fifteen topics skimmed. You'll retain more from a careful read of a 600-word synthesis than from glancing at twelve headlines.

**Read for understanding, not familiarity.** Ask yourself, after reading: what's the core argument here? What changed? Why does it matter? If you can't answer, you processed it shallowly.

**Favor formats that synthesize.** A well-written briefing — one that explains significance, not just events — gives your brain more to work with than a raw feed. The work of connecting and contextualizing, done well, is part of what you're paying for.

**Accept that you can't follow everything.** The cognitive cost of trying to is real, and the retention is poor. Choosing a narrower set of topics and engaging with them deeply produces more genuine knowledge than trying to stay current on everything.

The goal isn't to read more. It's to actually know what you read.`,
  },
  {
    slug: "rise-of-personalized-briefing",
    title:
      "The Rise of the Personalized Briefing: Why One-Size-Fits-All News Is Over",
    metaDescription:
      "From the morning newspaper to algorithmic feeds to AI briefings — how information delivery has evolved, where it's going, and why true personalization finally matters.",
    keyword: "personalized news digest",
    publishedAt: "2026-02-17",
    readingTime: 9,
    content: `For most of the twentieth century, staying informed meant reading the same thing as everyone else.

The morning newspaper was a genuinely shared experience. The same front page reached millions of households simultaneously. People in a city read the same stories, formed opinions from the same editorial framing, and carried the same set of facts into their day. The information was generic by design — one publication, one audience, one version of what mattered today.

This worked, for a long time, because the alternative was nothing. A personalized newspaper was technologically impossible and economically absurd. You took the bundle or you went uninformed.

The last thirty years have been a steady unwinding of that constraint — each step getting closer to information that actually fits the person receiving it, each step also creating new problems the previous step didn't have.

## The First Fragmentation: Cable and Niche Media

The first significant move away from universal information delivery came with cable television and the proliferation of niche publications in the 1980s and 90s. Instead of one news broadcast that everyone watched, you could watch a channel dedicated to sports, or business, or politics.

This was genuine progress: you could specialize. A person who deeply cared about financial markets could get more coverage, at greater depth, than a general newspaper could provide.

The drawback was coarseness. Channels and publications still served broad audiences — "business news" rather than the specific intersection of private equity and healthcare that a particular reader actually wanted. And the partisan segmentation that cable news introduced — selecting your channel partly based on how it would frame the news — introduced a different kind of distortion.

You got more choice. You didn't get your choice.

## The Social Media Era: Algorithmic Personalization

The promise of social media platforms was something closer to true personalization. By learning from your behavior — what you clicked, what you lingered on, what you shared — the algorithm would surface exactly what was relevant to you.

In practice, it optimized for something else: engagement. The algorithm that maximizes your time on platform and the algorithm that serves your genuine informational interests are not the same algorithm. The former surfaces outrage, controversy, and novelty. The latter would surface careful analysis of the topics you care about, even when that analysis is less emotionally activating.

Social media platforms built the personalization infrastructure. They pointed it at the wrong goal.

The result was feeds that felt personal — they were full of things you'd responded to before — but produced neither genuine understanding nor the sense of being well-informed. They produced the sense of being very busy with information.

## The Newsletter Era: Human Curation

The reaction against algorithmic curation drove the newsletter boom of the early 2020s. The argument was that a trusted human editor, writing for a self-selected audience, would produce better signal than any algorithm.

This was partly right. The best newsletters — written by genuine experts for audiences who chose them deliberately — offered something no feed could: consistent quality, a coherent perspective, and the trust that comes from a real relationship between writer and reader.

The limitation was structural. Even the best newsletter serves a defined audience with a defined scope. It's still a bundle: you subscribe to a technology newsletter and you take all its technology coverage, whether or not the specific mix of topics it emphasizes matches yours.

The newsletter era gave readers human curation. It didn't give readers *their* curation.

## The Next Step: Topic-Level Personalization

True personalization — the kind where the information you receive is actually built around your specific interests, not your demographic or your behavioral footprint — requires a different approach.

It requires starting with the reader's stated interests, not the publication's scope. It requires finding coverage across all sources, not just the ones a single writer follows. And it requires synthesizing that coverage into something readable, rather than presenting a feed of links and leaving the work of understanding to the reader.

This is what AI makes possible at scale. Not because AI can replace the judgment of a good editor — it can't — but because AI can do something no human editorial operation can: read across thousands of sources, identify what's actually new and significant in a specific topic on a specific day, and produce a coherent, readable summary of it. For any topic, at any intersection of interests, for any individual reader.

The result isn't a newsletter, and it isn't a feed. It's closer to the briefing memo that chiefs of staff have written for executives for decades — a synthesized document that covers what matters, tailored to the recipient, designed to produce genuine understanding rather than ambient awareness.

## What This Means for How We Stay Informed

The arc from the morning newspaper to the personalized briefing is, at each step, a move toward information that actually serves the person receiving it.

What's being lost in that arc is the shared informational commons — the experience of reading the same front page as everyone else. That loss is real and worth acknowledging. But it was already largely gone before AI briefings arrived. The algorithmic fragmentation of social media had already dissolved the shared information environment without replacing it with anything that served individuals better.

The personalized briefing doesn't further fragment the information commons. It offers something different: a way for each person to stay genuinely informed about the things they care about, without the noise, the volume, and the anxiety that current methods produce.

One briefing. Your topics. Five minutes. Done.`,
  },
  {
    slug: "five-signs-information-diet-failing",
    title: "5 Signs Your Information Diet Is Making You Less Informed",
    metaDescription:
      "Feeling informed and actually being informed are different things. Here are five signs your current reading habits are producing the feeling without the substance.",
    keyword: "information overload signs",
    publishedAt: "2026-02-20",
    readingTime: 8,
    content: `There's a version of staying informed that looks like staying informed but produces almost none of the benefits. You're reading constantly. You have opinions on current events. You could name the relevant parties in most major stories if pressed.

But if someone asked you to explain — actually explain, not just gesture at — what's happening in any of the topics you "follow," you'd find yourself reaching for phrases that sound informed without saying much. "It's complicated." "There's a lot going on." "I've been following it."

The difference between feeling informed and being informed is substantial. Here are five signs you've drifted toward the former.

---

## 1. You Have Tabs Open You'll Never Read

You know the ones. Opened with intention ("I'll read this later"), now forming an archaeological record of your reading ambitions going back weeks. Some of them might actually be interesting. You've forgotten why you saved them.

This is the visible symptom of a structural problem: you're encountering more content than you can meaningfully process. The tabs aren't a personal failing — they're a sign that your information intake is exceeding your capacity for actual reading.

The right question isn't "how do I get through my reading list?" It's: why does a reading list keep accumulating? The answer is usually that you're subscribing to more, following more, and opening more than you have time to genuinely engage with. The tabs are the overflow.

A well-designed information diet doesn't accumulate overflow. It matches what you consume to what you can actually absorb.

---

## 2. You Feel Informed But Can't Explain Things in Substance

Test yourself honestly: pick one topic you "follow" and try to explain it to someone who knows nothing about it. Not the names of the players, not that it's "a big deal" — the actual substance. What's happening? Why? What changed recently and why does it matter?

If the explanation stalls quickly, you have recognition without recall. You've been exposed to the information. You haven't processed it into understanding.

This is extremely common among people who consume high volumes of news. The format they're consuming — headlines, brief articles, social media posts — is optimized for surface-level familiarity, not for building genuine understanding of a topic over time.

Being able to explain something clearly is the real test of whether you've absorbed it. Most heavy news consumers fail this test on most of the topics they think they follow.

---

## 3. Reading the News Makes You More Anxious, Not Clearer

Information, consumed well, should produce a sense of understanding — an increased ability to make sense of what's happening and why. If your news consumption is consistently producing anxiety, dread, or a sense of being overwhelmed, the format and the content are working against each other.

This is by design in most news and social media environments. Platforms are optimized for engagement, and the emotional states that drive engagement are not the same ones that produce clear thinking. Anxiety, outrage, and urgency are effective at keeping you scrolling. They're not effective at helping you understand the world.

The tell is how you feel when you finish reading. Informed, calm, and ready to move on? Or more activated, more vaguely aware of bad things happening, and somehow less certain than before you started?

The latter is a sign that your information environment is working on you, not for you.

---

## 4. You Subscribe to More Than You Read (And Feel Guilty About It)

Newsletter subscription guilt is a specific, widely shared experience. The publications you subscribed to with genuine intention, which now arrive in your inbox as accumulating reminders that you're behind. The podcasts in your queue with 47 unplayed episodes. The RSS reader with 300+ unread items.

The guilt itself is a diagnostic. It means your stated interest in being informed — your aspirational information diet — and your actual behavior are misaligned. You believe you should be reading these things. You don't have the time or attention to actually read them.

The solution isn't more discipline. It's a smaller, better-chosen set of sources that you actually engage with rather than a larger set that you aspire to. Unsubscribing from things you don't read isn't falling behind. It's being honest about what you'll actually consume.

The information that matters to you — the topics you genuinely care about — deserves actual attention, not aspirational subscription.

---

## 5. You Know What Happened, But Not Why It Matters

This is the subtlest sign, and the most important one.

There's a difference between being aware of events and understanding them. Awareness tells you that something happened. Understanding tells you why it happened, what it changes, and what comes next. The former is easily obtained from headlines. The latter requires context, continuity, and synthesis.

Most information consumption produces awareness. Very little of it produces understanding.

The tell: when a topic you follow comes up in conversation, can you contribute to the discussion — offer context, explain the background, make sense of what it means — or can you only confirm that yes, you heard about that?

Genuine understanding of a topic accumulates over time through consistent, synthesized coverage. A briefing that explains what changed and why it matters — not just what happened — builds this kind of understanding. Headlines confirm that you've heard of something. Synthesis teaches you to actually know it.

---

## What to Do About It

None of these signs require dramatic interventions. They're all pointing at the same underlying problem: the format and volume of your information consumption isn't matched to the goal of actually being informed.

The fix is to be deliberate about what you follow, choose formats that synthesize rather than aggregate, and create finite consumption habits rather than continuous ones.

Less, better understood, on the topics that actually matter to you.`,
  },
];

/** Get all blog posts sorted by date (newest first) */
export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Get a single blog post by slug */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Get all slugs (for static generation) */
export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
