#!/usr/bin/env node
// Intake: ask the questions, get back a proposed solution card.
//
//   node intake/run.mjs                          ask interactively, save answers, render
//   node intake/run.mjs answers.json [...]       render from saved answers (no questions)
//   node intake/run.mjs --fill answers.json      ask only the questions still unanswered
//   options:  --out <dir>   where to write (default intake/out)
//             --pdf         also print a PDF with Chrome
//             --screens     list screen ids (for the "built" answer)

import { createInterface } from "node:readline";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { QUESTIONS } from "./questions.js";
import { buildSolution, SCREENS } from "./solution.js";
import { page, markdown } from "./render.js";

const argv = process.argv.slice(2);
const flag = f => { const i = argv.indexOf(f); if (i < 0) return null; argv.splice(i, 1); return true; };
const opt = f => { const i = argv.indexOf(f); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };

const outDir = opt("--out") ?? path.join(path.dirname(new URL(import.meta.url).pathname), "out");
const wantPdf = flag("--pdf");
const fillPath = opt("--fill");
if (flag("--screens")) { for (const s of SCREENS) console.log(s.id); process.exit(0); }

const slug = s => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(q, raw) {
  const v = raw.trim();
  if (!v) return q.default ?? (q.type === "list" || q.type === "many" ? [] : undefined);
  switch (q.type) {
    case "list":   return v.split(",").map(x => x.trim()).filter(Boolean);
    case "many":   return v.split(",").map(x => x.trim()).filter(x => q.options.some(o => o.id === x));
    case "one":    return q.options.some(o => o.id === v) ? v : undefined;
    case "number": return Number.isFinite(+v) ? +v : undefined;
    case "yesno":  return /^y/i.test(v);
    default:       return v;
  }
}

async function ask(answers = {}) {
  const rl = createInterface({ input: process.stdin, terminal: process.stdin.isTTY });
  const lines = rl[Symbol.asyncIterator]();
  const question = async prompt => { process.stdout.write(prompt); const r = await lines.next(); return r.done ? "" : r.value; };
  for (const q of QUESTIONS) {
    if (q.id in answers) continue;
    if (q.when && !q.when(answers)) continue;
    let hint = "";
    if (q.options) hint = "\n" + q.options.map(o => `    ${o.id.padEnd(14)} ${o.label}`).join("\n") + `\n  ${q.type === "many" ? "(ids, comma-separated)" : "(id)"}`;
    else if (q.type === "list") hint = " (comma-separated)";
    else if (q.type === "yesno") hint = " (y/n)";
    let raw = await question(`\n${q.ask}${hint}\n> `);
    while (q.type === "one" && raw.trim() && parse(q, raw) === undefined)
      raw = await question(`  Not one of: ${q.options.map(o => o.id).join(", ")}\n> `);
    const v = parse(q, raw);
    if (v !== undefined) answers[q.id] = v;
  }
  rl.close();
  return answers;
}

await mkdir(outDir, { recursive: true });

let sets = [];
if (fillPath) {
  const a = await ask(JSON.parse(await readFile(fillPath, "utf8")));
  await writeFile(fillPath, JSON.stringify(a, null, 2));
  sets.push(a);
} else if (argv.length) {
  for (const f of argv) sets.push(JSON.parse(await readFile(f, "utf8")));
} else {
  const a = await ask();
  const f = path.join(outDir, `${slug(a.business || "intake")}.answers.json`);
  await writeFile(f, JSON.stringify(a, null, 2));
  console.log(`\nAnswers saved: ${f}`);
  sets.push(a);
}

const solutions = sets.map(buildSolution);
const written = [];
for (const s of solutions) {
  const base = path.join(outDir, slug(s.business));
  await writeFile(base + ".html", page([s], `${s.business} — proposed solution`));
  await writeFile(base + ".md", markdown(s));
  await writeFile(base + ".studio.json", JSON.stringify(s.studioConfig, null, 2));
  written.push(base + ".html");
}
if (solutions.length > 1) {
  const f = path.join(outDir, "portfolio.html");
  await writeFile(f, page(solutions));
  written.push(f);
}

if (wantPdf) {
  const chrome = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
  if (!chrome) console.error("No Chrome found; skipping PDF.");
  else for (const html of written) {
    const pdf = html.replace(/\.html$/, ".pdf");
    execFileSync(chrome, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdf}`, "file://" + html], { stdio: "ignore" });
    console.log("PDF:", pdf);
  }
}
for (const f of written) console.log("Wrote:", f);
