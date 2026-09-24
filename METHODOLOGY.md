# Composable Business OS — the method

A method for scoping and delivering operational software to businesses too small to
afford bespoke development and too specific to be served by an off-the-shelf platform.

This document is the point of the repository. The code is a reference implementation;
the method is what transfers.

---

## The problem this solves

A microenterprise — a two-chair med spa, a three-van plumbing outfit, a solo
paralegal — has two options for operational software:

| Route | What goes wrong |
|---|---|
| All-in-one platform | $97–$297/month per seat, 80% of it unused, and the 20% they need doesn't match how they actually work. |
| Bespoke build | A discovery phase alone costs more than the business clears in a quarter. |

Most of them end up on a third route: a spreadsheet, a paper book, and a phone that
nobody answers after 5pm.

The cost that makes bespoke delivery impossible is not writing the code. It is
**scoping** — the weeks of discovery, the requirements that emerge halfway through,
the data model that has to be rebuilt when a feature nobody mentioned turns out to
be load-bearing. This method attacks that cost.

---

## The core idea

Treat the application as a **composition of pre-modelled capabilities** rather than a
bespoke design. Do the modelling work once, for the whole domain. Then each
engagement is a selection problem, not a design problem.

A capability in the catalog is not a feature name. It is a record carrying:

```js
{
  id: "reviewrequests",
  name: "Automated review requests",
  cat: "evangelize",
  blurb: "Ask right after the visit, when goodwill is highest.",
  tables: ["review_request"],          // what it adds to the data model
  routes: ["/reviews/requests"],        // what it adds to the route map
  widgets: [],                          // what it contributes to the dashboard
  needs: ["reputation", "automation"],  // what it cannot exist without
  prompt: "Automated review requests: trigger an SMS or email a configurable
           delay after a completed appointment or paid invoice, suppress anyone
           already asked in the last N months, and report request-to-review
           conversion.",
}
```

The `needs` edge is what makes this more than a checklist. Selecting a capability
pulls in everything it structurally depends on, so a client cannot select an
incoherent system. You cannot have an AI reply assistant without a message inbox.
You cannot have attribution reporting without lead-source tracking. You cannot have
review requests without both a review store and an automation engine.

---

## The four steps

### 1. Model the domain once

Enumerate the capabilities a business in your target market can need — not the ones
you feel like building. Derive them from the incumbent platform's *shipping product*,
not its marketing site. (In this catalog's case that review surfaced eight
capabilities present in the product and absent from all public materials.)

Organise by **customer lifecycle stage**, not by engineering concern. A business owner
buys an outcome at a stage — "people book and don't show up" — not a subsystem. The
stages used here: Capture, Nurture, Close, Evangelize, Reactivate, Operations.

### 2. Give each capability a data model and a dependency edge

This is the step people skip, and it is the step that pays. Naming a feature is free.
Committing to `tables`, `routes` and `needs` forces you to decide what the thing
actually is before a client is in the room. Dependencies are structural — "cannot
exist without" — never "nice to have alongside."

### 3. Compose per engagement

Selection resolves transitively to a closed set, which generates:

- the data model (union of all `tables`, plus multi-tenancy and row-level security)
- the route map (union of all `routes`)
- per-capability functional requirements
- a live preview the client sees *before* anything is built

Scoping becomes a conversation over a screen instead of a discovery phase.

### 4. Encode the non-negotiables as defaults, not options

Every generated specification carries the same floor, so it is never a per-project
decision and never something a junior implementer forgets:

- Money in integer cents. Never floats.
- Timestamps stored UTC, rendered in the business's local timezone.
- Loading, empty and error state on every list view.
- A confirmation step before any destructive action.
- Row-level security scoped to the tenant on every table.
- **Consent enforced at the data layer** — a send to a non-consenting contact must
  be structurally impossible, not merely discouraged by the UI.
- Charts: one shared axis, never dual-axis. Status shown as a labelled chip, never
  colour alone.

A two-person business inherits the data-handling posture of a far larger
organisation without employing anyone to maintain it.

---

## What this method is not

- **Not a no-code builder.** The output is a specification for a real build.
- **Not a product.** 3NITILAB, LLC sells implementation services. This is published
  because the method is more useful shared than hoarded, and publishing costs a
  service practice nothing.
- **Not novel in its parts.** Module catalogs, dependency graphs and scaffolding are
  all old. The contribution is applying them to *scoping* rather than to codegen, in
  a market where scoping cost is the binding constraint.

---

## Adapting it to your own market

The catalog in `public/modules.js` targets local service businesses. To retarget:

1. Replace `CATEGORIES` with your market's lifecycle stages.
2. Replace `MODULES` with your domain's capabilities. Keep the shape — `tables`,
   `routes`, `needs`, `prompt` — because the composition engine reads it.
3. Rewrite the non-negotiables block in `netlify/functions/scaffold.mjs` to your
   market's floor. A legal practice's floor is not a med spa's.

Nothing else needs to change. The resolver, the preview and the generator are
domain-agnostic.

---

## Contributing a capability

See [CONTRIBUTING.md](CONTRIBUTING.md). Capability definitions from practitioners in
other verticals are the most useful contribution — a catalog is worth more the more
markets it covers.
