// Solution -> portfolio card. One page per business; several cards make a portfolio.

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const PHONE_NOTE = "A progressive web app runs in the phone browser and can be added to the home screen to open like an app. " +
  "Push notifications and reminders can be added and enabled with permission; they are not switched on until the owner asks.";

export function card(s) {
  const showStatus = new Set(s.screens.map(x => x.status)).size > 1;
  return `<section class="card">
  <div class="who">${esc(s.first)}</div>
  <h1>${esc(s.business)}</h1>
  <p class="tag">${esc(s.tagline)}</p>
  ${s.status ? `<p class="status">${esc(s.status)}</p>` : ""}
  <dl>
    <dt>Business</dt><dd>${esc(s.about)}</dd>
    <dt>Pain points</dt><dd>${s.pains.map(esc).join(" ")}</dd>
  </dl>
  <h2>Tech stack</h2>
  <p class="stack">${s.stack.map(esc).join(" · ")}</p>
  <table>
    <thead><tr><th>Screen / module</th><th>Features</th>${showStatus ? "<th>Status</th>" : ""}</tr></thead>
    <tbody>${s.screens.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.features)}</td>${showStatus ? `<td class="st">${esc(x.status)}</td>` : ""}</tr>`).join("")}</tbody>
  </table>
  ${!showStatus && s.screens[0] ? `<p class="rowstatus">All screens: ${esc(s.screens[0].status)}.</p>` : ""}
  ${s.phoneNote ? `<p class="note"><b>Phone app</b> ${esc(PHONE_NOTE)}</p>` : ""}
  <p class="spec">Build spec: ${s.studioConfig.modules.length} catalog capabilities → ${s.tables.length} tables${s.source ? ` · Source: ${esc(s.source)}` : ""}</p>
</section>`;
}

export function page(solutions, title = "3nitiLab — Portfolio") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { --ink:#1b1b1b; --muted:#5c5c5c; --rule:#d9d9d9; --accent:#2a78d6; --bg:#fff; }
  @media (prefers-color-scheme: dark) { :root { --ink:#ececec; --muted:#a8a8a8; --rule:#3a3a3a; --accent:#3987e5; --bg:#161616; } }
  @media print { :root { --ink:#1b1b1b; --muted:#5c5c5c; --rule:#d9d9d9; --accent:#2a78d6; --bg:#fff; } }
  @page { size: letter; margin: 0.6in; }
  body { margin:0; background:var(--bg); color:var(--ink); font: 10.5pt/1.45 -apple-system, "Helvetica Neue", Arial, sans-serif; }
  .card { max-width: 7.4in; margin: 0 auto; padding: 16px; break-after: page; }
  .card:last-child { break-after: auto; }
  .who { font-size: 26pt; font-weight: 800; letter-spacing: .06em; margin-bottom: 18px; }
  h1 { font-size: 17pt; margin: 0; }
  .tag { margin: 2px 0 10px; color: var(--muted); }
  .status { display:inline-block; margin:0 0 12px; padding:2px 8px; border:1px solid var(--accent); color:var(--accent); border-radius:10px; font-size:9pt; }
  dl { display:grid; grid-template-columns: 1.1in 1fr; gap: 6px 14px; margin: 0 0 14px; }
  dt { font-size: 8.5pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding-top: 2px; }
  dd { margin: 0; }
  h2 { font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; margin: 14px 0 4px; }
  .stack { margin: 0 0 14px; }
  table { width:100%; border-collapse: collapse; }
  th { text-align:left; font-size: 8.5pt; letter-spacing:.08em; text-transform: uppercase; border-bottom: 1.5px solid var(--ink); padding: 6px 8px 6px 0; }
  td { vertical-align: top; border-bottom: 1px solid var(--rule); padding: 7px 8px 7px 0; }
  td:first-child { width: 1.9in; font-weight: 600; }
  td.st { width: 1in; color: var(--muted); font-size: 9pt; }
  .rowstatus, .spec { color: var(--muted); font-size: 8.5pt; margin: 6px 0 0; }
  .note { font-size: 8.5pt; color: var(--muted); margin-top: 14px; }
  .note b { color: var(--ink); text-transform: uppercase; letter-spacing: .08em; margin-right: 4px; }
  @media (max-width: 600px) { dl { grid-template-columns: 1fr; } td:first-child { width: auto; } }
</style></head><body>
${solutions.map(card).join("\n")}
</body></html>`;
}

export function markdown(s) {
  return [
    `# ${s.first}`, "", `## ${s.business}`, `*${s.tagline}*`, "",
    s.status ? `**Status:** ${s.status}\n` : "",
    `**BUSINESS** ${s.about}`, "",
    `**PAIN POINTS** ${s.pains.join(" ")}`, "",
    `**TECH STACK** ${s.stack.join(" · ")}`, "",
    `| Screen / module | Features | Status |`, `|---|---|---|`,
    ...s.screens.map(x => `| ${x.name} | ${x.features.replace(/\|/g, "\\|")} | ${x.status} |`), "",
    s.phoneNote ? `**PHONE APP** ${PHONE_NOTE}\n` : "",
    `Build spec: ${s.studioConfig.modules.length} capabilities → ${s.tables.length} tables. Studio config: \`${JSON.stringify(s.studioConfig.modules)}\``,
    s.source ? `\nSource: ${s.source}` : "",
  ].join("\n");
}
