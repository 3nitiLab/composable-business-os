// GET /api/metrics  ->  dashboard payload
//
// Swap the seed file for your real source (Postgres, Stripe, Square, Airtable,
// a CRM API...) by replacing loadData() below. Keep the response shape the same
// and the front end needs no changes.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SEED = fileURLToPath(new URL("../../data/seed.json", import.meta.url));

async function loadData() {
  return JSON.parse(await readFile(SEED, "utf8"));
}

export default async (request) => {
  const data = await loadData();

  // Optional ?range=30d|90d|12m - trims the series so the range switcher is live.
  const range = new URL(request.url).searchParams.get("range") || "6m";
  const keep = { "30d": 1, "90d": 3, "6m": 6, "12m": 12 }[range] ?? 6;
  data.revenueSeries = data.revenueSeries.slice(-keep);
  data.range = range;
  data.generatedAt = new Date().toISOString();

  return Response.json(data, {
    headers: { "cache-control": "no-store" },
  });
};

export const config = { path: "/api/metrics" };
