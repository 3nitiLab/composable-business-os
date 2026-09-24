# Composable Business OS

**A scoping tool for delivering operational software to businesses too small to
afford bespoke development and too specific for an off-the-shelf platform.**

Pick the capabilities a business actually needs. Dependencies resolve themselves.
Out comes a complete build specification — data model, route map, per-capability
requirements — and a live preview the client can see before anything is built.

📖 **[METHODOLOGY.md](METHODOLOGY.md) is the point of this repository.** The code is
a reference implementation; the method is what transfers to your own market.

---

## Why

A two-chair med spa or a three-van plumbing outfit has two options: an all-in-one
platform at $97–$297/month per seat where 80% goes unused and the 20% they need
doesn't fit, or a bespoke build whose discovery phase alone costs more than the
business clears in a quarter.

The cost that makes bespoke delivery impossible isn't writing code — it's **scoping**.
This tool does the domain modelling once, so each engagement becomes a selection
problem instead of a design problem.

## What's in the catalog

**49 capabilities → 111 tables**, organised by customer lifecycle rather than by
engineering concern, because owners buy outcomes at a stage:

| Stage | Capabilities | Examples |
|---|---|---|
| Capture | 12 | forms, funnels, AI voice receptionist, call tracking, missed-call text-back, prospecting audit |
| Nurture | 8 | unified inbox, conversation AI, agent studio, pipelines, workflows, booking, reminders |
| Close | 9 | estimates, invoicing, text-2-pay, deposits, memberships, order forms, products |
| Evangelize | 6 | reviews, automated review requests, AI replies, referrals, loyalty, client portal |
| Reactivate | 6 | broadcasts, smart lists, lifecycle campaigns, database reactivation, checkout recovery |
| Operations | 8 | dashboard, tasks, reporting, attribution, team & permissions, multi-location, compliance |

Every capability carries its own data model, its structural dependencies, and a build
specification. Selecting one pulls in what it cannot exist without — no AI reply
assistant without an inbox, no attribution without lead sources.

## Run it

```bash
npx netlify-cli dev
```

Then open http://localhost:8888. `/` is the Studio; `/app.html` is the composed
preview.

## Non-negotiables baked into every generated spec

Money in integer cents. UTC storage, local rendering. Loading, empty and error states
on every list. A confirm step before anything destructive. Row-level security on every
table. **Consent enforced at the data layer** — a send to a non-consenting contact is
structurally impossible, not merely discouraged. One shared chart axis, never dual.
Status as a labelled chip, never colour alone.

## Retarget it to your market

Replace `CATEGORIES` and `MODULES` in [`public/modules.js`](public/modules.js), and
the non-negotiables block in `netlify/functions/scaffold.mjs`. The resolver, preview
and generator are domain-agnostic. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Where to customize

| What | File |
|---|---|
| The capability catalog | `public/modules.js` |
| Generated spec wording, design rules, non-negotiables | `netlify/functions/scaffold.mjs` |
| Demo data behind the preview | `data/seed.json` |
| Real data — swap `loadData()` for your DB/Stripe/CRM call | `netlify/functions/metrics.mjs` |
| Colors, spacing, both themes | `public/styles.css` |

`public/modules.js` is imported by the browser *and* by the Netlify function, so a
capability added there appears everywhere at once.

## Charts

Hand-rolled inline SVG, no chart library. Series colours are validated for colourblind
separation and contrast against both surfaces (blue `#2a78d6` / orange `#eb6834` light,
`#3987e5` / `#d95926` dark). One shared axis per chart, never dual-axis.

## Who made this

Built and published by [3NITILAB, LLC](https://3nitilab.com). 3nitiLab sells
implementation services, not software — which is why this is public. The method is
more useful shared.

MIT licensed. See [LICENSE](LICENSE).
