# The Patient Garden

A local-first spending reflection game integrated into the existing React / TypeScript / Vite site at `/garden`.

## Run and deploy

- `npm run dev`, then open `/garden`.
- `npm run build` runs the full test suite, TypeScript, Vite, and prerendering.
- `npm run preview`, then open `/garden/` (use the trailing slash with Vite's static preview).
- Push the source changes and open a PR for the existing Vercel project to create its preview. Do not commit `dist`, `.env` files, `.vercel`, browser profiles, or local test data.
- This session did not deploy a preview: the Vercel CLI identity was visible, but deployment/credential refresh failed. No production deployment was attempted.

## Capture and reflection

Paste an Amazon link or shared text. Product URLs are normalized by ASIN, so tracking tags, Amazon URL formats, and marketplace variants do not create duplicate wishes. Generic links are cleaned of common tracking tags too. Suggested names can come from a product slug or an explicit shared title. Explicit dollar prices in shared text can fill the estimate; digits in URLs are never treated as prices. Confirm all suggestions before saving.

Amazon short links can be expanded through `/api/garden-product`. The server only makes bounded HEAD requests to allowlisted Amazon hosts, checks every redirect, uses a timeout, and returns a product URL. It does not scrape product HTML or supply live pricing. If a short link cannot be resolved, paste the full product link or enter details manually. Offline manual capture always works.

Installed browsers supporting the Web Share Target API can share title/text/URL to the app. Other devices can paste links. Shared data fills an unsaved draft; it never adds an item automatically. The app clears share parameters from the visible address after reading them. Share-target query strings and short-link requests pass through hosting, so normal hosting request logs can contain those URLs.

Reflections, need/want classification, names, links, and estimated prices are editable without resetting waiting time or milestone history. A reflection of at least 10 characters earns 5 XP once. Older saves with an existing qualifying reflection are treated as already rewarded, avoiding duplicate XP.

## Budget and spending

One monthly budget, default $200, with weekly pacing = monthly budget × 7 ÷ calendar days in month. Needs count too. Actual checkout totals include tax and shipping. Waiting wishes are estimates, not spending or verified cash savings. No rollover.

Spending includes dated purchases, corrections, partial refunds, refund corrections, monthly totals, and a monthly history table. Refunds count when received. Refunds must not precede their purchase and cannot exceed its total; purchases cannot be corrected below their refunds. Legacy full refunds remain supported. Record corrections preserve the original timestamp when the date is unchanged.

Actual configured budgets are stored per month from this version onward. Older months may only have a lowest-budget reward baseline, identified in the month summary; unknown budgets are not invented.

### Rewards

| Action | XP | Dewdrops |
| --- | ---: | ---: |
| Meaningful reflection, once per eligible item | 5 | 0 |
| Wait 1 day | 5 | 2 |
| Wait 7 days | 15 | 5 |
| Wait 30 days | 40 | 15 |
| Skip after 3 days | 15 | 8 |
| Daily purchase confirmation | 2 | 0 |
| Completed tracked-week confirmation | 10 | 3 |
| Completed week on cumulative monthly pace | 25 | 10 |
| Completed tracked month within budget | 100 | 40 |

Item rewards apply to the first 3 additions each local day and 10 each local month, without regard to price. Milestones pay once. Buying stops future waiting rewards and reverses skip currency if previously awarded. Patience XP and plants remain. A negative Dewdrop balance is repaid by future earnings.

Spending confirmation settles the immediately preceding Monday–Sunday week when wholly within the current month, and the preceding complete calendar month. Only complete periods tracked by the app qualify. Old missed weekly periods are not paid retroactively. Reward eligibility uses the lowest configured budget in the month; a settled award freezes its threshold.

This version records enough information to reconcile newly settled budget bonuses after backdated entries or corrections. Currency adjusts when eligibility changes. XP is added at most once and never taken away. Bonuses earned by older starter versions lack the audit history needed to reconcile them and are kept unchanged. Restoring old backups or editing the device clock can change personal scores; this is not a competitive or verified financial ledger.

## Garden progression

Plants: sundew 15 Dewdrops, flytrap 35, pitcher plant 60. Start with a free sundew. Plant growth: juvenile at 15, mature at 40. Every 100 gardener XP adds one level.

| Upgrade | Level | Cost | Benefit |
| --- | ---: | ---: | --- |
| Moss-covered pot style | 2 | 15 | Reusable cosmetic style |
| Blue-glazed pot style | 3 | 30 | Reusable cosmetic style |
| Bog bed | 4 | 80 | 12 plant spaces; +1 daily watering growth |
| Lily pond | 8 | 150 | Requires bog; 16 spaces; another +1 watering growth |

Terracotta pots are free. Styles are unlocked once and can be used on any potted plant. Owned bog beds allow plants to move between pots and shared soil without losing growth. The pond includes lilies, reeds, ripples, and a dragonfly. Upgrades cost game currency only.

Daily watering adds 2 growth plus 1 for each owned habitat to every plant. Fertilizer costs 5 and adds 3 growth to all plants. Missed days never kill plants.

Real insect catches are calculated on visits, with at most 2 days of catch-up, recent-watering requirements, and greater catch chances for developed plants. Catches add growth, not currency. Gnats, flies, and moths wander visibly. Real catch events replay a species-specific animation; the visual replay never awards growth again. Watch a catch previews each species without changing resources. Pause controls and system reduced-motion preferences stop animations.

## Storage, backups, installation, and updates

Versioned JSON remains under `patient-garden-v1` in localStorage. New fields are optional so earlier backups still load. There is no account, bank connection, purchase-history sync, or garden backend database. This is same-origin browser storage, not an encrypted vault; clearing site data can remove it.

Settings exports/imports JSON. Imports validate before asking to replace the local garden. Invalid imports preserve prior data. Cross-tab saves detect a newer stored version and refuse to overwrite it; reload to pick up the other tab's changes.

The app displays offline/cache status, browser installation help, and an Install button when supported. A new service worker waits for the user to choose Update app; updates preserve local storage. Old garden asset caches are removed on activation. Production HTTPS or localhost and an initial online visit are needed for offline installation. Offline short-link expansion is unavailable; ordinary capture remains usable.

Preview URLs and the production site are separate origins and therefore separate gardens. Export/import to move a garden. Do not assume preview data will automatically appear after production deployment.

## Verification

- 384 tests passed; TypeScript compiled; Vite built; 22 routes prerendered.
- Added tests for Amazon link normalization, explicit shared prices, unsafe short-link redirects, partial refunds and over-refunds, correction-aware bonuses, old refunds/backups, habitat locks, costs, and capacity.
- Chrome at 390 × 844 and desktop: shared draft capture, ASIN duplicate blocking, editable reflection rewarded once with original timer, checkout correction with existing refunds, partial/refund correction, invalid correction preserving data, historical month selection, export/import, pot/habitat purchases and arrangement, no horizontal overflow, no JavaScript page errors.
- Production-browser checks: offline-ready status, offline reload retaining habitats and records, explicit update offer with saved item preserved across update, and protection from stale-tab overwrites. Chrome's installability check returned no blocking errors.
- Earlier visual checks covered all three catch previews without reward changes, actual catch growth exactly once, no catch replay on reload, pause, and reduced-motion behavior.
- Physical iPhone/Android installation, OS share-sheet exposure, and real device background/update behavior need the phone checklist alongside the Vercel preview.

## Mobile navigation update

Today is a compact dashboard with budget status, add/review wishes, watering, patience collection, and a garden shortcut. The complete garden and spending records live in their own tabs. Adding/editing a wish opens a dedicated screen; drafts survive switching tabs until saved or canceled. Shared product links open that capture screen directly.

On phones the five tabs stay fixed at the bottom with safe-area padding, and changing screens returns to the top. Garden and Shop & upgrades are separate views. Installation instructions and reward explanations are tucked into Settings. Desktop navigation stays at the top.

Verified at 320 × 640, 390 × 844, and 430 × 932: no horizontal overflow and reachable navigation. Today fits one viewport at 390 × 844 and 430 × 932; the 320 × 640 layout requires a short scroll. Browser checks covered capture, draft preservation, editing, garden/shop separation, Settings-only help, watering, shared drafts, and offline persistence. All 384 tests and the production build passed. These changes still need to be pushed to update the hosted preview.
