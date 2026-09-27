# FIX: lead story always from the same topic

## Symptom
Colton's brief has led with OpenClaw (topic "clawdbot") every day since at least Mar 29, 2026. His Sep 17–26 briefs all used an OpenClaw headline as the subject.

## Root cause
- `api/cron/generate-briefings` selects topics with no ORDER BY.
- `generateBriefing` keeps that order.
- `generateSubjectLine` uses `topics[0].headline`.

So the user's oldest topic always comes first in the brief and in the subject. The other 5 topics change daily; the brief is not frozen. OpenClaw ships near-daily releases and security news, so its section is always "fresh" and never falls back.

## Fix (this branch)
Sort topics by id for a stable order, then rotate by UTC day. Each topic takes a turn leading and supplying the subject line. `tsc --noEmit` passes. Not deployed.

## Secondary (not fixed)
- Dedup is fuzzy. For example, v2026.9.6 was the lead on both Sep 24 and Sep 26. `extractPreviousCoverage`'s fallback checks `!coverageByTopic.has(ot)` across all briefings rather than per briefing. As a result, older days' sections whose text lacks the topic name get dropped from dedup context.
- Colton can also rename or delete "clawdbot" in the dashboard if he wants less OpenClaw.

## Deploy
Merge to main → Vercel auto-deploys. Colton's call.
