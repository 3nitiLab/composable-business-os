// POST /api/scaffold  { business, modules: [id], stack }
// -> { config, prompt, tree }   the paste-into-Lovable spec for the chosen modules.

import { MODULES, byId, resolve, CATEGORIES } from "../../public/modules.js";

const STACKS = {
  lovable:  "React + Vite + Tailwind + shadcn/ui, Supabase for auth, storage and Postgres with row-level security",
  next:     "Next.js App Router + Tailwind + shadcn/ui, Postgres via Prisma",
  static:   "Static HTML/CSS/JS on Netlify with Netlify Functions and a hosted Postgres",
};
function buildPrompt({ business, ids, stack }) {
  const mods = ids.map(id => byId[id]).filter(Boolean);
  const tables = [...new Set(mods.flatMap(m => m.tables))];
  const routes = [...new Set(mods.flatMap(m => m.routes))];

  const sections = CATEGORIES.map(c => {
    const inCat = mods.filter(m => m.cat === c.id);
    if (!inCat.length) return null;
    return `### ${c.label}\n\n` + inCat.map(m => `**${m.name}** — ${m.prompt}`).join("\n\n");
  }).filter(Boolean).join("\n\n");

  return `# ${business} — Business OS

Build an internal operations app for a small business. Stack: ${STACKS[stack] ?? STACKS.lovable}.

## Scope

${mods.length} modules, listed below. Build only these — do not invent extra pages.

${sections}

## Data model

Create these tables, each with \`id\`, \`created_at\`, and an \`org_id\` foreign key for multi-tenancy:

${tables.map(t => `- \`${t}\``).join("\n")}

Enable row-level security on every table, scoped to the signed-in user's \`org_id\`.

## Routes

${routes.map(r => `- \`${r}\``).join("\n")}

## Design direction

- Sidebar navigation grouped as ${CATEGORIES.map(c => c.label).join(" / ")}; content area max 1440px.
- Light and dark themes, both deliberately chosen — dark is not an inverted light.
- Charts: one shared axis per chart, never dual-axis. Two series max per chart, blue \`#2a78d6\` and orange \`#eb6834\` in light, \`#3987e5\` / \`#d95926\` in dark. A legend whenever there are 2+ series.
- Tabular numbers everywhere a figure appears. Status as a coloured chip with a text label, never colour alone.
- Empty states carry the primary action, not just an illustration.

## Non-negotiables

- Every list view has a loading, empty and error state.
- No destructive action without a confirm step.
- All money stored in integer cents; never floats.
- Timestamps in UTC, rendered in the business's local timezone.
`;
}

function buildTree(ids) {
  const mods = ids.map(id => byId[id]).filter(Boolean);
  return [
    "src/",
    "  App.tsx",
    "  components/ui/          # shadcn primitives",
    "  components/charts/      # Bar, HBar, KpiTile, Tooltip",
    "  lib/supabase.ts",
    "  pages/",
    ...mods.map(m => `    ${m.id}/${" ".repeat(Math.max(1, 16 - m.id.length))}# ${m.name}`),
    "supabase/",
    "  migrations/0001_init.sql",
  ].join("\n");
}

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "POST a { business, modules, stack } body." }, { status: 405 });
  }
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Body must be JSON." }, { status: 400 }); }

  const known = new Set(MODULES.map(m => m.id));
  const requested = (Array.isArray(body.modules) ? body.modules : []).filter(id => known.has(id));
  const ids = resolve(requested);
  const business = String(body.business || "My Business").slice(0, 80);
  const stack = ["lovable", "next", "static"].includes(body.stack) ? body.stack : "lovable";

  const added = ids.filter(id => !requested.includes(id));

  return Response.json({
    config: { business, stack, modules: ids },
    addedByDependency: added,
    tables: [...new Set(ids.map(id => byId[id]).flatMap(m => m.tables))],
    prompt: buildPrompt({ business, ids, stack }),
    tree: buildTree(ids),
  });
};

export const config = { path: "/api/scaffold" };
